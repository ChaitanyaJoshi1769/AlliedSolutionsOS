import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Loan, LoanStatus, PaymentRecord, DelinquencyRecord } from '../../entities/loan.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class LendingService {
  private readonly logger = new Logger(LendingService.name);

  constructor(
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
    @InjectRepository(PaymentRecord)
    private paymentRepository: Repository<PaymentRecord>,
    @InjectRepository(DelinquencyRecord)
    private delinquencyRepository: Repository<DelinquencyRecord>,
    private dataSource: DataSource,
  ) {}

  async createLoan(
    tenantId: string,
    organizationId: string,
    dto: CreateLoanDto,
  ): Promise<Loan> {
    // Calculate monthly payment using amortization formula
    const monthlyRate = dto.interestRate / 100 / 12;
    const monthlyPayment =
      monthlyRate === 0
        ? dto.principal / dto.termMonths
        : (dto.principal * (monthlyRate * Math.pow(1 + monthlyRate, dto.termMonths))) /
          (Math.pow(1 + monthlyRate, dto.termMonths) - 1);

    const loan = this.loanRepository.create({
      tenantId,
      organizationId,
      loanNumber: `LOAN-${Date.now()}`,
      type: dto.type,
      status: LoanStatus.PENDING,
      borrowerId: dto.borrowerId,
      borrowerEmail: dto.borrowerEmail,
      borrowerName: dto.borrowerName,
      principal: dto.principal,
      interestRate: dto.interestRate,
      termMonths: dto.termMonths,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      remainingBalance: dto.principal,
      startDate: dto.startDate,
      endDate: new Date(new Date(dto.startDate).setMonth(
        new Date(dto.startDate).getMonth() + dto.termMonths,
      )),
      nextPaymentDue: dto.startDate,
      collateral: dto.collateral,
      metadata: dto.metadata,
    });

    const savedLoan = await this.loanRepository.save(loan);
    this.logger.log(`Loan created: ${savedLoan.loanNumber}`);
    return savedLoan;
  }

  async getLoan(tenantId: string, loanId: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId, tenantId },
      relations: ['payments', 'organization'],
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return loan;
  }

  async listLoans(
    tenantId: string,
    organizationId: string,
    pagination: PaginationDto,
  ) {
    const query = this.loanRepository
      .createQueryBuilder('loan')
      .where('loan.tenantId = :tenantId', { tenantId });

    if (organizationId) {
      query.andWhere('loan.organizationId = :organizationId', { organizationId });
    }

    const total = await query.getCount();

    const loans = await query
      .leftJoinAndSelect('loan.payments', 'payments')
      .orderBy('loan.createdAt', 'DESC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .getMany();

    return {
      data: loans,
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages: Math.ceil(total / pagination.limit),
    };
  }

  async recordPayment(
    tenantId: string,
    loanId: string,
    dto: RecordPaymentDto,
  ): Promise<PaymentRecord> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const loan = await queryRunner.manager.findOne(Loan, {
        where: { id: loanId, tenantId },
      });

      if (!loan) {
        throw new NotFoundException('Loan not found');
      }

      if (loan.status !== LoanStatus.ACTIVE && loan.status !== LoanStatus.DELINQUENT) {
        throw new BadRequestException('Loan is not in a state to accept payments');
      }

      // Calculate interest and principal portions
      const monthlyRate = loan.interestRate / 100 / 12;
      const interestAmount = Math.round(loan.remainingBalance * monthlyRate * 100) / 100;
      const principalAmount = dto.amount - interestAmount;

      const balanceAfter = Math.max(0, loan.remainingBalance - principalAmount);

      // Create payment record
      const payment = queryRunner.manager.create(PaymentRecord, {
        tenantId,
        loanId,
        amount: dto.amount,
        principalAmount,
        interestAmount,
        paymentDate: new Date(dto.paymentDate),
        referenceNumber: dto.referenceNumber,
        method: dto.method,
        balanceAfter,
      });

      await queryRunner.manager.save(payment);

      // Update loan
      loan.amountPaid += dto.amount;
      loan.remainingBalance = balanceAfter;
      loan.lastPaymentDate = new Date(dto.paymentDate);
      loan.nextPaymentDue = new Date(new Date(dto.paymentDate).setMonth(
        new Date(dto.paymentDate).getMonth() + 1,
      ));
      loan.daysOverdue = 0;

      if (balanceAfter === 0) {
        loan.status = LoanStatus.PAID_OFF;
        loan.closedAt = new Date();
      } else if (loan.status === LoanStatus.DELINQUENT) {
        loan.status = LoanStatus.ACTIVE;
      }

      await queryRunner.manager.save(loan);

      await queryRunner.commitTransaction();

      this.logger.log(`Payment recorded for loan: ${loanId}`);

      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getLoanPayments(
    tenantId: string,
    loanId: string,
    pagination: PaginationDto,
  ) {
    const total = await this.paymentRepository.count({
      where: { tenantId, loanId },
    });

    const payments = await this.paymentRepository.find({
      where: { tenantId, loanId },
      order: { paymentDate: 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    return {
      data: payments,
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async markAsDelinquent(tenantId: string, loanId: string, daysOverdue: number): Promise<void> {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId, tenantId },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    loan.status = LoanStatus.DELINQUENT;
    loan.daysOverdue = daysOverdue;

    const delinquency = this.delinquencyRepository.create({
      tenantId,
      loanId,
      daysPastDue: daysOverdue,
      amountDue: loan.monthlyPayment,
      dueDate: loan.nextPaymentDue,
      status: 'NOTICE_SENT',
    });

    await Promise.all([
      this.loanRepository.save(loan),
      this.delinquencyRepository.save(delinquency),
    ]);

    this.logger.warn(`Loan marked as delinquent: ${loanId}, days: ${daysOverdue}`);
  }

  async calculatePortfolioMetrics(tenantId: string, organizationId?: string) {
    const query = this.loanRepository
      .createQueryBuilder('loan')
      .where('loan.tenantId = :tenantId', { tenantId });

    if (organizationId) {
      query.andWhere('loan.organizationId = :organizationId', { organizationId });
    }

    const loans = await query.getMany();

    return {
      totalLoans: loans.length,
      totalOutstanding: loans.reduce((sum, loan) => sum + Number(loan.remainingBalance), 0),
      totalCollected: loans.reduce((sum, loan) => sum + Number(loan.amountPaid), 0),
      activeLoans: loans.filter((l) => l.status === LoanStatus.ACTIVE).length,
      delinquentLoans: loans.filter((l) => l.status === LoanStatus.DELINQUENT).length,
      paidOffLoans: loans.filter((l) => l.status === LoanStatus.PAID_OFF).length,
      defaultedLoans: loans.filter((l) => l.status === LoanStatus.DEFAULTED).length,
      portfolioValue: loans.reduce((sum, loan) => sum + Number(loan.principal), 0),
      averageInterestRate:
        loans.length > 0
          ? loans.reduce((sum, loan) => sum + loan.interestRate, 0) / loans.length
          : 0,
    };
  }
}
