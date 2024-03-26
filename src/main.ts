import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PaginatedResponse } from '@common/pagination/responses';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.setGlobalPrefix(configService.get('APP_PREFIX', 'api'));

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    const config = new DocumentBuilder()
        .setTitle('Test Task QT')
        .setDescription('Test Task QT')
        .setVersion('0.1')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config, {
        extraModels: [PaginatedResponse],
    });
    SwaggerModule.setup('doc', app, document);

    app.use(cookieParser());

    const port = configService.get<number>('APP_PORT', 4000);

    const dockerPort = configService.get<number>('DOCKER_API_PORT', 4000);

    await app.listen(port).then(() => {
        console.log(`APP listening on port ${port}`);
        console.log(`APP docker external port ${dockerPort}`);
    });
}
bootstrap();
