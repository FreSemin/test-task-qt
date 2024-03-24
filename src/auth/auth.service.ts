import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto';
import { UserService } from '@user/user.service';
import { UserEntity } from '@user/entities/user.entity';
import { AccessToken, RefreshToken, Tokens } from './interfaces';
import { InvalidCredentialsError, convertToMilliseconds } from '@common/utils';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { BEARER, DEFAULT_REFRESH_TOKEN_EXPIRE_TIME, DEFAULT_TOKEN_EXPIRE_TIME } from '@common/constants';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly configService: ConfigService,
    ) {}

    private generateRefreshTokenId(userId: string, agent: string): string {
        return `RT_${userId}_${agent}`;
    }

    private async getAccessToken(user: UserEntity): Promise<AccessToken> {
        return {
            accessToken:
                `${BEARER} ` +
                (await this.jwtService.signAsync(
                    {
                        sub: user.id,
                        email: user.email,
                    },
                    {
                        secret: this.configService.get('JWT_SECRET_KEY'),
                        expiresIn: this.configService.get('TOKEN_EXPIRE_TIME', DEFAULT_TOKEN_EXPIRE_TIME),
                    },
                )),
        };
    }

    private async getRefreshToken(userId: string, agent: string): Promise<RefreshToken> {
        const expiresTime = convertToMilliseconds(
            this.configService.get('TOKEN_REFRESH_EXPIRE_TIME', DEFAULT_REFRESH_TOKEN_EXPIRE_TIME),
        );

        const expiresDate = new Date(Date.now() + expiresTime);

        const refreshToken = {
            token: this.generateRefreshTokenId(userId, agent),
            exp: expiresDate.toISOString(),
            userId,
            userAgent: agent,
        };

        await this.redisService.set(refreshToken.token, refreshToken, expiresTime);

        return refreshToken;
    }

    async reg(registerDto: RegisterDto): Promise<UserEntity> {
        return await this.userService.create(registerDto);
    }

    async login(loginDto: LoginDto, agent: string): Promise<Tokens> {
        const user: UserEntity | null = await this.userService.findOneByEmail(loginDto.email);

        if (!user) {
            throw new InvalidCredentialsError();
        }

        if (!(await compare(loginDto.password, user.password))) {
            throw new InvalidCredentialsError();
        }

        const accessToken = await this.getAccessToken(user);

        return {
            accessToken: accessToken.accessToken,
            refreshToken: await this.getRefreshToken(user.id, agent),
        };
    }

    async refreshTokens(refreshToken: string, agent: string): Promise<Tokens> {
        const token = await this.redisService.get<RefreshToken>(refreshToken);

        if (!token) {
            throw new InvalidCredentialsError();
        }

        await this.redisService.del(token.token);

        if (new Date(token.exp) < new Date()) {
            throw new InvalidCredentialsError();
        }

        const newRefreshToken = await this.getRefreshToken(token.userId, agent);

        const user = await this.userService.findOneById(newRefreshToken.userId);

        if (!user) {
            throw new InvalidCredentialsError();
        }

        const accessToken = await this.getAccessToken(user);

        return {
            accessToken: accessToken.accessToken,
            refreshToken: newRefreshToken,
        };
    }

    async logout(refreshToken: string): Promise<void> {
        await this.redisService.del(refreshToken);
    }
}
