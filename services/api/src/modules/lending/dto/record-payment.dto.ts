import { IsNumber, IsString, IsDateString, IsOptional, Min } from 'class-validator';

export class RecordPaymentDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  paymentDate: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
