import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadWithRfreshToken } from '../../auth/types';

export const GetCurrentUser = createParamDecorator(
  (
    data: keyof JwtPayloadWithRfreshToken | undefined,
    context: ExecutionContext,
  ) => {
    const request = context.switchToHttp().getRequest();
    console.log(data);
    console.log(request.user);

    if (!data) return request.user;
    return request.user[data];
  },
);
