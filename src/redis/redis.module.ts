import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { convertToMilliseconds } from '@common/utils';

@Module({
    imports: [
        CacheModule.registerAsync<RedisClientOptions>({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                store: await redisStore({
                    url: configService.get('REDIS_URL'),
                    // TODO: add default time to constants
                    ttl: convertToMilliseconds(configService.get('REDIS_TTL', '1h')),
                }),
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [RedisService],
    exports: [RedisService],
})
export class RedisModule {}
