import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Admin } from '../common/guards/admin.guard';
import { getCurrentUser } from '../common/decorators/getCurrentUser.decorator';
import { JwtPayload } from '../auth/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '| Delete user' })
  @UseGuards(Admin)
  @Delete(':id')
  delete(@Param('id') id: string, @getCurrentUser() currentUser: JwtPayload) {
    return this.userService.delete(+id, currentUser.id);
  }

  @ApiOperation({ summary: '| Set profile photo' })
  @Put('update/:id')
  @UseInterceptors(FileInterceptor('avatar'))
  setProfilePhoto(
    @Param('id') id: string,
    @getCurrentUser() currentuser: JwtPayload,
    @UploadedFile() avatar: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(+id, currentuser.id, currentuser.is_admin, {
      ...updateUserDto,
      avatar,
    });
  }

  @ApiOperation({ summary: "| Get all users" })
  @Get()
  getAllUsers(): Promise<User[]>{
    return this.userService.getAllUsers();
  }
}
