import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from '../../entities/user.entity';
import { Organization } from '../../entities/organization.entity';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockOrganizationRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: mockOrganizationRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        organizationId: 'org-123',
      };

      mockOrganizationRepository.findOne.mockResolvedValue({ id: 'org-123' });
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ ...registerDto, id: 'user-1' });
      mockUserRepository.save.mockResolvedValue({ ...registerDto, id: 'user-1' });
      mockJwtService.sign.mockReturnValue('access-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
    });

    it('should throw error if user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        organizationId: 'org-123',
      };

      mockUserRepository.findOne.mockResolvedValue({ id: 'user-1', email: 'existing@example.com' });

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });

    it('should hash password before saving', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        organizationId: 'org-123',
      };

      mockOrganizationRepository.findOne.mockResolvedValue({ id: 'org-123' });
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ ...registerDto, id: 'user-1' });
      mockUserRepository.save.mockResolvedValue({ ...registerDto, id: 'user-1' });
      mockJwtService.sign.mockReturnValue('access-token');

      await service.register(registerDto);

      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed-password',
        validatePassword: jest.fn().mockResolvedValue(true),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error on invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should issue new access token', async () => {
      const refreshToken = 'valid-refresh-token';
      const decoded = { sub: 'user-1', email: 'test@example.com' };

      mockJwtService.verify.mockReturnValue(decoded);
      mockJwtService.sign.mockReturnValue('new-access-token');

      const result = await service.refreshToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
    });

    it('should throw error on invalid refresh token', async () => {
      const refreshToken = 'invalid-token';

      mockJwtService.verify.mockThrow(new Error('Invalid token'));

      await expect(service.refreshToken(refreshToken)).rejects.toThrow();
    });
  });
});
