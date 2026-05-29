import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { Organization } from '../../entities/organization.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // Create organization if not provided
      let organization: Organization;
      if (dto.organizationId) {
        organization = await this.organizationRepository.findOne({
          where: { id: dto.organizationId },
        });
        if (!organization) {
          throw new BadRequestException('Organization not found');
        }
      } else {
        // Create new organization for user
        organization = this.organizationRepository.create({
          tenantId: dto.tenantId,
          name: `${dto.firstName} ${dto.lastName}`,
          type: 'INSTITUTION',
        });
        await queryRunner.manager.save(organization);
      }

      // Create user
      const user = this.userRepository.create({
        email: dto.email,
        passwordHash: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        tenantId: dto.tenantId || organization.tenantId,
        organization,
        organizationId: organization.id,
        roles: [],
      });

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      this.logger.log(`User registered: ${user.email}`);

      // Generate tokens
      return this.generateAuthResponse(user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('user.email = :email', { email: dto.email })
      .andWhere('user.isActive = true')
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.validatePassword(dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check tenant if provided
    if (dto.tenantId && user.tenantId !== dto.tenantId) {
      throw new UnauthorizedException('Unauthorized for this tenant');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    this.logger.log(`User logged in: ${user.email}`);

    return this.generateAuthResponse(user);
  }

  async validateUser(id: string, tenantId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, tenantId, isActive: true },
      relations: ['roles', 'organization'],
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      });

      const user = await this.validateUser(decoded.sub, decoded.tenantId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(
    userId: string,
    tenantId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id: userId })
      .andWhere('user.tenantId = :tenantId', { tenantId })
      .getOne();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await user.validatePassword(currentPassword);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await this.userRepository.save(user);

    this.logger.log(`Password changed for user: ${user.email}`);
  }

  private async generateAuthResponse(user: User): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      roles: user.roles?.map((r) => r.name) || [],
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRY', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400, // 24 hours
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        roles: user.roles?.map((r) => r.name) || [],
      },
    };
  }
}
