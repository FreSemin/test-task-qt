import { DatabaseModule } from '@database/database.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '@user/user.module';
import { AuthModule } from '@auth/auth.module';
import { AuthGuard } from '@auth/guards/auth.guards';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            expandVariables: true,
        }),
        JwtModule.registerAsync({
            global: true,
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
        DatabaseModule,
        UserModule,
        AuthModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
})
export class AppModule {}
