import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto, LoginAuthDto, UpdateAuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { JwtPayload, Tokens } from './types';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly logger: Logger,
  ) {}
  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 7);
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken,
      },
    });
  }

  async signup(createUserDto: CreateUserDto, res: Response): Promise<Tokens> {
    this.logger.debug('Signup', UsersService.name);  
    const newUser = await this.usersService.create(createUserDto);
    if (!newUser) {
      this.logger.error("error")
      throw new InternalServerErrorException('Yangi user yaratishda xatolik');
    }

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRefreshToken(newUser.id, tokens.refresh_token);

    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: Number(process.env.COOKIE_TIME),
      httpOnly: true,
    });

    return tokens;
  }

  async login(loginDto: LoginAuthDto, res: Response): Promise<any> {
    const { email, password } = loginDto;
    const user = await this.prismaService.user.findUnique({ where: { email } });
    console.log(user);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isValidPassword) {
      throw new BadRequestException('Invalid password');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: 15 * 24 * 60 * 1000, // 15 days expiration time
      httpOnly: true, // HTTP only cookie
    });

    return {
      message: 'User logged in',
      tokens,
    };
  }

  async refreshToken(
    userId: number,
    refreshToken: string,
    res: Response,
  ): Promise<any> {
    // console.log(refreshToken);

    // const decodedToken = await this.jwtService.decode(refreshToken);
    // if (!decodedToken || userId !== decodedToken['sub']) {
    //   throw new BadRequestException('Invalid user or token');
    // }

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.hashedRefreshToken) {
      throw new BadRequestException('User not found');
    }

    const tokenMatch = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!tokenMatch) {
      throw new ForbiddenException('Forbidden');
    }

    const tokens = await this.getTokens(user.id, user.email);

    // const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 7);

    // const updatedUser = await this.prismaService.user.update({
    //   where: { id: user.id },
    //   data: { hashedRefreshToken },
    // });
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: 15 * 24 * 60 * 1000, // 15 days expiration time
      httpOnly: true, // HTTP only cookie
    });

    return tokens;
  }

  async logout(userId: number, res: Response) {
    try {
      // Update user's hashed password to null to invalidate refresh token
      await this.prismaService.user.update({
        where: { id: userId },
        data: { hashedPassword: null },
      });
      console.log('hi----');

      // Clear refresh token cookie
      res.clearCookie('refresh_token');

      return { message: 'User logged out successfully' };
    } catch (error) {
      throw new Error('Error logging out user');
    }
  }

  // Other methods...

  create(createAuthDto: CreateAuthDto) {
    return;
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
