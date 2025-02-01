import {
  Injectable,
  Inject,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy, NatsRecordBuilder } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import * as nats from 'nats';

import { catchError } from 'rxjs/operators';

@Injectable()
export class RootService {
  private readonly logger = new Logger(RootService.name);
  constructor(
    @Inject('ROOT_SERVICE') private readonly client: ClientProxy,
    private readonly cls: ClsService,
  ) {
    this.logger.log('RootService instantiated with ROOT_SERVICE');
  }

  healthCheck() {
    console.log('healthCheck correlationId: ', this.cls.get('correlationId'));
    const headers = nats.headers();
    headers.set('x-correlation-id', this.cls.get('correlationId'));
    const record = new NatsRecordBuilder({}).setHeaders(headers).build();
    return this.client.send('user.healthcheck', record);
  }

  error(): Promise<any> {
    return this.client
      .send('user.error', {})
      .pipe(
        catchError((error) => {
          if (error?.error) {
            // It's a developer-friendly error :)
            throw new HttpException(
              {
                status: error.status || 'error',
                message: error.message,
                statusCode:
                  error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
                error: error.error,
              },
              HttpStatus.BAD_REQUEST,
            );
          }
          throw new HttpException(
            'Internal server error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      )
      .toPromise();
  }
}
