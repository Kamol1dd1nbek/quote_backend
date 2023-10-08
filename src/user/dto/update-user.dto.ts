import { ApiOperation, ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({example: "Firstname"})
    first_name?: string;

    @ApiProperty({example: "Firstname"})
    last_name?: string;

    @ApiProperty({example: "", description: "It is must be file"})
    avatar?: any;
}
