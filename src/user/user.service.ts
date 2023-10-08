import { FilesService } from './../files/files.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  mixin,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FilesService,
  ) {}

  // Delete user for ADMIN
  async delete(id: number, isAdminId: number) {
    if (id === isAdminId) {
      throw new BadRequestException(
        'You are an admin and cannot remove yourself',
      );
    }
    try {
      await this.prismaService.user.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }
    throw new HttpException('User successfully deleted', HttpStatus.OK);
  }

  // Update user
  async update(
    id: number,
    userId: number,
    isAdmin: boolean,
    updateUserDto: UpdateUserDto,
  ) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: id,
      },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    
    if (user.id === userId || isAdmin) {
      const { first_name, last_name, avatar } = updateUserDto;
      let url: string;
      if (avatar) {
        url = await this.fileService.createFile(avatar);
        console.log(url);
      }
      await this.prismaService.user.update({
        data: {
          ...updateUserDto,
          avatar: url,
        },
        where: {
          id: user.id,
        },
      });
    } else {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }
  }

  // Get all
  async getAllUsers(): Promise<User[]>{
    const users = await this.prismaService.user.findMany({});
    if(users.length === 0) {
      throw new HttpException("Users do not exist yet", HttpStatus.NOT_FOUND)
    } else {
      return users;
    }
  }
}
