import { Controller, Post, Get, Body, UseGuards, Query } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { JwtGuard } from '../../common/guards/jwt.guard';

@Controller('api/v1/compliance')
@UseGuards(JwtGuard)
export class ComplianceController {
  constructor(private complianceService: ComplianceService) {}

  @Post('kyc/verify')
  async verifyKYC(@Body() body: any) {
    return this.complianceService.verifyKYC(body.userId, body.kycData);
  }

  @Post('aml/check')
  async performAMLCheck(@Body() body: any) {
    return this.complianceService.performAMLCheck(body.entityId, body.entityType);
  }

  @Post('ctf/check')
  async performCTFCheck(@Body() body: any) {
    return this.complianceService.performCTFCheck(body.entityName);
  }

  @Post('privacy/log')
  async ensureDataPrivacy(@Body() body: any) {
    return this.complianceService.ensureDataPrivacy(body.userId, body.action);
  }

  @Get('report')
  async getComplianceReport(
    @Query('tenantId') tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.complianceService.generateComplianceReport(
      tenantId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
