import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Version,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { InsuranceService } from './insurance.service';
import { CreatePolicyDto, RenewPolicyDto, CancelPolicyDto } from './dto/create-policy.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('insurance')
@Version('1')
@UseGuards(JwtAuthGuard)
export class InsuranceController {
  constructor(private insuranceService: InsuranceService) {}

  @Post('policies')
  @HttpCode(201)
  async createPolicy(@Request() req: any, @Body() dto: CreatePolicyDto) {
    return this.insuranceService.createPolicy(req.user.tenantId, req.user.organizationId, dto);
  }

  @Get('policies')
  @HttpCode(200)
  async listPolicies(@Request() req: any, @Query() pagination: PaginationDto) {
    return this.insuranceService.listPolicies(
      req.user.tenantId,
      req.user.organizationId,
      pagination,
    );
  }

  @Get('policies/:id')
  @HttpCode(200)
  async getPolicy(@Request() req: any, @Param('id') policyId: string) {
    return this.insuranceService.getPolicy(req.user.tenantId, policyId);
  }

  @Patch('policies/:id/renew')
  @HttpCode(200)
  async renewPolicy(
    @Request() req: any,
    @Param('id') policyId: string,
    @Body() dto: RenewPolicyDto,
  ) {
    return this.insuranceService.renewPolicy(req.user.tenantId, policyId);
  }

  @Patch('policies/:id/cancel')
  @HttpCode(200)
  async cancelPolicy(
    @Request() req: any,
    @Param('id') policyId: string,
    @Body() dto: CancelPolicyDto,
  ) {
    return this.insuranceService.cancelPolicy(req.user.tenantId, policyId, dto.reason);
  }

  @Get('portfolio/metrics')
  @HttpCode(200)
  async getMetrics(@Request() req: any) {
    return this.insuranceService.getPortfolioMetrics(req.user.tenantId, req.user.organizationId);
  }
}
