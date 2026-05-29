import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Version,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { LendingService } from './lending.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('lending')
@Version('1')
@UseGuards(JwtAuthGuard)
export class LendingController {
  constructor(private lendingService: LendingService) {}

  @Post('loans')
  @HttpCode(201)
  async createLoan(@Request() req: any, @Body() dto: CreateLoanDto) {
    return this.lendingService.createLoan(req.user.tenantId, req.user.organizationId, dto);
  }

  @Get('loans')
  @HttpCode(200)
  async listLoans(
    @Request() req: any,
    @Query() pagination: PaginationDto,
  ) {
    return this.lendingService.listLoans(req.user.tenantId, req.user.organizationId, pagination);
  }

  @Get('loans/:id')
  @HttpCode(200)
  async getLoan(@Request() req: any, @Param('id') loanId: string) {
    return this.lendingService.getLoan(req.user.tenantId, loanId);
  }

  @Post('loans/:id/payments')
  @HttpCode(201)
  async recordPayment(
    @Request() req: any,
    @Param('id') loanId: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.lendingService.recordPayment(req.user.tenantId, loanId, dto);
  }

  @Get('loans/:id/payments')
  @HttpCode(200)
  async getPayments(
    @Request() req: any,
    @Param('id') loanId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.lendingService.getLoanPayments(req.user.tenantId, loanId, pagination);
  }

  @Get('portfolio/metrics')
  @HttpCode(200)
  async getPortfolioMetrics(@Request() req: any) {
    return this.lendingService.calculatePortfolioMetrics(
      req.user.tenantId,
      req.user.organizationId,
    );
  }
}
