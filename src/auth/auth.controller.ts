import { Controller, Post, Res, Body, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard'; // Adjust the path as necessary
import { CurrentUser } from './decorators/current-user.decorator';
import { CreateUserDto } from 'src/users/dto/create-user.dto'; // Adjust the path as necessary

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(
    @CurrentUser() user: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }

  @Post('refresh')
  async refreshTokens(
    @Body('userId') userId: number,
    @Body('refresh_token') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
