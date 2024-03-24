import { JwtPayload } from '@auth/interfaces';
import { isPublic } from '@common/decorators';
import { extractTokenFromHeader } from '@common/utils';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(cxt: ExecutionContext): Promise<boolean> {
        if (isPublic(cxt, this.reflector)) {
            return true;
        }

        const request = cxt.switchToHttp().getRequest();

        const token = extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_SECRET_KEY'),
            });

            // TODO: refactor
            request['user'] = payload;
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }
}
