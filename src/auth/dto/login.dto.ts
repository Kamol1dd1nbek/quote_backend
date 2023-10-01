import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MinLength, IsEmail } from "class-validator";

export class SignInDto {
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
}
