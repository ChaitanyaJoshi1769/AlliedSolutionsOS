import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  /**
   * Salesforce Integration
   * Sync leads and opportunities with Salesforce CRM
   */
  async syncToSalesforce(tenantId: string, entityType: string, entityData: any): Promise<any> {
    try {
      const salesforceToken = this.configService.get('SALESFORCE_ACCESS_TOKEN');
      const salesforceUrl = this.configService.get('SALESFORCE_INSTANCE_URL');

      if (!salesforceToken || !salesforceUrl) {
        throw new BadRequestException('Salesforce credentials not configured');
      }

      const endpoint = `${salesforceUrl}/services/data/v57.0/sobjects/${entityType}`;

      const response = await firstValueFrom(
        this.httpService.post(endpoint, entityData, {
          headers: {
            Authorization: `Bearer ${salesforceToken}`,
            'Content-Type': 'application/json',
          },
        })
      );

      this.logger.log(`Synced ${entityType} to Salesforce: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Salesforce sync failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Guidewire Claims Integration
   * Send claims data to Guidewire system
   */
  async sendToGuidewire(claimData: any): Promise<any> {
    try {
      const guidewireUrl = this.configService.get('GUIDEWIRE_API_URL');
      const guidewireKey = this.configService.get('GUIDEWIRE_API_KEY');

      if (!guidewireUrl || !guidewireKey) {
        throw new BadRequestException('Guidewire credentials not configured');
      }

      const response = await firstValueFrom(
        this.httpService.post(`${guidewireUrl}/claims`, claimData, {
          headers: {
            'X-API-Key': guidewireKey,
            'Content-Type': 'application/json',
          },
        })
      );

      this.logger.log(`Claim sent to Guidewire: ${response.data.claimNumber}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Guidewire integration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Duck Creek Integration
   * Sync policies with Duck Creek insurance system
   */
  async syncPolicyToDuckCreek(policyData: any): Promise<any> {
    try {
      const duckCreekUrl = this.configService.get('DUCK_CREEK_API_URL');
      const duckCreekApiKey = this.configService.get('DUCK_CREEK_API_KEY');

      if (!duckCreekUrl || !duckCreekApiKey) {
        throw new BadRequestException('Duck Creek credentials not configured');
      }

      const response = await firstValueFrom(
        this.httpService.post(`${duckCreekUrl}/policies`, policyData, {
          headers: {
            'Authorization': `Bearer ${duckCreekApiKey}`,
            'Content-Type': 'application/json',
          },
        })
      );

      this.logger.log(`Policy synced to Duck Creek: ${response.data.policyNumber}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Duck Creek sync failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fiserv Payment Processing
   * Process payments through Fiserv payment gateway
   */
  async processPaymentViaFiserv(paymentData: any): Promise<any> {
    try {
      const fiservUrl = this.configService.get('FISERV_API_URL');
      const fiservMerchantId = this.configService.get('FISERV_MERCHANT_ID');
      const fiservApiKey = this.configService.get('FISERV_API_KEY');

      if (!fiservUrl || !fiservMerchantId || !fiservApiKey) {
        throw new BadRequestException('Fiserv credentials not configured');
      }

      const payload = {
        merchantId: fiservMerchantId,
        ...paymentData,
      };

      const response = await firstValueFrom(
        this.httpService.post(`${fiservUrl}/transactions`, payload, {
          headers: {
            'X-API-Key': fiservApiKey,
            'Content-Type': 'application/json',
          },
        })
      );

      this.logger.log(`Payment processed via Fiserv: ${response.data.transactionId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Fiserv payment processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Credit Bureau Integration
   * Check credit scores and reports
   */
  async checkCreditScore(borrowerId: string): Promise<any> {
    try {
      const creditBureauUrl = this.configService.get('CREDIT_BUREAU_API_URL');
      const creditBureauKey = this.configService.get('CREDIT_BUREAU_API_KEY');

      if (!creditBureauUrl || !creditBureauKey) {
        throw new BadRequestException('Credit bureau credentials not configured');
      }

      const response = await firstValueFrom(
        this.httpService.get(`${creditBureauUrl}/score/${borrowerId}`, {
          headers: {
            'Authorization': `Bearer ${creditBureauKey}`,
          },
        })
      );

      this.logger.log(`Credit score retrieved for borrower: ${borrowerId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Credit bureau check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Dealer Management System Integration
   * Sync dealer information and transactions
   */
  async syncDealerData(dealerData: any): Promise<any> {
    try {
      const dmsUrl = this.configService.get('DMS_API_URL');
      const dmsApiKey = this.configService.get('DMS_API_KEY');

      if (!dmsUrl || !dmsApiKey) {
        throw new BadRequestException('DMS credentials not configured');
      }

      const response = await firstValueFrom(
        this.httpService.post(`${dmsUrl}/dealers`, dealerData, {
          headers: {
            'X-API-Key': dmsApiKey,
            'Content-Type': 'application/json',
          },
        })
      );

      this.logger.log(`Dealer data synced: ${response.data.dealerId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`DMS sync failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get integration status
   */
  async getIntegrationStatus(): Promise<any> {
    return {
      salesforce: {
        configured: !!this.configService.get('SALESFORCE_ACCESS_TOKEN'),
        status: 'connected',
      },
      guidewire: {
        configured: !!this.configService.get('GUIDEWIRE_API_URL'),
        status: 'connected',
      },
      duckCreek: {
        configured: !!this.configService.get('DUCK_CREEK_API_URL'),
        status: 'connected',
      },
      fiserv: {
        configured: !!this.configService.get('FISERV_API_URL'),
        status: 'connected',
      },
      creditBureau: {
        configured: !!this.configService.get('CREDIT_BUREAU_API_URL'),
        status: 'connected',
      },
      dms: {
        configured: !!this.configService.get('DMS_API_URL'),
        status: 'connected',
      },
    };
  }
}
