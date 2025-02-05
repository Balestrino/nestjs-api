import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { StrategyOptionsWithRequest } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  validate(req: any, payload: any) {
    const refreshToken = req.body.refresh_token;
    return {
      ...payload,
      refreshToken,
    };
  }
}
