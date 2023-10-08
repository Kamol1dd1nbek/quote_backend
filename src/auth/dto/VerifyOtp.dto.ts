import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class VerifyOtpDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    verification_key: string;

    @IsNumber()
    otp: string;
}