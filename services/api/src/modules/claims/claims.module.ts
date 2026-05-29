import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Claim } from '../../entities/claim.entity';
import { ClaimsService } from './claims.service';
import { ClaimsController } from './claims.controller';
import { FraudModule } from '../fraud/fraud.module';

@Module({
  imports: [TypeOrmModule.forFeature([Claim]), FraudModule],
  providers: [ClaimsService],
  controllers: [ClaimsController],
  exports: [ClaimsService],
})
export class ClaimsModule {}
