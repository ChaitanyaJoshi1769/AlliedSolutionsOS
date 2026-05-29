import {
  IsNumber,
  IsString,
  IsEmail,
  IsUUID,
  IsOptional,
  Min,
  Max,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { LoanType } from '../../../entities/loan.entity';

export class CreateLoanDto {
  @IsEnum(LoanType)
  type: LoanType;

  @IsUUID()
  borrowerId: string;

  @IsEmail()
  borrowerEmail: string;

  @IsString()
  borrowerName: string;

  @IsNumber()
  @Min(100)
  principal: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate: number;

  @IsNumber()
  @Min(1)
  @Max(360)
  termMonths: number;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsString()
  collateral?: string;

  @IsOptional()
  @IsString()
  collateralValue?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateLoanDto {
  @IsOptional()
  @IsString()
  borrowerName?: string;

  @IsOptional()
  @IsString()
  collateral?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
