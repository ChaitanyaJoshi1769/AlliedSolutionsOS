import {
  IsString,
  IsEmail,
  IsNumber,
  IsDateString,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
  MinLength,
} from 'class-validator';
import { ClaimType } from '../../../entities/claim.entity';

export class CreateClaimDto {
  @IsEnum(ClaimType)
  type: ClaimType;

  @IsUUID()
  policyId: string;

  @IsString()
  claimantName: string;

  @IsEmail()
  claimantEmail: string;

  @IsOptional()
  @IsString()
  claimantPhone?: string;

  @IsDateString()
  claimDate: string;

  @IsOptional()
  @IsDateString()
  incidentDate?: string;

  @IsString()
  @MinLength(20)
  description: string;

  @IsNumber()
  @Min(0)
  claimAmount: number;

  @IsOptional()
  attachmentIds?: string[];

  @IsOptional()
  metadata?: Record<string, any>;
}

export class ApproveClaimDto {
  @IsNumber()
  @Min(0)
  approvedAmount: number;
}

export class DenyClaimDto {
  @IsString()
  @MinLength(10)
  reason: string;
}

export class ProcessPayoutDto {
  @IsNumber()
  @Min(0)
  amount: number;
}
