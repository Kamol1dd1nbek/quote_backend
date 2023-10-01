import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MinLength, IsEmail } from "class-validator";

export class SignUpDto {
    @ApiProperty({ example: 'Xurshid', description: '| User: first name' })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    first_name: string;

    @ApiProperty({ example: 'Rasulov', description: '| User: last name' })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    last_name: string;

    @ApiProperty({ example: 'xurshidbek123@gmail.com', description: '| User: email' })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'xurshid1234', description: '| User: password' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'xurshid1234', description: '| User: confirm password' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    confirm_password: string;
}
