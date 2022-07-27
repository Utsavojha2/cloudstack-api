import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = {
    server: config.get<number>('PORT'),
    frontend: config.get<string>('FRONTEND_URL'),
  };

  app.use(cookieParser());
  app.enableCors({
    origin: [port.frontend],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('/v1/api');
  await app.listen(port.server, () => {
    console.log(
      'Server listening on following url:',
      config.get<string>('BASE_URL'),
    );
  });
}
bootstrap();
