import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { GamesModule } from './games/games.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { MultiplayerModule } from './multiplayer/multiplayer.module';
import { PuzzlesModule } from './puzzles/puzzles.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';

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

        if (!uri) {
          logger.warn('⚠️ MONGODB_URI is missing, falling back to localhost.');
        } else {
          logger.log('🔌 Attempting to connect to MongoDB...');
        }

        return {
          uri: uri || 'mongodb://localhost:27017/mirana',
          connectionFactory: (connection) => {
            connection.on('connected', () => logger.log('✅ MongoDB connected successfully'));
            connection.on('error', (err) => logger.error('❌ MongoDB connection error:', err));
            return connection;
          },
          connectTimeoutMS: 10000, // 10 seconds timeout
          socketTimeoutMS: 45000,
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
})
export class AppModule {}
