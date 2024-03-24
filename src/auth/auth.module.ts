import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '@user/user.module';
import { RedisModule } from '@redis/redis.module';
import { GUARDS } from './guards';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DEFAULT_TOKEN_EXPIRE_TIME } from '@common/constants';

@Module({
    imports: [
        UserModule,
        RedisModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET_KEY'),
                signOptions: {
                    expiresIn: configService.get('TOKEN_EXPIRE_TIME', DEFAULT_TOKEN_EXPIRE_TIME),
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtService, ...GUARDS],
    exports: [JwtService],
})
export class AuthModule {}
