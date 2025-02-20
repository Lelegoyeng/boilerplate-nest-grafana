import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { createSwagger, otelSDK } from './lib';

async function bootstrap() {
  await otelSDK.start();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const logger = new Logger('main');
  const configModule = app.get<ConfigService>(ConfigService);
  const PORT = configModule.getOrThrow<number>('API_PORT');

  app.setGlobalPrefix('api');

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      always: true,
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
    }),
  );

  await createSwagger(app);

  try {
    await app.listen(PORT, process.env.HOST);
    logger.log(`Listening to PORT: ${PORT} | URL: ${await app.getUrl()}`);
  } catch (error) {
    logger.error(error);
  }
}

bootstrap();
