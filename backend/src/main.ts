import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const isPrivateOrLocalOrigin = (origin: string): boolean => {
  try {
    const { hostname } = new URL(origin);

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return true;
    }

    if (hostname.startsWith('10.') || hostname.startsWith('192.168.')) {
      return true;
    }

    const match = hostname.match(/^172\.(\d{1,2})\./);
    if (match) {
      const secondOctet = Number.parseInt(match[1], 10);
      return secondOctet >= 16 && secondOctet <= 31;
    }

    return false;
  } catch {
    return false;
  }
};

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    logger.log('Starting Mirana Backend bootstrap sequence...');

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      logger.error('MONGODB_URI is not defined. Application may fail to connect to database.');
    } else {
      logger.log(`MONGODB_URI is defined (length: ${mongoUri.length})`);
    }

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    app.enableShutdownHooks();

    const envOrigins = (process.env.FRONTEND_URL || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    const allowedOrigins = [
      ...envOrigins,
      'https://mirana-games.vercel.app',
      'https://mirana.bittuthecoder.me',
      'http://localhost:3000',
    ].filter(Boolean);

    const allowPrivateNetworkOrigins =
      process.env.CORS_ALLOW_PRIVATE_NETWORK === 'true' || process.env.NODE_ENV !== 'production';

    app.enableCors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        if (allowPrivateNetworkOrigins && isPrivateOrLocalOrigin(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS blocked for origin: ${origin}`), false);
      },
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    const server = app.getHttpServer() as any;
    if (server) {
      const keepAliveTimeoutMs = parsePositiveInt(process.env.HTTP_KEEP_ALIVE_TIMEOUT_MS, 65000);
      const headersTimeoutMs = parsePositiveInt(process.env.HTTP_HEADERS_TIMEOUT_MS, keepAliveTimeoutMs + 5000);
      const requestTimeoutMs = parsePositiveInt(process.env.HTTP_REQUEST_TIMEOUT_MS, 120000);

      server.keepAliveTimeout = keepAliveTimeoutMs;
      server.headersTimeout = headersTimeoutMs;
      server.requestTimeout = requestTimeoutMs;
      server.timeout = requestTimeoutMs;
    }

    const port = parsePositiveInt(process.env.PORT, 8080);
    await app.listen(port, '0.0.0.0');
    logger.log(`Mirana Backend listening on port ${port}`);
  } catch (error) {
    logger.error('Critical error during bootstrap', error as any);
    if (error instanceof Error && error.stack) {
      logger.error(error.stack);
    }
    process.exit(1);
  }
}

void bootstrap();
