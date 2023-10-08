import { PrismaService } from './../prisma/prisma.service';
import {
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  HttpStatus,
} from '@nestjs/common';

import { RestePasswordDto } from './dto/resetPassword.dto';
import { dates, decode, encode } from '../helpers/crypto';
import { AddMinutesToDate } from '../helpers/addMinutes';
import { MailService } from '../mail/mail.service';
import { UserEmailDto } from './dto/UserEmail.dto';
import { VerifyOtpDto } from './dto/VerifyOtp.dto';
import { ApiOperation } from '@nestjs/swagger';
import * as otpGenerator from 'otp-generator';
import { SignUpDto } from './dto/signup.dto';
import { JwtPayload, Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { Like, User } from '@prisma/client';
import { Response } from 'express';
import { SignInDto } from './dto';
import * as bcrypt from 'bcrypt';
import { v4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // Sign Up
  async signUp(
    signUpDto: SignUpDto,
    res: Response,
  ): Promise<{ message: string }> {
    const { first_name, last_name, email, password, confirm_password } =
      signUpDto;
    if (password !== confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }
    const condidate = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (condidate) {
      throw new BadRequestException('This is registered by email');
    }
    const hashed_password = await bcrypt.hash(password, 7);
    const newUser = await this.prismaService.user.create({
      data: {
        first_name,
        last_name,
        email,
        hashed_password,
        avatar: "user-avatar-icon-symbol.jpg"
      },
    });
    const uniqueKey: string = v4();
    const updatedUser = await this.prismaService.user.update({
      data: {
        activation_link: uniqueKey,
      },
      where: {
        id: newUser.id,
      },
    });
    try {
      await this.mailService.sendUserConfirmation(updatedUser);
      return {
        message: `We have sent a confirmation link to email: ${updatedUser.email}`,
      };
    } catch (error) {
      await this.prismaService.user.delete({
        where: { id: updatedUser.id },
      });
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  //Sign In
  async signIn(signInDto: SignInDto, res: Response): Promise<Tokens> {
    const { email, password } = signInDto;
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new BadRequestException('Email or password wrong!');
    }
    const isMatchPassowrd = await bcrypt.compare(
      password,
      user.hashed_password,
    );

    if (!isMatchPassowrd) {
      throw new BadRequestException('Email or password wrong!');
    }
    const tokens = await this.getTokens(user);
    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 7);
    const updatedUser = await this.prismaService.user.update({
      data: {
        hashed_refresh_token,
      },
      where: {
        id: user.id,
      },
    });
    res.cookie('refreshToken', tokens.refresh_token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return tokens;
  }

  //Sign out
  async signOut(id: number, res: Response): Promise<number> {
    const user = await this.prismaService.user.findFirst({
      where: {
        id,
        hashed_refresh_token: {
          not: null,
        },
      },
    });
    if (!user) {
      throw new ForbiddenException('Access denied');
    }
    await this.prismaService.user.update({
      data: {
        hashed_refresh_token: null,
      },
      where: {
        id,
      },
    });
    res.clearCookie('refreshToken');
    return id;
  }

  // Refresh token
  async refreshToken(
    id: number,
    refreshToken: string,
    res: Response,
  ): Promise<Tokens> {
    // const decodedToken = this.jwtService.decode(refreshToken);
    const decodedToken = this.jwtService.decode(refreshToken);

    if (id !== decodedToken['id']) {
      throw new BadRequestException('User not found');
    }
    const user = await this.prismaService.user.findFirst({
      where: {
        id,
      },
    });
    if (!user || !user.hashed_refresh_token) {
      throw new ForbiddenException('Access denied');
    }
    const isRefreshTokenMatch = await bcrypt.compare(
      refreshToken,
      user.hashed_refresh_token,
    );
    if (!isRefreshTokenMatch) {
      throw new ForbiddenException('Access denied');
    }
    const tokens = await this.getTokens(user);
    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 7);
    await this.prismaService.user.update({
      data: {
        hashed_refresh_token,
      },
      where: {
        id: user.id,
      },
    });
    res.cookie('refreshToken', tokens.refresh_token, {
      maxAge: 7 * 24 * 60 * 60 * 100,
      httpOnly: true,
    });
    return tokens;
  }

  //Verification Email
  async verifyEmail(id: string, res: Response) {
    const user = await this.prismaService.user.findFirst({
      where: {
        activation_link: id,
        is_active: false,
      },
    });
    if (!user) {
      throw new BadRequestException('User is already activated');
    }
    user.is_active = true;
    const tokens = await this.getTokens(user);
    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 7);

    const updatedUser = await this.prismaService.user.update({
      data: {
        hashed_refresh_token,
        activation_link: null,
        is_active: true,
      },
      where: {
        id: user.id,
      },
    });

    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 100,
    });

    throw new HttpException(
      { message: 'User successfully activated', tokens },
      HttpStatus.OK,
    );
  }

  // Get tokens
  async getTokens(user: User): Promise<Tokens> {
    const jwPayload: JwtPayload = {
      id: user.id,
      is_active: user.is_active,
      is_admin: user.is_admin,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwPayload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(jwPayload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // Send OTP
  async newOTP(userEmailDto: UserEmailDto) {
    const email = userEmailDto.email;
    const isHaveEmail = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
    if (!isHaveEmail)
      throw new BadRequestException('User with such email was not found');
    const otp = otpGenerator.generate(5, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    try {
      await this.mailService.sendOtp(otp, isHaveEmail.email);
    } catch (error) {
      throw new BadRequestException(
        'Something went wrong, please try again later',
      );
    }
    const now = new Date();
    const expiration_time = AddMinutesToDate(now, 5);
    const oldOtp = await this.prismaService.otp.findFirst({
      where: {
        email,
      },
    });
    if (oldOtp) {
      await this.prismaService.otp.delete({
        where: {
          id: oldOtp.id,
        },
      });
    }
    const newOTP = await this.prismaService.otp.create({
      data: {
        otp: Number(otp),
        expiration_time,
        email,
        user_id: isHaveEmail.id,
      },
    });
    const details = {
      timestamp: now,
      email,
      success: true,
      message: 'OTP send to user',
      otp_id: newOTP.id,
    };
    const encoded = await encode(JSON.stringify(details));
    return { status: 'Success', Details: encoded };
  }

  // Verify OTP
  async verifyOTP(verifyOtpDto: VerifyOtpDto) {
    const { verification_key, email, otp } = verifyOtpDto;
    const currentDate = new Date();
    const decoded = await decode(verification_key);
    const obj = JSON.parse(decoded);
    const email_obj = obj.email;
    if (email_obj !== email) {
      throw new BadRequestException('OTP was not sent to this email');
    }
    const result = await this.prismaService.otp.findFirst({
      where: {
        id: obj.otp_id,
      },
    });
    if (result != null) {
      if (!result.verified) {
        if (dates.compare(result.expiration_time, currentDate)) {
          if (result.otp === +otp) {
            const user = await this.prismaService.user.findFirst({
              where: {
                email,
              },
            });
            if (user) {
              await this.prismaService.otp.update({
                data: {
                  verified: true,
                },
                where: {
                  id: obj.otp_id,
                },
              });

              throw new HttpException(
                'Password reset confirmed',
                HttpStatus.ACCEPTED,
              );
            } else {
              throw new BadRequestException('No such user exists');
            }
          } else {
            throw new BadRequestException('OTP is not match');
          }
        } else {
          throw new BadRequestException('OTP expired');
        }
      } else {
        throw new BadRequestException('OTP already used');
      }
    } else {
      throw new BadRequestException('No such user exists');
    }
  }

  //Reset password
  async resetPassword(resetPasswordDto: RestePasswordDto) {
    const { email, password, confirm_password } = resetPasswordDto;
    if (password !== confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
      },
      include: {
        otp: true,
      },
    });
    if (user) {
      if (user?.otp[0]?.verified) {
        const hashed_password = await bcrypt.hash(password, 7);
        await this.prismaService.user.update({
          data: {
            hashed_password,
          },
          where: {
            id: user.id,
          },
        });
        await this.prismaService.otp.delete({
          where: {
            id: user.otp[0].id,
          },
        });
        throw new HttpException('Password successfully updated', HttpStatus.OK);
      } else {
        throw new ForbiddenException('Access denied');
      }
    } else {
      throw new BadRequestException('User not found');
    }
  }
}
