import { DatabaseModule } from '@database/database.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '@user/user.module';
import { AuthModule } from '@auth/auth.module';
import { AuthGuard } from '@auth/guards/auth.guards';
import { APP_GUARD } from '@nestjs/core';
import { PostModule } from './post/post.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            expandVariables: true,
        }),
        DatabaseModule,
        UserModule,
        AuthModule,
        PostModule,
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
