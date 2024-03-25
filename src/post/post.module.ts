import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post } from './entity/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@user/user.module';
import { RedisModule } from '@redis/redis.module';

@Module({
    imports: [UserModule, RedisModule, TypeOrmModule.forFeature([Post])],
    controllers: [PostController],
    providers: [PostService],
})
export class PostModule {}
