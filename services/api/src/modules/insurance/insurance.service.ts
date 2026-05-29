import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Policy, PolicyStatus } from '../../entities/policy.entity';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class InsuranceService {
  private readonly logger = new Logger(InsuranceService.name);

  constructor(
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
  ) {}

  async createPolicy(
    tenantId: string,
    organizationId: string,
    dto: CreatePolicyDto,
  ): Promise<Policy> {
    // Check for duplicate policy number
    const existingPolicy = await this.policyRepository.findOne({
      where: { tenantId, policyNumber: dto.policyNumber },
    });

    if (existingPolicy) {
      throw new BadRequestException('Policy number already exists');
    }

    const effectiveDate = new Date(dto.effectiveDate);
    const expiryDate = new Date(effectiveDate);
    expiryDate.setMonth(expiryDate.getMonth() + (dto.renewalFrequencyMonths || 12));

    const policy = this.policyRepository.create({
      tenantId,
      organizationId,
      policyNumber: dto.policyNumber,
      type: dto.type,
      status: PolicyStatus.ACTIVE,
      holderName: dto.holderName,
      holderEmail: dto.holderEmail,
      holderPhone: dto.holderPhone,
      premium: dto.premium,
      renewalFrequencyMonths: dto.renewalFrequencyMonths || 12,
      effectiveDate,
      expiryDate,
      nextRenewalDate: expiryDate,
      coverageAmount: dto.coverageAmount,
      deductible: dto.deductible || 0,
      coverages: dto.coverages,
      policyDocument: dto.policyDocument,
      metadata: dto.metadata,
    });

    const savedPolicy = await this.policyRepository.save(policy);
    this.logger.log(`Policy created: ${savedPolicy.policyNumber}`);

    return savedPolicy;
  }

  async getPolicy(tenantId: string, policyId: string): Promise<Policy> {
    const policy = await this.policyRepository.findOne({
      where: { id: policyId, tenantId },
    });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    return policy;
  }

  async listPolicies(
    tenantId: string,
    organizationId: string,
    pagination: PaginationDto,
  ) {
    const query = this.policyRepository
      .createQueryBuilder('policy')
      .where('policy.tenantId = :tenantId', { tenantId });

    if (organizationId) {
      query.andWhere('policy.organizationId = :organizationId', { organizationId });
    }

    const total = await query.getCount();

    const policies = await query
      .orderBy('policy.createdAt', 'DESC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .getMany();

    return {
      data: policies,
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages: Math.ceil(total / pagination.limit),
    };
  }

  async renewPolicy(tenantId: string, policyId: string): Promise<Policy> {
    const policy = await this.policyRepository.findOne({
      where: { id: policyId, tenantId },
    });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    const lastRenewalDate = policy.expiryDate;
    const newExpiryDate = new Date(lastRenewalDate);
    newExpiryDate.setMonth(newExpiryDate.getMonth() + policy.renewalFrequencyMonths);

    policy.lastRenewalDate = lastRenewalDate;
    policy.expiryDate = newExpiryDate;
    policy.nextRenewalDate = newExpiryDate;
    policy.status = PolicyStatus.ACTIVE;

    await this.policyRepository.save(policy);
    this.logger.log(`Policy renewed: ${policyId}`);

    return policy;
  }

  async cancelPolicy(tenantId: string, policyId: string, reason: string): Promise<Policy> {
    const policy = await this.policyRepository.findOne({
      where: { id: policyId, tenantId },
    });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    policy.status = PolicyStatus.CANCELLED;
    policy.cancelledAt = new Date();
    policy.metadata = { ...policy.metadata, cancellationReason: reason };

    await this.policyRepository.save(policy);
    this.logger.log(`Policy cancelled: ${policyId}`);

    return policy;
  }

  async getPortfolioMetrics(tenantId: string, organizationId?: string) {
    const query = this.policyRepository
      .createQueryBuilder('policy')
      .where('policy.tenantId = :tenantId', { tenantId });

    if (organizationId) {
      query.andWhere('policy.organizationId = :organizationId', { organizationId });
    }

    const policies = await query.getMany();

    const activePolicies = policies.filter((p) => p.isActive());
    const expiringPolicies = policies.filter((p) => p.isExpiringSoon());

    return {
      totalPolicies: policies.length,
      activePolicies: activePolicies.length,
      suspendedPolicies: policies.filter((p) => p.status === PolicyStatus.SUSPENDED).length,
      expiredPolicies: policies.filter((p) => p.status === PolicyStatus.EXPIRED).length,
      cancelledPolicies: policies.filter((p) => p.status === PolicyStatus.CANCELLED).length,
      expiringInThirtyDays: expiringPolicies.length,
      totalPremiumRevenue: policies.reduce((sum, p) => sum + Number(p.premium), 0),
      totalCoverageAmount: policies.reduce((sum, p) => sum + Number(p.coverageAmount), 0),
      averagePremium: policies.length > 0
        ? policies.reduce((sum, p) => sum + Number(p.premium), 0) / policies.length
        : 0,
      renewalsDue: policies.filter((p) => {
        const daysUntilRenewal = Math.floor(
          (p.nextRenewalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilRenewal <= 0 && daysUntilRenewal > -365;
      }).length,
    };
  }
}
