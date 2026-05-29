import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Claim, ClaimStatus } from '../../entities/claim.entity';
import { FraudService } from '../fraud/fraud.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ClaimsService {
  private readonly logger = new Logger(ClaimsService.name);

  constructor(
    @InjectRepository(Claim)
    private claimRepository: Repository<Claim>,
    private fraudService: FraudService,
    private dataSource: DataSource,
  ) {}

  async submitClaim(tenantId: string, organizationId: string, dto: CreateClaimDto): Promise<Claim> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const claim = queryRunner.manager.create(Claim, {
        tenantId,
        organizationId,
        claimNumber: `CLM-${Date.now()}`,
        type: dto.type,
        status: ClaimStatus.SUBMITTED,
        policyId: dto.policyId,
        claimantName: dto.claimantName,
        claimantEmail: dto.claimantEmail,
        claimantPhone: dto.claimantPhone,
        claimDate: new Date(dto.claimDate),
        incidentDate: dto.incidentDate ? new Date(dto.incidentDate) : null,
        description: dto.description,
        claimAmount: dto.claimAmount,
        attachmentIds: dto.attachmentIds || [],
        metadata: dto.metadata || {},
      });

      const savedClaim = await queryRunner.manager.save(claim);

      // Perform fraud analysis
      const fraudScore = await this.fraudService.analyzeClaimForFraud(tenantId, savedClaim.id);

      // Check for anomalies
      const anomalies = await this.fraudService.detectAnomalies(
        tenantId,
        'CLAIM',
        savedClaim.id,
      );

      // Update claim with fraud analysis
      savedClaim.fraudScore = fraudScore.overallScore;
      savedClaim.aiAnalysis = {
        fraudAnalysis: fraudScore,
        detectedAnomalies: anomalies,
        analysisTimestamp: new Date(),
      };

      if (fraudScore.overallScore > 0.7) {
        savedClaim.status = ClaimStatus.UNDER_REVIEW;
        savedClaim.flaggedForFraud = true;
        savedClaim.fraudIndicators = fraudScore.topIndicators;
      } else {
        savedClaim.status = ClaimStatus.RECEIVED;
      }

      await queryRunner.manager.save(savedClaim);
      await queryRunner.commitTransaction();

      this.logger.log(`Claim submitted: ${savedClaim.claimNumber}`);

      return savedClaim;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getClaim(tenantId: string, claimId: string): Promise<Claim> {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId, tenantId },
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    return claim;
  }

  async listClaims(
    tenantId: string,
    organizationId: string,
    pagination: PaginationDto,
  ) {
    const query = this.claimRepository
      .createQueryBuilder('claim')
      .where('claim.tenantId = :tenantId', { tenantId });

    if (organizationId) {
      query.andWhere('claim.organizationId = :organizationId', { organizationId });
    }

    const total = await query.getCount();

    const claims = await query
      .orderBy('claim.createdAt', 'DESC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .getMany();

    return {
      data: claims,
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages: Math.ceil(total / pagination.limit),
    };
  }

  async approveClaim(
    tenantId: string,
    claimId: string,
    approvedAmount: number,
  ): Promise<Claim> {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId, tenantId },
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (claim.flaggedForFraud) {
      throw new BadRequestException('Cannot approve claim flagged for fraud');
    }

    claim.status = ClaimStatus.APPROVED;
    claim.approvedAmount = approvedAmount;

    await this.claimRepository.save(claim);
    this.logger.log(`Claim approved: ${claimId}, amount: ${approvedAmount}`);

    return claim;
  }

  async denyClaim(tenantId: string, claimId: string, reason: string): Promise<Claim> {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId, tenantId },
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    claim.status = ClaimStatus.DENIED;
    claim.notes = reason;

    await this.claimRepository.save(claim);
    this.logger.log(`Claim denied: ${claimId}`);

    return claim;
  }

  async processPayout(tenantId: string, claimId: string, amount: number): Promise<Claim> {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId, tenantId },
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (claim.status !== ClaimStatus.APPROVED) {
      throw new BadRequestException('Claim must be approved before payout');
    }

    claim.paidAmount = (claim.paidAmount || 0) + amount;
    claim.status = claim.paidAmount >= (claim.approvedAmount || 0)
      ? ClaimStatus.PAID
      : ClaimStatus.APPROVED;

    await this.claimRepository.save(claim);
    this.logger.log(`Payout processed: ${claimId}, amount: ${amount}`);

    return claim;
  }

  async getClaimMetrics(tenantId: string, organizationId?: string) {
    const query = this.claimRepository
      .createQueryBuilder('claim')
      .where('claim.tenantId = :tenantId', { tenantId });

    if (organizationId) {
      query.andWhere('claim.organizationId = :organizationId', { organizationId });
    }

    const claims = await query.getMany();

    return {
      totalClaims: claims.length,
      submittedClaims: claims.filter((c) => c.status === ClaimStatus.SUBMITTED).length,
      underReviewClaims: claims.filter((c) => c.status === ClaimStatus.UNDER_REVIEW).length,
      approvedClaims: claims.filter((c) => c.status === ClaimStatus.APPROVED).length,
      deniedClaims: claims.filter((c) => c.status === ClaimStatus.DENIED).length,
      paidClaims: claims.filter((c) => c.status === ClaimStatus.PAID).length,
      totalClaimAmount: claims.reduce((sum, c) => sum + Number(c.claimAmount), 0),
      totalApprovedAmount: claims.reduce((sum, c) => sum + Number(c.approvedAmount || 0), 0),
      totalPaidAmount: claims.reduce((sum, c) => sum + Number(c.paidAmount || 0), 0),
      fraudFlaggedClaims: claims.filter((c) => c.flaggedForFraud).length,
      averageFraudScore:
        claims.length > 0 ? claims.reduce((sum, c) => sum + c.fraudScore, 0) / claims.length : 0,
      averageDaysInProcess: claims.length > 0
        ? claims.reduce((sum, c) => sum + c.getDaysInProcess(), 0) / claims.length
        : 0,
    };
  }
}
