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
import { ClaimsService } from './claims.service';
import {
  CreateClaimDto,
  ApproveClaimDto,
  DenyClaimDto,
  ProcessPayoutDto,
} from './dto/create-claim.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('claims')
@Version('1')
@UseGuards(JwtAuthGuard)
export class ClaimsController {
  constructor(private claimsService: ClaimsService) {}

  @Post()
  @HttpCode(201)
  async submitClaim(@Request() req: any, @Body() dto: CreateClaimDto) {
    return this.claimsService.submitClaim(req.user.tenantId, req.user.organizationId, dto);
  }

  @Get()
  @HttpCode(200)
  async listClaims(@Request() req: any, @Query() pagination: PaginationDto) {
    return this.claimsService.listClaims(req.user.tenantId, req.user.organizationId, pagination);
  }

  @Get(':id')
  @HttpCode(200)
  async getClaim(@Request() req: any, @Param('id') claimId: string) {
    return this.claimsService.getClaim(req.user.tenantId, claimId);
  }

  @Patch(':id/approve')
  @HttpCode(200)
  async approveClaim(
    @Request() req: any,
    @Param('id') claimId: string,
    @Body() dto: ApproveClaimDto,
  ) {
    return this.claimsService.approveClaim(req.user.tenantId, claimId, dto.approvedAmount);
  }

  @Patch(':id/deny')
  @HttpCode(200)
  async denyClaim(
    @Request() req: any,
    @Param('id') claimId: string,
    @Body() dto: DenyClaimDto,
  ) {
    return this.claimsService.denyClaim(req.user.tenantId, claimId, dto.reason);
  }

  @Post(':id/payout')
  @HttpCode(201)
  async processPayout(
    @Request() req: any,
    @Param('id') claimId: string,
    @Body() dto: ProcessPayoutDto,
  ) {
    return this.claimsService.processPayout(req.user.tenantId, claimId, dto.amount);
  }

  @Get('metrics/summary')
  @HttpCode(200)
  async getMetrics(@Request() req: any) {
    return this.claimsService.getClaimMetrics(req.user.tenantId, req.user.organizationId);
  }
}
