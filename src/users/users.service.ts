import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrpyt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const candidate = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (candidate) {
      throw new BadRequestException('User already exists!');
    }
    const role = await this.prismaService.role.findUnique({
      where: {
        name: createUserDto.role,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found!');
    }

    const hashedPassword = await bcrpyt.hash(createUserDto.password, 7);

    const newUser = await this.prismaService.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        hashedPassword,
        roles: { create: [{ roleId: role.id }] },
      },
    });

    return newUser;
  }

  findAll() {
    return this.prismaService.user.findMany({
      include: { roles: { include: { role: true } } },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
