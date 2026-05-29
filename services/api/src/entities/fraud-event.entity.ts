import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum FraudEventType {
  SYNTHETIC_IDENTITY = 'SYNTHETIC_IDENTITY',
  BEHAVIORAL_ANOMALY = 'BEHAVIORAL_ANOMALY',
  CLAIM_FREQUENCY = 'CLAIM_FREQUENCY',
  DUPLICATE_CLAIM = 'DUPLICATE_CLAIM',
  LOAN_PAYMENT_PATTERN = 'LOAN_PAYMENT_PATTERN',
  DOCUMENT_FRAUD = 'DOCUMENT_FRAUD',
  NETWORK_RELATIONSHIP = 'NETWORK_RELATIONSHIP',
  VELOCITY_CHECK = 'VELOCITY_CHECK',
  MANUAL_ESCALATION = 'MANUAL_ESCALATION',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('fraud_events')
@Index(['tenantId', 'entityType', 'entityId'])
@Index(['tenantId', 'createdAt'])
@Index(['tenantId', 'riskLevel'])
export class FraudEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column({
    type: 'enum',
    enum: FraudEventType,
  })
  eventType: FraudEventType;

  @Column({
    type: 'enum',
    enum: RiskLevel,
  })
  riskLevel: RiskLevel;

  @Column()
  entityType: string; // LOAN, CLAIM, POLICY, USER

  @Column('uuid')
  entityId: string;

  @Column('uuid', { nullable: true })
  claimId: string;

  @Column('uuid', { nullable: true })
  loanId: string;

  @Column('decimal', { precision: 5, scale: 4 })
  fraudScore: number;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  indicators: string[];

  @Column('text')
  description: string;

  @Column({ nullable: true })
  graphNodeId: string;

  @Column({ type: 'jsonb', default: {} })
  graphRelationships: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  mlModelScores: Record<string, number>;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ type: 'date', nullable: true })
  reviewDate: Date;

  @Column({ nullable: true })
  reviewOutcome: string; // CONFIRMED_FRAUD, FALSE_POSITIVE, PENDING

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'date', nullable: true })
  resolvedAt: Date;
}

@Entity('fraud_scores')
@Index(['tenantId', 'entityType', 'entityId'])
@Index(['tenantId', 'calculatedAt'])
export class FraudScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column()
  entityType: string;

  @Column('uuid')
  entityId: string;

  @Column('decimal', { precision: 5, scale: 4 })
  overallScore: number;

  @Column('decimal', { precision: 5, scale: 4 })
  syntacticIdentityScore: number;

  @Column('decimal', { precision: 5, scale: 4 })
  behavioralScore: number;

  @Column('decimal', { precision: 5, scale: 4 })
  documentScore: number;

  @Column('decimal', { precision: 5, scale: 4 })
  networkScore: number;

  @Column('decimal', { precision: 5, scale: 4 })
  velocityScore: number;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  topIndicators: string[];

  @Column('text')
  reasoning: string;

  @Column({ type: 'jsonb', default: {} })
  modelWeights: Record<string, number>;

  @CreateDateColumn()
  calculatedAt: Date;
}

@Entity('anomaly_events')
@Index(['tenantId', 'entityId'])
export class AnomalyEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column()
  entityType: string;

  @Column('uuid')
  entityId: string;

  @Column()
  anomalyType: string;

  @Column('decimal', { precision: 5, scale: 4 })
  anomalyScore: number;

  @Column('text')
  description: string;

  @Column({ type: 'jsonb', default: {} })
  context: Record<string, any>;

  @Column({ default: false })
  isResolved: boolean;

  @CreateDateColumn()
  detectedAt: Date;

  @Column({ type: 'date', nullable: true })
  resolvedAt: Date;
}
