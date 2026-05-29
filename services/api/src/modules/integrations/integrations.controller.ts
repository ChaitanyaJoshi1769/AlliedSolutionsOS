import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { JwtGuard } from '../../common/guards/jwt.guard';

@Controller('api/v1/integrations')
@UseGuards(JwtGuard)
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Get('status')
  async getStatus() {
    return this.integrationsService.getIntegrationStatus();
  }

  @Post('salesforce/sync')
  async syncSalesforce(@Body() body: any) {
    return this.integrationsService.syncToSalesforce(
      body.tenantId,
      body.entityType,
      body.entityData,
    );
  }

  @Post('guidewire/claim')
  async sendClaim(@Body() body: any) {
    return this.integrationsService.sendToGuidewire(body);
  }

  @Post('duckCreek/policy')
  async syncPolicy(@Body() body: any) {
    return this.integrationsService.syncPolicyToDuckCreek(body);
  }

  @Post('fiserv/payment')
  async processPayment(@Body() body: any) {
    return this.integrationsService.processPaymentViaFiserv(body);
  }

  @Post('creditBureau/score/:borrowerId')
  async getCreditScore(@Param('borrowerId') borrowerId: string) {
    return this.integrationsService.checkCreditScore(borrowerId);
  }

  @Post('dms/dealer')
  async syncDealer(@Body() body: any) {
    return this.integrationsService.syncDealerData(body);
  }
}
