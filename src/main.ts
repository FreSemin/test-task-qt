import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { APP_DOCKER_PORT, APP_LISTEN_DOCKER_PORT, APP_LISTEN_PORT, APP_PORT } from '@common/constants';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    const port = configService.get<number>('APP_PORT', APP_PORT);

    const dockerPort = configService.get<number>('DOCKER_API_PORT', APP_DOCKER_PORT);

    await app.listen(port).then(() => {
        console.log(APP_LISTEN_PORT(port));
        console.log(APP_LISTEN_DOCKER_PORT(dockerPort));
    });
}
bootstrap();
