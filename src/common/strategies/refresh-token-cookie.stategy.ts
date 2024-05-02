import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';
import { JwtPayload, JwtPayloadWithRfreshToken } from '../../auth/types';

export const cookieExtractor: JwtFromRequestFunction = (req: Request) => {
  if (req && req.cookies) {
    return req.cookies['refresh_token'];
  }
  return null;
};

@Injectable()
export class RefreshTokenFromBearerStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.REFRESH_TOKEN_KEY,
      passResCallback: true,
    });
  }
  validate(req: Request, payload: JwtPayload): JwtPayloadWithRfreshToken {
    const refreshToken = req.cookies.refresh_token;
    console.log('hello from cookie');
    if (!refreshToken) throw new ForbiddenException('Refresh token is wrong');
    return {
      ...payload,
      refreshToken,
    };
  }
}
