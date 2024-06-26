import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { Tokens } from './types';
import { CreateAuthDto, LoginAuthDto } from './dto';
import { AccessTokenGuard } from '../common/guards';
import { CookieGetter } from '../decorators/cookieGetter.decorator';
import { GetCurrentUser, GetCurrentUserId, Public } from '../common/decorators';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { create } from 'domain';

@UseGuards(AccessTokenGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Tokens> {
    return this.authService.signup(createUserDto, res);
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    return this.authService.login(loginAuthDto, res);
  }


  @Public()
  // @Post(':id/refresh')
  @Post("refresh")
  async refresh(
    // @Param('id') id: number,
    // @CookieGetter('refresh_token') refreshToken: string,
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshToken(+userId, refreshToken, res);
  }

  @Post('logout')
  async logout(
    @GetCurrentUserId() userId: number,
    // @CookieGetter('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(userId, res);
  }
}
