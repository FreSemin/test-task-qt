import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const Cookie = createParamDecorator((key: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    return key ? request.cookies?.[key] : request.cookies;
});
