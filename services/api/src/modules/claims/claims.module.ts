import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Claim } from '../../entities/claim.entity';
import { FraudModule } from '../fraud/fraud.module';

@Module({
  imports: [TypeOrmModule.forFeature([Claim]), FraudModule],
  providers: [],
  exports: [],
})
export class ClaimsModule {}
