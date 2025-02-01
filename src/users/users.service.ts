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

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {
    this.logger.log('UsersService instantiated with USER_SERVICE');
  }

  healthCheck() {
    return this.client.send('user.healthcheck', {});
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
