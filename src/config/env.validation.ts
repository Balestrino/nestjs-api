import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  NODE_ENV: string;

  @IsString()
  APP_NAME: string;

  @IsString()
  APP_VERSION: string;

  @IsNumber()
  APP_PORT: number;

  @IsNumber()
  APP_PORT_DEV: number;

  @IsString()
  API_PREFIX: string = '/api';

  @IsString()
  BACKEND_DOMAIN: string;

  @IsString()
  NATS_HOST: string;

  @IsNumber()
  NATS_PORT: number;

  @IsString()
  JWT_ACCESS_TOKEN_SECRET: string;

  @IsNumber()
  JWT_ACCESS_TOKEN_EXPIRATION_MS: number;

  @IsString()
  JWT_REFRESH_TOKEN_SECRET: string;

  // Example of a variable with allowed values
  @IsString()
  LOG_LEVEL: 'info' | 'warn' | 'error' = 'info';
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true, // Important: Allows env vars to be converted to correct types
  });

  const errors = validateSync(validatedConfig);
  if (errors.length > 0) {
    throw new Error(`Invalid environment variables: ${errors.toString()}`);
  }
  return validatedConfig;
}
