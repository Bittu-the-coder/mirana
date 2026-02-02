import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://mirana-games.vercel.app',
    'https://mirana.bittuthecoder.me',
    'http://localhost:3000'
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Mirana Backend running on port ${port}`);
}
bootstrap();
