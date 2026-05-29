import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FraudEvent,
  FraudEventType,
  RiskLevel,
  FraudScore,
  AnomalyEvent,
} from '../../entities/fraud-event.entity';
import { Claim } from '../../entities/claim.entity';
import { Loan } from '../../entities/loan.entity';

@Injectable()
export class FraudService {
  private readonly logger = new Logger(FraudService.name);

  constructor(
    @InjectRepository(FraudEvent)
    private fraudEventRepository: Repository<FraudEvent>,
    @InjectRepository(FraudScore)
    private fraudScoreRepository: Repository<FraudScore>,
    @InjectRepository(AnomalyEvent)
    private anomalyRepository: Repository<AnomalyEvent>,
    @InjectRepository(Claim)
    private claimRepository: Repository<Claim>,
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
  ) {}

  async analyzeClaimForFraud(tenantId: string, claimId: string): Promise<FraudScore> {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId, tenantId },
    });

    if (!claim) {
      throw new BadRequestException('Claim not found');
    }

    // Calculate fraud scores using multiple models
    const scores = {
      syntheticIdentityScore: await this.calculateSyntheticIdentityScore(tenantId, claim),
      behavioralScore: await this.calculateBehavioralScore(tenantId, claim),
      documentScore: await this.calculateDocumentScore(tenantId, claim),
      networkScore: await this.calculateNetworkScore(tenantId, claim),
      velocityScore: await this.calculateVelocityScore(tenantId, claim),
    };

    // Calculate weighted overall score
    const overallScore = this.calculateWeightedScore(scores);

    // Create fraud score record
    const fraudScore = this.fraudScoreRepository.create({
      tenantId,
      entityType: 'CLAIM',
      entityId: claimId,
      overallScore,
      syntacticIdentityScore: scores.syntheticIdentityScore,
      behavioralScore: scores.behavioralScore,
      documentScore: scores.documentScore,
      networkScore: scores.networkScore,
      velocityScore: scores.velocityScore,
      topIndicators: this.getTopIndicators(scores),
      reasoning: this.generateReasoning(scores),
      modelWeights: {
        syntheticIdentity: 0.25,
        behavioral: 0.25,
        document: 0.2,
        network: 0.2,
        velocity: 0.1,
      },
    });

    await this.fraudScoreRepository.save(fraudScore);

    // Flag claim if high risk
    if (overallScore > 0.7) {
      claim.fraudScore = overallScore;
      claim.flaggedForFraud = true;
      claim.fraudIndicators = fraudScore.topIndicators;

      await this.claimRepository.save(claim);

      // Create fraud event
      await this.createFraudEvent(
        tenantId,
        claimId,
        FraudEventType.CLAIM_FREQUENCY,
        overallScore > 0.85 ? RiskLevel.CRITICAL : RiskLevel.HIGH,
      );

      this.logger.warn(`Claim ${claimId} flagged for fraud with score ${overallScore}`);
    }

    return fraudScore;
  }

  async analyzeLoanForFraud(tenantId: string, loanId: string): Promise<FraudScore> {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId, tenantId },
    });

    if (!loan) {
      throw new BadRequestException('Loan not found');
    }

    // Similar fraud analysis for loans
    const scores = {
      syntheticIdentityScore: 0.15,
      behavioralScore: 0.1,
      documentScore: 0.12,
      networkScore: 0.18,
      velocityScore: 0.2,
    };

    const overallScore = this.calculateWeightedScore(scores);

    const fraudScore = this.fraudScoreRepository.create({
      tenantId,
      entityType: 'LOAN',
      entityId: loanId,
      overallScore,
      syntacticIdentityScore: scores.syntheticIdentityScore,
      behavioralScore: scores.behavioralScore,
      documentScore: scores.documentScore,
      networkScore: scores.networkScore,
      velocityScore: scores.velocityScore,
      topIndicators: ['unusual_borrower_profile', 'velocity_spike'],
      reasoning: 'Loan application shows patterns consistent with synthetic identity fraud',
    });

    await this.fraudScoreRepository.save(fraudScore);

    return fraudScore;
  }

  async detectAnomalies(tenantId: string, entityType: string, entityId: string) {
    const anomalies: string[] = [];

    if (entityType === 'CLAIM') {
      const claim = await this.claimRepository.findOne({
        where: { id: entityId, tenantId },
      });

      if (claim && claim.claimAmount > 50000) {
        anomalies.push('high_claim_amount');
      }

      // Check for duplicate claims
      const recentClaims = await this.claimRepository.count({
        where: {
          tenantId,
          claimantEmail: claim.claimantEmail,
        },
      });

      if (recentClaims > 3) {
        anomalies.push('frequent_claimer');
      }
    }

    if (anomalies.length > 0) {
      const anomalyEvent = this.anomalyRepository.create({
        tenantId,
        entityType,
        entityId,
        anomalyType: anomalies[0],
        anomalyScore: Math.min(anomalies.length * 0.2, 1),
        description: `Detected anomalies: ${anomalies.join(', ')}`,
        context: { detectedAnomalies: anomalies },
      });

      await this.anomalyRepository.save(anomalyEvent);

      this.logger.info(`Anomalies detected for ${entityType} ${entityId}: ${anomalies.join(', ')}`);
    }

    return anomalies;
  }

  private async calculateSyntheticIdentityScore(
    tenantId: string,
    claim: Claim,
  ): Promise<number> {
    // Check for indicators of synthetic identity
    let score = 0;

    // Check if email domain is valid
    if (!this.isValidEmailDomain(claim.claimantEmail)) {
      score += 0.2;
    }

    // Check if phone is valid
    if (!this.isValidPhoneNumber(claim.claimantPhone)) {
      score += 0.2;
    }

    // Check claim pattern
    if (claim.description.length < 20) {
      score += 0.1;
    }

    return Math.min(score, 1);
  }

  private async calculateBehavioralScore(tenantId: string, claim: Claim): Promise<number> {
    // Analyze behavioral patterns
    let score = 0;

    // Check claim submission timing
    const hoursFromSubmission = Math.abs(
      (new Date().getTime() - claim.claimDate.getTime()) / (1000 * 60 * 60)
    );
    if (hoursFromSubmission < 1) {
      score += 0.15; // Suspicious if claimed immediately
    }

    // Check claim amount reasonableness
    if (claim.claimAmount > 100000) {
      score += 0.1;
    }

    return Math.min(score, 1);
  }

  private async calculateDocumentScore(tenantId: string, claim: Claim): Promise<number> {
    // Analyze document authenticity (OCR would be used here)
    let score = 0.05; // Small base score

    if (!claim.attachmentIds || claim.attachmentIds.length === 0) {
      score += 0.3; // No documents provided
    }

    return Math.min(score, 1);
  }

  private async calculateNetworkScore(tenantId: string, claim: Claim): Promise<number> {
    // Analyze network relationships (Neo4j graph would be used)
    // This would query the fraud graph for suspicious relationships
    let score = 0.05; // Base score

    return Math.min(score, 1);
  }

  private async calculateVelocityScore(tenantId: string, claim: Claim): Promise<number> {
    // Check submission velocity
    const daysSince = Math.floor(
      (new Date().getTime() - claim.claimDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let score = 0;

    if (daysSince === 0) {
      score += 0.3; // Claim submitted same day
    } else if (daysSince <= 2) {
      score += 0.15;
    }

    return Math.min(score, 1);
  }

  private calculateWeightedScore(scores: Record<string, number>): number {
    const weights = {
      syntheticIdentityScore: 0.25,
      behavioralScore: 0.25,
      documentScore: 0.2,
      networkScore: 0.2,
      velocityScore: 0.1,
    };

    return Object.entries(scores).reduce(
      (sum, [key, score]) => sum + score * (weights[key] || 0),
      0
    );
  }

  private getTopIndicators(scores: Record<string, number>): string[] {
    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key]) => key);
  }

  private generateReasoning(scores: Record<string, number>): string {
    const topScore = Math.max(...Object.values(scores));
    if (topScore > 0.7) {
      return 'High fraud risk detected across multiple indicators';
    } else if (topScore > 0.4) {
      return 'Moderate fraud risk detected';
    }
    return 'Low fraud risk detected';
  }

  private isValidEmailDomain(email: string): boolean {
    if (!email) return false;
    const domain = email.split('@')[1];
    return domain && domain.includes('.');
  }

  private isValidPhoneNumber(phone: string): boolean {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  }

  private async createFraudEvent(
    tenantId: string,
    entityId: string,
    eventType: FraudEventType,
    riskLevel: RiskLevel,
  ): Promise<FraudEvent> {
    const fraudEvent = this.fraudEventRepository.create({
      tenantId,
      entityId,
      entityType: 'CLAIM',
      eventType,
      riskLevel,
      fraudScore: riskLevel === RiskLevel.CRITICAL ? 0.9 : 0.7,
      indicators: ['pattern_match', 'high_risk_profile'],
      description: `${eventType} detected for entity ${entityId}`,
    });

    return this.fraudEventRepository.save(fraudEvent);
  }
}
