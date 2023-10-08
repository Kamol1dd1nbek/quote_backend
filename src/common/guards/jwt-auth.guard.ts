import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpException(
        'User is not authorized',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new HttpException(
        'User is not authorized',
        HttpStatus.UNAUTHORIZED,
      );
    }
    let user: any = null;
    try {
      user = this.jwtService.verify(token);
    } catch (error) {
      throw new HttpException(
        'User is not authorized',
        HttpStatus.UNAUTHORIZED,
      );
    }
    req.user = user;
    return true;
  }
}
