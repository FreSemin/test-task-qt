import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
    constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        await this.cache.store.set(key, value, ttl);
    }

    async get<T>(key: string): Promise<T | null> {
        return (await this.cache.store.get(key)) ?? null;
    }

    async del(key: string): Promise<void> {
        await this.cache.store.del(key);
    }
}
