import {
    Body,
    ClassSerializerInterceptor,
    ConflictException,
    Controller,
    Get,
    HttpStatus,
    NotFoundException,
    Post,
    Res,
    UnauthorizedException,
    UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { EmailTakenError, EntityNotFoundError, InvalidCredentialsError } from '@common/utils';
import { Tokens } from './interfaces';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookie, UserAgent } from '@common/decorators';

const REFRESH_TOKEN = 'refreshtoken';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    private setRefreshTokenToCookies(tokens: Tokens, res: Response) {
        if (!tokens) {
            throw new UnauthorizedException();
        }

        // TODO: add Cookie name to constants
        res.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
            httpOnly: true,
            sameSite: 'lax',
            expires: new Date(tokens.refreshToken.exp),
            secure: this.configService.get('NODE_ENV', 'development') === 'production',
            path: '/',
        });

        res.status(HttpStatus.CREATED).json({ accessToken: tokens.accessToken });
    }

    @Post('reg')
    async reg(@Body() registerDto: RegisterDto) {
        try {
            return await this.authService.reg(registerDto);
        } catch (err) {
            if (err instanceof EmailTakenError) {
                throw new ConflictException(err.message);
            }

            throw err;
        }
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res() res: Response, @UserAgent() agent: string) {
        try {
            const tokens = await this.authService.login(loginDto, agent);

            this.setRefreshTokenToCookies(tokens, res);
        } catch (err) {
            if (err instanceof EntityNotFoundError) {
                throw new NotFoundException(err.message);
            }

            if (err instanceof InvalidCredentialsError) {
                throw new UnauthorizedException(err.message);
            }

            throw err;
        }
    }

    @Get('refresh')
    async refreshTokens(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response, @UserAgent() agent: string) {
        try {
            if (!refreshToken) {
                throw new UnauthorizedException();
            }

            const tokens = await this.authService.refreshTokens(refreshToken, agent);

            this.setRefreshTokenToCookies(tokens, res);
        } catch (err) {
            if (err instanceof InvalidCredentialsError) {
                throw new UnauthorizedException(err.message);
            }

            throw err;
        }
    }
}
