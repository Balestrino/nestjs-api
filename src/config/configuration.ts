import { validateEnv } from './env.validation';

export const configuration = () => {
  const validatedConfig = validateEnv(process.env);
  return {
    env: validatedConfig.NODE_ENV,
    appName: validatedConfig.APP_NAME,
    appVersion: validatedConfig.APP_VERSION,
    appPort: validatedConfig.APP_PORT,
    appPortDev: validatedConfig.APP_PORT_DEV,
    apiPrefix: validatedConfig.API_PREFIX,
    backendDomain: validatedConfig.BACKEND_DOMAIN,
    natsHost: validatedConfig.NATS_HOST,
    natsPort: validatedConfig.NATS_PORT,
    jwtAccessTokenSecret: validatedConfig.JWT_ACCESS_TOKEN_SECRET,
    jwtAccessTokenExpirationMs: validatedConfig.JWT_ACCESS_TOKEN_EXPIRATION_MS,
    jwtRefreshTokenSecret: validatedConfig.JWT_REFRESH_TOKEN_SECRET,
    logLevel: validatedConfig.LOG_LEVEL,
  };
};
