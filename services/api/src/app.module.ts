import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { LendingModule } from './modules/lending/lending.module';
import { InsuranceModule } from './modules/insurance/insurance.module';
import { ClaimsModule } from './modules/claims/claims.module';
import { FraudModule } from './modules/fraud/fraud.module';
import { DealerModule } from './modules/dealer/dealer.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { getTypeOrmConfig } from './database/typeorm.config';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        introspection: configService.get('NODE_ENV') !== 'production',
        debug: configService.get('NODE_ENV') !== 'production',
        path: configService.get('GRAPHQL_PATH', '/graphql'),
        context: ({ req, res }) => ({ req, res }),
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('RATE_LIMIT_WINDOW_MS', 900000),
        limit: configService.get<number>('RATE_LIMIT_MAX_REQUESTS', 100),
      }),
    }),
    // Feature modules
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    TenantModule,
    LendingModule,
    InsuranceModule,
    ClaimsModule,
    FraudModule,
    DealerModule,
    ComplianceModule,
    AnalyticsModule,
    IntegrationsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
})
export class AppModule {}
