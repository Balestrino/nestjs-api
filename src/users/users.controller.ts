import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

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

  @Post()
  createUser(@Body() request: CreateUserDto) {
    return this.usersService.create(request);
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
