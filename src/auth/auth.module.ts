import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '@user/user.module';
import { RedisModule } from '@redis/redis.module';

@Module({
    imports: [UserModule, RedisModule],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
