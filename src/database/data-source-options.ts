import { APP_DATABASE_TYPE, APP_DATABASE_PORT } from '@common/constants';
import { DataSourceOptions } from 'typeorm';

import { config } from 'dotenv';

config();

export const dataSourceOptions: DataSourceOptions = {
    type: APP_DATABASE_TYPE,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : APP_DATABASE_PORT,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: false,
    dropSchema: false,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
};
