import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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

  @Get('error')
  error() {
    return this.usersService.error();
  }

  @Post()
  createUser(@Body() request: CreateUserDto) {
    return this.usersService.create(request);
  }

  @Get('getByEmail')
  getUserByEmail(@Query('email') email: string) {
    console.log('email', email);
    return this.usersService.getUserByEmail(email);
  }
}
