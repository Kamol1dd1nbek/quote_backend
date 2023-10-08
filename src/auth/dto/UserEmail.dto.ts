import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserEmailDto {
  @ApiProperty({ example: 'test@test.test' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
