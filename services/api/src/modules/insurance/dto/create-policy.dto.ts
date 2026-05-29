import {
  IsString,
  IsEmail,
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
  Min,
  MinLength,
  IsArray,
} from 'class-validator';
import { PolicyType } from '../../../entities/policy.entity';

export class CreatePolicyDto {
  @IsString()
  policyNumber: string;

  @IsEnum(PolicyType)
  type: PolicyType;

  @IsString()
  holderName: string;

  @IsEmail()
  holderEmail: string;

  @IsOptional()
  @IsString()
  holderPhone?: string;

  @IsNumber()
  @Min(0)
  premium: number;

  @IsDateString()
  effectiveDate: string;

  @IsOptional()
  renewalFrequencyMonths?: number;

  @IsNumber()
  @Min(0)
  coverageAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deductible?: number;

  @IsArray()
  coverages: string[];

  @IsString()
  policyDocument: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class RenewPolicyDto {
  @IsOptional()
  @IsNumber()
  newPremium?: number;
}

export class CancelPolicyDto {
  @IsString()
  @MinLength(10)
  reason: string;
}
