import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getTypeOrmConfig(configService: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USER', 'allied'),
    password: configService.get<string>('DB_PASSWORD', 'allied123'),
    database: configService.get<string>('DB_NAME', 'allied_os'),
    entities: [__dirname + '/../entities/**/*.entity.{ts,js}'],
    migrations: [__dirname + '/migrations/**/*.{ts,js}'],
    subscribers: [__dirname + '/subscribers/**/*.{ts,js}'],
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
    logging: configService.get<boolean>('DB_LOGGING', false),
    poolSize: configService.get<number>('DB_POOL_MAX', 20),
    extra: {
      min: configService.get<number>('DB_POOL_MIN', 5),
    },
    migrationsRun: configService.get<boolean>('DB_MIGRATIONS_RUN', true),
    cli: {
      entitiesDir: 'src/entities',
      migrationsDir: 'src/database/migrations',
      subscribersDir: 'src/database/subscribers',
    },
  };
}
