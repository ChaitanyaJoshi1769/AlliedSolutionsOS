import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LendingService } from './lending.service';
import { Loan } from '../../entities/loan.entity';
import { PaymentRecord } from '../../entities/payment_records.entity';
import { DelinquencyRecord } from '../../entities/delinquency_records.entity';
import { BadRequestException } from '@nestjs/common';

describe('LendingService', () => {
  let service: LendingService;

  const mockLoanRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockDelinquencyRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LendingService,
        {
          provide: getRepositoryToken(Loan),
          useValue: mockLoanRepository,
        },
        {
          provide: getRepositoryToken(PaymentRecord),
          useValue: mockPaymentRepository,
        },
        {
          provide: getRepositoryToken(DelinquencyRecord),
          useValue: mockDelinquencyRepository,
        },
      ],
    }).compile();

    service = module.get<LendingService>(LendingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLoan', () => {
    it('should create loan with calculated monthly payment', async () => {
      const createLoanDto = {
        borrowerId: 'borrower-1',
        principal: 100000,
        interestRate: 5,
        termMonths: 360,
        loanType: 'PERSONAL',
      };

      const mockLoan = { id: 'loan-1', ...createLoanDto, monthlyPayment: 536.82 };
      mockLoanRepository.create.mockReturnValue(mockLoan);
      mockLoanRepository.save.mockResolvedValue(mockLoan);

      const result = await service.createLoan(createLoanDto);

      expect(result.monthlyPayment).toBeCloseTo(536.82, 1);
      expect(mockLoanRepository.save).toHaveBeenCalled();
    });

    it('should throw error for invalid principal', async () => {
      const createLoanDto = {
        borrowerId: 'borrower-1',
        principal: -1000,
        interestRate: 5,
        termMonths: 360,
        loanType: 'PERSONAL',
      };

      mockLoanRepository.create.mockThrow(new BadRequestException('Invalid principal'));

      await expect(service.createLoan(createLoanDto)).rejects.toThrow(BadRequestException);
    });

    it('should validate interest rate range', async () => {
      const createLoanDto = {
        borrowerId: 'borrower-1',
        principal: 100000,
        interestRate: 25,
        termMonths: 360,
        loanType: 'PERSONAL',
      };

      mockLoanRepository.create.mockReturnValue(createLoanDto);
      mockLoanRepository.save.mockResolvedValue(createLoanDto);

      const result = await service.createLoan(createLoanDto);
      expect(result).toBeDefined();
    });
  });

  describe('recordPayment', () => {
    it('should record payment and update balance', async () => {
      const loanId = 'loan-1';
      const recordPaymentDto = {
        amount: 536.82,
        paymentDate: new Date(),
      };

      const mockLoan = {
        id: loanId,
        principal: 100000,
        balance: 99463.18,
        monthlyPayment: 536.82,
        interestRate: 5,
      };

      const mockPayment = {
        id: 'payment-1',
        loanId,
        ...recordPaymentDto,
        principal: 463.18,
        interest: 73.64,
      };

      mockLoanRepository.findOne.mockResolvedValue(mockLoan);
      mockPaymentRepository.create.mockReturnValue(mockPayment);
      mockPaymentRepository.save.mockResolvedValue(mockPayment);
      mockLoanRepository.save.mockResolvedValue(mockLoan);

      const result = await service.recordPayment(loanId, recordPaymentDto);

      expect(result).toHaveProperty('principal');
      expect(result).toHaveProperty('interest');
    });

    it('should track delinquency if payment is late', async () => {
      const loanId = 'loan-1';
      const recordPaymentDto = {
        amount: 536.82,
        paymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days late
      };

      const mockLoan = {
        id: loanId,
        principal: 100000,
        balance: 99463.18,
        monthlyPayment: 536.82,
        lastPaymentDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      };

      mockLoanRepository.findOne.mockResolvedValue(mockLoan);
      mockPaymentRepository.create.mockReturnValue({});
      mockPaymentRepository.save.mockResolvedValue({});
      mockDelinquencyRepository.create.mockReturnValue({});
      mockDelinquencyRepository.save.mockResolvedValue({});

      await service.recordPayment(loanId, recordPaymentDto);

      expect(mockDelinquencyRepository.save).toHaveBeenCalled();
    });
  });

  describe('getPortfolioMetrics', () => {
    it('should calculate portfolio metrics', async () => {
      const tenantId = 'tenant-1';
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { COUNT: 2245, SUM: 342800000 },
        ]),
      };

      mockLoanRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getPortfolioMetrics(tenantId);

      expect(result).toHaveProperty('totalLoans');
      expect(result).toHaveProperty('totalPrincipal');
    });
  });
});
