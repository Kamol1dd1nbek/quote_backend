
import { SetMetadata, createParamDecorator } from '@nestjs/common';
export const Public = () => {
  return SetMetadata('isPublic', true);
};