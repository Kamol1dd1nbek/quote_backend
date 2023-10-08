import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const getCurrentUser = createParamDecorator(
  async (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!request) {
      throw new UnauthorizedException('User is not authorized');
    }
    if (!request.user) {
      throw new UnauthorizedException('User not found');
    } else {
      return request.user;
    }
  },
);
