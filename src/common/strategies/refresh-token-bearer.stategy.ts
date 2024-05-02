import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, JwtPayloadWithRfreshToken } from '../../auth/types';

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
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader.split(' ')[1];
    console.log('hellow from authHeader');
    if (!refreshToken) throw new ForbiddenException("Refresh token noto'g'ri");
    return {
      ...payload,
      refreshToken,
    };
  }
}
