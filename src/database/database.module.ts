import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source-options';
import { User } from '@user/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                ...dataSourceOptions,
                autoLoadEntities: true,
                entities: [User],
            }),
        }),
    ],
})
export class DatabaseModule {}
