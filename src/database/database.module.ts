import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source-options';
import { UserEntity } from '@user/entities/user.entity';
import { PostEntity } from 'src/post/entity/post.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                ...dataSourceOptions,
                autoLoadEntities: true,
                entities: [UserEntity, PostEntity],
            }),
        }),
    ],
})
export class DatabaseModule {}
