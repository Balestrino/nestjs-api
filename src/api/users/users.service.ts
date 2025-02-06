import {
  Inject,
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { trace, context, propagation } from '@opentelemetry/api';
import { CreateUserDto } from './dto/create-user.dto';
import { throwError, timer } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {
    this.logger.log('UsersService instantiated with USER_SERVICE');
  }

  healthCheck() {
    const tracer = trace.getTracer('microservice');

    // Start a new span with a custom name
    return tracer.startActiveSpan('gateway/users/healthCheck', (span) => {
      try {
        const carrier: Record<string, string> = {};

        // Inject the trace context into the carrier
        propagation.inject(context.active(), carrier);

        return this.client.send('user.healthcheck', {
          data: 'Hello from API Gateway',
          traceContext: carrier,
        });
      } catch (error) {
        span.recordException(error);
        throw error;
      } finally {
        span.end(); // Ensure the span is properly closed
      }
    });
  }

  error() {
    return this.client.send('user.error', {}).pipe(
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
      }),
    );
  }

  create(createUserDto: CreateUserDto) {
    return this.client.send('user.create', createUserDto);
  }

  getUserByEmail(email: string) {
    const tracer = trace.getTracer('api-gateway');

    return tracer.startActiveSpan('gateway/users/getUserByEmail', (span) => {
      try {
        // Create a carrier for propagating trace context
        const traceCarrier: Record<string, string> = {};
        propagation.inject(context.active(), traceCarrier);

        return this.client
          .send('user.getByEmail', {
            data: { email },
            traceContext: traceCarrier,
          })
          .pipe(
            timeout(2000),
            retry({
              count: 3,
              delay: (error, retryCount) => {
                if (error.name === 'TimeoutError') {
                  console.warn(`Timeout error. Retry attempt ${retryCount}`);
                  // Return an observable that delays for 100 ms
                  return timer(100);
                }
                // For non-timeout errors, don't retry
                return throwError(() => error);
              },
            }),
            catchError((error) => {
              if (error.name === 'TimeoutError') {
                // Record the exception in the active span
                span.recordException('user/getByEmail timeout error');
                // Throw a more informative HTTP exception
                throw new HttpException(
                  'Unable to retrieve user. Please try again later.',
                  HttpStatus.REQUEST_TIMEOUT,
                );
              }
              // Record the exception in the active span
              span.recordException(error);
              throw error;
            }),
          );
      } catch (error) {
        // Log unexpected errors
        console.error('Unexpected error in getUserByEmail:', error);

        // Record the exception in the active span
        span.recordException(error);

        // Re-throw the error for upstream handling
        throw error;
      } finally {
        // Ensure the span is always closed, even if an error occurs
        span.end();
      }
    });
  }

  findAll() {
    return this.client.send('user.list', {});
  }

  findOne(id: number) {
    return this.client.send('user.findOne', id);
  }

  remove(id: number) {
    return this.client.send('user.remove', id);
  }

  listRequest() {
    return this.client.emit('user.list.requested', {});
  }
}
