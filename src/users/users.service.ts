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
import { catchError } from 'rxjs/operators';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {
    this.logger.log('UsersService instantiated with USER_SERVICE');
  }

  healthCheck() {
    const tracer = trace.getTracer('api-gateway');

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

  create(createUserDto: CreateUserDto) {
    return this.client.send('user.create', createUserDto);
  }

  getUserByEmail(email: string) {
    const tracer = trace.getTracer('api-gateway');

    // Start a new span with a custom name
    return tracer.startActiveSpan('gateway/users/getUserByEmail', (span) => {
      try {
        const carrier: Record<string, string> = {};

        // Inject the trace context into the carrier
        propagation.inject(context.active(), carrier);

        return this.client.send('user.getByEmail', {
          data: { email },
          traceContext: carrier,
        });
      } catch (error) {
        console.log('Error:', error);
        span.recordException(error);
        throw error;
      } finally {
        span.end(); // Ensure the span is properly closed
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
