import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FraudEvent, FraudScore, AnomalyEvent } from '../../entities/fraud-event.entity';
import { Claim } from '../../entities/claim.entity';
import { Loan } from '../../entities/loan.entity';
import { FraudService } from './fraud.service';

@Module({
  imports: [TypeOrmModule.forFeature([FraudEvent, FraudScore, AnomalyEvent, Claim, Loan])],
  providers: [FraudService],
  exports: [FraudService],
})
export class FraudModule {}
