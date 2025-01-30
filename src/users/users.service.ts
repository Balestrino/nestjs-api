import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';

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
