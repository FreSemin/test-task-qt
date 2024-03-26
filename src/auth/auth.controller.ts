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
import { Cookie, Public, UserAgent } from '@common/decorators';
import { NODE_ENV } from '@common/constants';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@user/entities/user.entity';
import { AccessTokenResponse } from './responses';

const REFRESH_TOKEN_COOKIE = 'refresh_token';

@ApiTags('Auth')
@Public()
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

        res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken.token, {
            httpOnly: true,
            sameSite: 'lax',
            expires: new Date(tokens.refreshToken.exp),
            secure: this.configService.get('NODE_ENV', NODE_ENV.DEV) === NODE_ENV.PROD,
            path: '/',
        });

        res.status(HttpStatus.CREATED).json({ accessToken: tokens.accessToken });
    }

    private deleteRefreshTokenFromCookies(res: Response) {
        res.cookie(REFRESH_TOKEN_COOKIE, '', {
            httpOnly: true,
            secure: true,
            expires: new Date(),
        });

        res.sendStatus(HttpStatus.OK);
    }

    @ApiBody({ type: RegisterDto })
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('reg')
    @ApiResponse({ status: HttpStatus.CREATED, type: User })
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

    @ApiBody({ type: LoginDto })
    @Post('login')
    @ApiResponse({ status: HttpStatus.CREATED, type: AccessTokenResponse })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Wrong email or password' })
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
    @ApiResponse({ status: HttpStatus.CREATED, type: AccessTokenResponse })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Wrong email or password' })
    async refreshTokens(
        @Cookie(REFRESH_TOKEN_COOKIE) refreshToken: string,
        @Res() res: Response,
        @UserAgent() agent: string,
    ) {
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

    @Get('logout')
    @ApiResponse({ status: HttpStatus.OK })
    async logout(@Cookie(REFRESH_TOKEN_COOKIE) refreshToken: string, @Res() res: Response) {
        try {
            if (!refreshToken) {
                res.sendStatus(HttpStatus.OK);

                return;
            }

            await this.authService.logout(refreshToken);

            this.deleteRefreshTokenFromCookies(res);
        } catch (err) {
            throw err;
        }
    }
}
