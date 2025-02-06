import {
  Injectable,
  Inject,
  Logger,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { ClientProxy, NatsRecordBuilder } from '@nestjs/microservices';
// import { ClsService } from 'nestjs-cls';
import * as nats from 'nats';
import { catchError } from 'rxjs/operators';
import { trace, context, propagation } from '@opentelemetry/api';

@Injectable()
export class RootService {
  private readonly logger = new Logger(RootService.name);
  constructor(
    @Inject('ROOT_SERVICE') private readonly client: ClientProxy,
    // private readonly cls: ClsService,
    // @Inject(Logger) private readonly logger: LoggerService,
  ) {
    this.logger.log('RootService instantiated with ROOT_SERVICE');
  }

  healthCheck(message: any) {
    const tracer = trace.getTracer('microservice');
    const span = tracer.startSpan('root/healthCheck');
    this.logger.log(
      'root/healthCheck called with message: ' + JSON.stringify(message),
    );
    span.end();
    return { message: 'OK' };
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
                message: error.message,
                status: error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
                debug: error.error,
              },
              HttpStatus.BAD_REQUEST,
            );
          }
          throw new HttpException(
            {
              message: error.message,
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              debug: error.error,
            },
            HttpStatus.BAD_REQUEST,
          );
          // throw new HttpException(
          //   'Internal server error',
          //   HttpStatus.INTERNAL_SERVER_ERROR,
          // );
        }),
      )
      .toPromise();
  }
}
