import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '@user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@redis/redis.module';

@Module({
    imports: [
        UserModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET_KEY'),
                signOptions: {
                    // TODO: add default value
                    expiresIn: configService.get('TOKEN_EXPIRE_TIME', '60s'),
                },
            }),
            inject: [ConfigService],
        }),
        RedisModule,
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
