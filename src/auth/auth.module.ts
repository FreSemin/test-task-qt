import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '@user/user.module';
import { RedisModule } from '@redis/redis.module';
import { GUARDS } from './guards';

@Module({
    imports: [UserModule, RedisModule],
    controllers: [AuthController],
    providers: [AuthService, ...GUARDS],
})
export class AuthModule {}
