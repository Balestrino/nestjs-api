import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller({
  path: 'user',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  healthCheck() {
    return this.usersService.healthCheck();
  }

  // @Get('healthcheck-event')
  // healthCheckEvent() {
  //   return this.usersService.healthCheckEvent();
  // }

  // @Get('error')
  // error() {
  //   return this.usersService.error();
  // }
}
