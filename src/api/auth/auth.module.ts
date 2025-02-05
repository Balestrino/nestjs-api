import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from 'src/api/users/users.service';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from 'src/api/users/users.module';

@Module({
  imports: [PassportModule, JwtModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, UsersService],
})
export class AuthModule {}
