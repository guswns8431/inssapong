import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const config = new DocumentBuilder()
    .setTitle('트센 API 설계')
    .setDescription('우와우웅~~~~~~~')
    .setVersion('1.0')
    .addTag('inssa')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // entity
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const DOMAIN = process.env.DOMAIN;
  const PORT = process.env.BACKEND_PORT;
  app.use(json({ limit: '1mb' }));
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(PORT);

  const logger = new Logger(bootstrap.name);
  logger.log(`Application is running on: ${DOMAIN}:${PORT}`);
}
bootstrap();
