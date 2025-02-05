import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare } from 'bcryptjs';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { context, trace } from '@opentelemetry/api';

import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { TokenPayload } from './interface/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  login(user: CreateUserDto, response: Response) {
    console.log('login ', user);
    // Get the current span from the tracer
    const span = trace.getActiveSpan();
    // recordException converts the error into a span event.
    if (span) {
      console.log('Span found', span);
      span.setAttribute('test', true);
      span.recordException(new Error('This is a test error'));
    } else {
      console.log('No span found');
    }

    const expiresAccessToken = new Date();
    expiresAccessToken.setMilliseconds(
      expiresAccessToken.getMilliseconds() +
        this.configService.getOrThrow<number>('jwtAccessTokenExpirationMs', {
          infer: true,
        }),
    );

    const tokenPayload: TokenPayload = {
      userId: user._id || '',
    };
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('jwtAccessTokenSecret', {
        infer: true,
      }),
      expiresIn: `${this.configService.getOrThrow(
        'jwtAccessTokenExpirationMs',
        { infer: true },
      )}ms`,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('jwtRefreshTokenSecret', {
        infer: true,
      }),
      expiresIn: '7d',
    });

    // Store refresh token securely (hashed) in the database
    // TODO: Implement refresh token storage

    // send accessToken in header
    response.setHeader('Authorization', `Bearer ${accessToken}`);

    const signInResponse = {
      id: user._id,
      email: user.email,
      accessToken,
      refreshToken,
    };

    return signInResponse;
  }

  async refreshTokens(userId: number, refreshToken: string) {
    // const user = await this.prisma.user.findUnique({
    //   where: { id: userId },
    // });

    // if (!user || !user.refreshToken) {
    //   throw new UnauthorizedException('Access Denied');
    // }

    // const isRefreshTokenValid = await bcrypt.compare(
    //   refreshToken,
    //   user.refreshToken,
    // );

    // if (!isRefreshTokenValid) {
    //   throw new UnauthorizedException('Access Denied');
    // }

    // const payload = {
    //   sub: user.id,
    //   email: user.email,
    // };

    // return {
    //   access_token: this.jwtService.sign(payload, {
    //     secret: process.env.JWT_SECRET,
    //     expiresIn: '15m',
    //   }),
    //   refresh_token: this.jwtService.sign(payload, {
    //     secret: process.env.JWT_REFRESH_SECRET,
    //     expiresIn: '7d',
    //   }),
    // };
    return {};
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await firstValueFrom(
        this.usersService.getUserByEmail(email),
      );
      const athenticated = await compare(password, user.password);
      if (!athenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch {
      throw new UnauthorizedException('Credentials are not valid');
    }
  }
}
