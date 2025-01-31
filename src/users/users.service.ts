import {
  Inject,
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {
    this.logger.log('UsersService instantiated with USER_SERVICE');
    this.logger.log(client);
  }

  healthCheck() {
    return this.client.send('user.healthcheck', {});
  }

  healthCheckEvent() {
    return this.client.emit('user.healthcheck-event', {});
  }

  error(): Observable<any> {
    // return this.client.send('user.error', {});

    return this.client.send('user.error', {}).pipe(
      catchError((error) => {
        if (error?.error) {
          // It's a developer-friendly error :)
          throw new HttpException(
            {
              status: error.status || 'error',
              message: error.message,
              statusCode: error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
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
    );
  }

  create(createUserDto: CreateUserDto) {
    return this.client.send('user.create', createUserDto);
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
