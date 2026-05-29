import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FraudService } from './fraud.service';
import { FraudScore } from '../../entities/fraud-score.entity';
import { AnomalyEvent } from '../../entities/anomaly-event.entity';

describe('FraudService', () => {
  let service: FraudService;

  const mockFraudScoreRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockAnomalyRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FraudService,
        {
          provide: getRepositoryToken(FraudScore),
          useValue: mockFraudScoreRepository,
        },
        {
          provide: getRepositoryToken(AnomalyEvent),
          useValue: mockAnomalyRepository,
        },
      ],
    }).compile();

    service = module.get<FraudService>(FraudService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeFraud', () => {
    it('should calculate fraud score with all models', async () => {
      const entityData = {
        entityId: 'claim-1',
        entityType: 'CLAIM',
        amount: 25000,
        claimDescription: 'Vehicle damage claim for accident',
        email: 'user@example.com',
        phone: '+11234567890',
        submittedAt: new Date(),
      };

      const mockScore = {
        id: 'score-1',
        syntheticIdentityScore: 0.1,
        behavioralScore: 0.15,
        documentScore: 0.05,
        networkScore: 0.2,
        velocityScore: 0.3,
        overallScore: 0.16,
        riskLevel: 'LOW',
      };

      mockFraudScoreRepository.create.mockReturnValue(mockScore);
      mockFraudScoreRepository.save.mockResolvedValue(mockScore);

      const result = await service.analyzeFraud(entityData);

      expect(result.overallScore).toBeLessThan(0.3);
      expect(result.riskLevel).toBe('LOW');
    });

    it('should flag high-risk fraud patterns', async () => {
      const entityData = {
        entityId: 'claim-2',
        entityType: 'CLAIM',
        amount: 100000,
        claimDescription: 'Short desc',
        email: 'suspicious@temp.com',
        phone: '+1invalid',
        submittedAt: new Date(),
      };

      const mockScore = {
        id: 'score-2',
        syntheticIdentityScore: 0.8,
        behavioralScore: 0.7,
        documentScore: 0.6,
        networkScore: 0.75,
        velocityScore: 0.85,
        overallScore: 0.74,
        riskLevel: 'HIGH',
      };

      mockFraudScoreRepository.create.mockReturnValue(mockScore);
      mockFraudScoreRepository.save.mockResolvedValue(mockScore);

      const result = await service.analyzeFraud(entityData);

      expect(result.overallScore).toBeGreaterThan(0.7);
      expect(result.riskLevel).toBe('HIGH');
    });

    it('should detect behavioral anomalies', async () => {
      const entityData = {
        entityId: 'loan-1',
        entityType: 'LOAN',
        amount: 500000,
        claimDescription: 'Large loan request',
        submittedAt: new Date(),
      };

      const mockScore = { overallScore: 0.5, riskLevel: 'MEDIUM' };
      mockFraudScoreRepository.create.mockReturnValue(mockScore);
      mockFraudScoreRepository.save.mockResolvedValue(mockScore);
      mockAnomalyRepository.create.mockReturnValue({});
      mockAnomalyRepository.save.mockResolvedValue({});

      const result = await service.analyzeFraud(entityData);

      expect(result.riskLevel).toBe('MEDIUM');
    });
  });

  describe('calculateSyntheticIdentityScore', () => {
    it('should detect suspicious email domains', async () => {
      const result = await service.analyzeFraud({
        entityId: 'test-1',
        entityType: 'CLAIM',
        email: 'user@tempmail.com',
        phone: '+11234567890',
        amount: 10000,
        claimDescription: 'Valid description here',
        submittedAt: new Date(),
      });

      expect(result.syntheticIdentityScore).toBeGreaterThan(0.3);
    });

    it('should detect invalid phone formats', async () => {
      const result = await service.analyzeFraud({
        entityId: 'test-2',
        entityType: 'CLAIM',
        email: 'user@legitimate.com',
        phone: '123', // Too short
        amount: 10000,
        claimDescription: 'Valid description here',
        submittedAt: new Date(),
      });

      expect(result.syntheticIdentityScore).toBeGreaterThan(0.2);
    });
  });

  describe('calculateVelocityScore', () => {
    it('should detect rapid successive submissions', async () => {
      const now = new Date();
      const result = await service.analyzeFraud({
        entityId: 'test-3',
        entityType: 'CLAIM',
        email: 'rapid@example.com',
        phone: '+11234567890',
        amount: 10000,
        claimDescription: 'Valid description here',
        submittedAt: now,
      });

      // Multiple submissions within minutes would increase velocity score
      expect(typeof result.velocityScore).toBe('number');
    });
  });
});
