import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Organization } from './organization.entity';

export enum ClaimStatus {
  SUBMITTED = 'SUBMITTED',
  RECEIVED = 'RECEIVED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  PENDING_DOCS = 'PENDING_DOCS',
  DENIED = 'DENIED',
  PAID = 'PAID',
  CLOSED = 'CLOSED',
}

export enum ClaimType {
  INSURANCE = 'INSURANCE',
  WARRANTY = 'WARRANTY',
  PROTECTION_PRODUCT = 'PROTECTION_PRODUCT',
  GAP = 'GAP',
}

@Entity('claims')
@Index(['tenantId', 'claimNumber'], { unique: true })
@Index(['tenantId', 'policyId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'createdAt'])
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column()
  claimNumber: string;

  @Column({ nullable: true })
  externalId: string;

  @Column({
    type: 'enum',
    enum: ClaimType,
  })
  type: ClaimType;

  @Column({
    type: 'enum',
    enum: ClaimStatus,
    default: ClaimStatus.SUBMITTED,
  })
  status: ClaimStatus;

  @Column('uuid')
  policyId: string;

  @Column()
  claimantName: string;

  @Column({ nullable: true })
  claimantEmail: string;

  @Column({ nullable: true })
  claimantPhone: string;

  @Column('uuid', { nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization)
  organization: Organization;

  @Column({ type: 'date' })
  claimDate: Date;

  @Column({ type: 'date', nullable: true })
  incidentDate: Date;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 12, scale: 2 })
  claimAmount: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  approvedAmount: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  paidAmount: number;

  @Column({ nullable: true })
  assignedAdjusterName: string;

  @Column('uuid', { nullable: true })
  assignedAdjusterId: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  fraudScore: number;

  @Column({ default: false })
  flaggedForFraud: boolean;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  fraudIndicators: string[];

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  attachmentIds: string[];

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  aiAnalysis: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  closedAt: Date;

  @Column({ nullable: true })
  notes: string;

  // Methods
  isFraudulent(): boolean {
    return this.fraudScore > 0.7 || this.flaggedForFraud;
  }

  getDaysInProcess(): number {
    const now = new Date();
    return Math.floor((now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  }
}
