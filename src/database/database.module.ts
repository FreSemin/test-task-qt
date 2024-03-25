import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source-options';
import { User } from '@user/entities/user.entity';
import { Post } from 'src/post/entity/post.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                ...dataSourceOptions,
                autoLoadEntities: true,
                entities: [User, Post],
            }),
        }),
    ],
})
export class DatabaseModule {}
