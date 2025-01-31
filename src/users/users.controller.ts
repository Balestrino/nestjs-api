import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('healthcheck')
  healthCheck() {
    return this.usersService.healthCheck();
  }

  @Get('healthcheck-event')
  healthCheckEvent() {
    return this.usersService.healthCheckEvent();
  }

  @Get('error')
  error() {
    return this.usersService.error();
  }
}
