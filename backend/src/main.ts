import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    logger.log('🚀 Starting Mirana Backend bootstrap sequence...');

    // Audit critical environment variables
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      logger.error('❌ MONGODB_URI is not defined! Application will likely fail to connect.');
    } else {
      logger.log(`📁 MONGODB_URI is defined (length: ${mongoUri.length})`);
    }

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

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
    logger.log(`✅ Mirana Backend successfully listening on port ${port}`);
  } catch (error) {
    logger.error('💥 CRITICAL ERROR during bootstrap:', error);
    if (error.stack) {
      logger.error(error.stack);
    }
    process.exit(1);
  }
}
bootstrap();
