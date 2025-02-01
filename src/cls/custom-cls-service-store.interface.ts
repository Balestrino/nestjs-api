import { CLS_ID, ClsStore } from 'nestjs-cls';

export interface ICustomClsServiceStore extends ClsStore {
  [CLS_ID]: string;
  mode: 'cron' | 'http';
  ip: string | undefined;
}
