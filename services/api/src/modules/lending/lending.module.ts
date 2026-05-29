import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan, PaymentRecord, DelinquencyRecord } from '../../entities/loan.entity';
import { LendingService } from './lending.service';
import { LendingController } from './lending.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, PaymentRecord, DelinquencyRecord])],
  controllers: [LendingController],
  providers: [LendingService],
  exports: [LendingService],
})
export class LendingModule {}
