import { AppConfig } from './app-config.type';
import { TransportConfig } from './transport-config.type';

export type AllConfigType = {
  app: AppConfig;
  transport: TransportConfig;
};
