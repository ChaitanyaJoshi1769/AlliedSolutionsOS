import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PolicyStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  LAPSED = 'LAPSED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum PolicyType {
  AUTO = 'AUTO',
  HOME = 'HOME',
  LIFE = 'LIFE',
  UMBRELLA = 'UMBRELLA',
  WARRANTY = 'WARRANTY',
  PROTECTION = 'PROTECTION',
}

@Entity('policies')
@Index(['tenantId', 'policyNumber'], { unique: true })
@Index(['tenantId', 'holderEmail'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'expiryDate'])
export class Policy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column()
  policyNumber: string;

  @Column({ nullable: true })
  externalId: string;

  @Column({
    type: 'enum',
    enum: PolicyType,
  })
  type: PolicyType;

  @Column({
    type: 'enum',
    enum: PolicyStatus,
    default: PolicyStatus.ACTIVE,
  })
  status: PolicyStatus;

  @Column()
  holderName: string;

  @Column()
  holderEmail: string;

  @Column({ nullable: true })
  holderPhone: string;

  @Column('uuid', { nullable: true })
  organizationId: string;

  @Column('decimal', { precision: 12, scale: 2 })
  premium: number;

  @Column({ default: 12 })
  renewalFrequencyMonths: number;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ type: 'date', nullable: true })
  lastRenewalDate: Date;

  @Column({ type: 'date', nullable: true })
  nextRenewalDate: Date;

  @Column('decimal', { precision: 12, scale: 2 })
  coverageAmount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  deductible: number;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  coverages: string[];

  @Column('text')
  policyDocument: string; // S3 URL

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  cancelledAt: Date;

  // Methods
  isActive(): boolean {
    return this.status === PolicyStatus.ACTIVE && new Date() <= this.expiryDate;
  }

  getDaysUntilExpiry(): number {
    return Math.floor((this.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  }

  isExpiringSoon(): boolean {
    return this.getDaysUntilExpiry() <= 30 && this.getDaysUntilExpiry() > 0;
  }
}
