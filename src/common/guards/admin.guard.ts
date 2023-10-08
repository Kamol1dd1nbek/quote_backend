import {
  ExecutionContext,
  HttpException,
  CanActivate,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
export class Admin implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request) {
      throw new HttpException(
        'User is not authorized',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (!request.user) {
      throw new HttpException('User is not found', HttpStatus.UNAUTHORIZED);
    }
    if (request.user && request.user.is_admin) {
      return true;
    }
  }
}
