import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { GamesModule } from './games/games.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { MultiplayerModule } from './multiplayer/multiplayer.module';
import { PuzzlesModule } from './puzzles/puzzles.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('Mongoose');
        const uri = config.get<string>('MONGODB_URI');
        const nodeEnv = config.get<string>('NODE_ENV');

        if (!uri) {
          if (nodeEnv === 'production') {
            logger.error('MONGODB_URI is missing in production environment.');
            throw new Error('MONGODB_URI is required in production');
          }
          logger.warn('MONGODB_URI is missing, using localhost for development.');
        } else {
          logger.log('Attempting to connect to MongoDB...');
        }

        const mongoConnectTimeoutMs = parsePositiveInt(config.get<string>('MONGO_CONNECT_TIMEOUT_MS'), 20000);
        const mongoSocketTimeoutMs = parsePositiveInt(config.get<string>('MONGO_SOCKET_TIMEOUT_MS'), 60000);
        const mongoSelectionTimeoutMs = parsePositiveInt(config.get<string>('MONGO_SERVER_SELECTION_TIMEOUT_MS'), 20000);

        return {
          uri: uri || 'mongodb://localhost:27017/mirana',
          connectionFactory: (connection: any) => {
            connection.on('connected', () => logger.log('MongoDB connected successfully'));
            connection.on('error', (err: unknown) => logger.error('MongoDB connection error:', err));
            return connection;
          },
          connectTimeoutMS: mongoConnectTimeoutMs,
          socketTimeoutMS: mongoSocketTimeoutMs,
          serverSelectionTimeoutMS: mongoSelectionTimeoutMs,
          maxPoolSize: parsePositiveInt(config.get<string>('MONGO_MAX_POOL_SIZE'), 20),
        };
      },
    }),
    AuthModule,
    UsersModule,
    GamesModule,
    PuzzlesModule,
    CommentsModule,
    LeaderboardModule,
    MultiplayerModule,
    UploadModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AppModule {}
