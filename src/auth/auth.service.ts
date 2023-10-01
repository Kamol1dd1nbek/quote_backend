import { PrismaService } from './../prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { JwtPayload, Tokens } from './types';
import { MailService } from '../mail/mail.service';
import { v4 } from 'uuid';
import { ApiOperation } from '@nestjs/swagger';
import { SignInDto } from './dto';
import { User } from '@prisma/client';

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
}
