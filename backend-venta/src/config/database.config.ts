import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: String(configService.get<string>('DB_PASSWORD', '')),
    database: configService.get<string>('DB_DATABASE', 'sales_system'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: !isProduction,

    ssl: isProduction && process.env.DB_SSL_CA_PATH
      ? {
          rejectUnauthorized: true,
          ca: fs.readFileSync(process.env.DB_SSL_CA_PATH).toString(),
        }
      : false,

    extra: {
       max: 20,                    // Máximo de conexiones
       min: 5,                     // Mínimo de conexiones
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,   // Cerrar conexiones inactivas
    allowExitOnIdle: false,
    },
  };
};

import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

async function getSecrets() {
  const client = new SecretsManagerClient({ region: 'us-east-1' });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: 'sales-system/prod' })
  );

  if (!response.SecretString) {
    throw new Error('AWS SecretString is undefined');
  }

  return JSON.parse(response.SecretString);
}