import {
  Controller,
  HttpStatus,
  HttpCode,
  Param,
  Post,
  Body,
  Get,
  Res,
} from '@nestjs/common';

import { CookieGetter } from '../common/decorators/cookieGetter.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RestePasswordDto } from './dto/resetPassword.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VerifyOtpDto } from './dto/VerifyOtp.dto';
import { UserEmailDto } from './dto/UserEmail.dto';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { Response } from 'express';
import { SignInDto } from './dto';

@ApiTags('AUTH')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Sign up
  @ApiOperation({ summary: '| Sign Up' })
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  signup(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signUp(signUpDto, res);
  }
  //Sign in
  @ApiOperation({ summary: '| Sign IN' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signIn(signInDto, res);
  }

  // Sign out
  @ApiOperation({ summary: '| Sign Out' })
  @Post('signout/:id')
  singOut(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    return this.authService.signOut(+id, res);
  }

  // Refresh token
  @ApiOperation({ summary: '| Refresh token' })
  @Public()
  @Post('refresh/:id')
  refreshToken(
    @Param('id') id: string,
    @CookieGetter('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshToken(+id, refreshToken, res);
  }

  // Activation
  @ApiOperation({ summary: '| Activation' })
  @Public()
  @Get('activate/:id')
  activate(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    return this.authService.verifyEmail(id, res);
  }

  // Send OTP for reset password
  @ApiOperation({ summary: '| Send OTP' })
  @Public()
  @Post('send-otp')
  sendOtp(@Body() userEmailDto: UserEmailDto) {
    return this.authService.newOTP(userEmailDto);
  }

  // Verify OTP for reset password
  @ApiOperation({ summary: '| Verify otp' })
  @Public()
  @Post('verify')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOTP(verifyOtpDto);
  }

  //Reset password
  @ApiOperation({ summary: '| Reset password' })
  @Public()
  @Post('reset')
  restePassword(@Body() restePasswordDto: RestePasswordDto) {
    return this.authService.resetPassword(restePasswordDto);
  }
}
