import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RestePasswordDto {
    @ApiProperty({example: "test@test.test", description: "User: email"})
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({example: "1234qwer", description: "User: password"})
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({example: "1234qwer", description: "User: confirm password"})
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    confirm_password: string;
}