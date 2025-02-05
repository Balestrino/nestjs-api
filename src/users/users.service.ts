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
    const currentSpan = trace.getActiveSpan();
    const carrier: Record<string, string> = {};

    // Inject the trace context into the carrier
    propagation.inject(context.active(), carrier);

    // Send the request with tracing headers
    return this.client.send('user.healthcheck', {
      data: 'Hello',
      traceContext: carrier,
    });
    return this.client.send('user.healthcheck', {});
  }

  create(createUserDto: CreateUserDto) {
    return this.client.send('user.create', createUserDto);
  }

  getUserByEmail(email: string) {
    return this.client.send('user.getByEmail', email);
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
