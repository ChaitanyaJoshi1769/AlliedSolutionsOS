import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Organization } from './organization.entity';

export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DISBURSED = 'DISBURSED',
  ACTIVE = 'ACTIVE',
  DELINQUENT = 'DELINQUENT',
  PAID_OFF = 'PAID_OFF',
  DEFAULTED = 'DEFAULTED',
  CLOSED = 'CLOSED',
}

export enum LoanType {
  AUTO = 'AUTO',
  PERSONAL = 'PERSONAL',
  MORTGAGE = 'MORTGAGE',
  BUSINESS = 'BUSINESS',
  GAP = 'GAP',
  WARRANTY = 'WARRANTY',
}

@Entity('loans')
@Index(['tenantId', 'loanNumber'], { unique: true })
@Index(['tenantId', 'externalId'], { unique: true, where: '"externalId" IS NOT NULL' })
@Index(['tenantId', 'borrowerId'])
@Index(['tenantId', 'status'])
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column()
  loanNumber: string;

  @Column({ nullable: true })
  externalId: string;

  @Column({
    type: 'enum',
    enum: LoanType,
  })
  type: LoanType;

  @Column({
    type: 'enum',
    enum: LoanStatus,
    default: LoanStatus.PENDING,
  })
  status: LoanStatus;

  @Column('uuid')
  borrowerId: string;

  @Column({ nullable: true })
  borrowerEmail: string;

  @Column({ nullable: true })
  borrowerName: string;

  @Column('uuid', { nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization)
  organization: Organization;

  @Column('decimal', { precision: 12, scale: 2 })
  principal: number;

  @Column('decimal', { precision: 5, scale: 2 })
  interestRate: number;

  @Column()
  termMonths: number;

  @Column('decimal', { precision: 12, scale: 2 })
  monthlyPayment: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  amountPaid: number;

  @Column('decimal', { precision: 12, scale: 2 })
  remainingBalance: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  nextPaymentDue: Date;

  @Column({ type: 'date', nullable: true })
  lastPaymentDate: Date;

  @Column({ default: 0 })
  daysOverdue: number;

  @Column({ nullable: true })
  collateral: string;

  @Column({ nullable: true })
  collateralValue: string;

  @Column({ type: 'jsonb', default: {} })
  riskMetrics: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  closedAt: Date;

  // Relations
  @OneToMany(() => PaymentRecord, (payment) => payment.loan)
  payments: PaymentRecord[];
}

@Entity('payment_records')
@Index(['tenantId', 'loanId'])
@Index(['tenantId', 'paymentDate'])
export class PaymentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  loanId: string;

  @ManyToOne(() => Loan, (loan) => loan.payments, { onDelete: 'CASCADE' })
  loan: Loan;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 12, scale: 2 })
  principalAmount: number;

  @Column('decimal', { precision: 12, scale: 2 })
  interestAmount: number;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ nullable: true })
  referenceNumber: string;

  @Column({ nullable: true })
  method: string; // BANK_TRANSFER, CARD, ACH, etc.

  @Column('decimal', { precision: 12, scale: 2 })
  balanceAfter: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('delinquency_records')
@Index(['tenantId', 'loanId'])
export class DelinquencyRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  loanId: string;

  @ManyToOne(() => Loan, { onDelete: 'CASCADE' })
  loan: Loan;

  @Column()
  daysPastDue: number;

  @Column('decimal', { precision: 12, scale: 2 })
  amountDue: number;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ nullable: true })
  lastFollowUpDate: Date;

  @Column({
    type: 'enum',
    enum: ['NOTICE_SENT', 'CONTACTED', 'PAYMENT_PLAN', 'CHARGED_OFF'],
  })
  status: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
