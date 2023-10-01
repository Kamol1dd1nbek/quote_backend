import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto';
import { CookieGetter } from '../common/decorators/cookieGetter.decorator';

@ApiTags('AUTH')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Sign up
  @ApiOperation({ summary: '| Sign Up' })
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
  @ApiOperation({summary: "| Refresh token"})
  @Post("refresh/:id")
  refreshToken(
    @Param("id") id:string,
    @CookieGetter("refreshToken") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ){
    return this.authService.refreshToken(+id, refreshToken, res);
  }

  // Activation
  @ApiOperation({ summary: '| Activation' })
  @Get('activate/:id')
  activate(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    return this.authService.verifyEmail(id, res);
  }
}
