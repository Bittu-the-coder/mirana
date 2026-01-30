import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { GamesModule } from './games/games.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { MultiplayerModule } from './multiplayer/multiplayer.module';
import { PuzzlesModule } from './puzzles/puzzles.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/mirana'),
    AuthModule,
    UsersModule,
    GamesModule,
    PuzzlesModule,
    CommentsModule,
    LeaderboardModule,
    MultiplayerModule,
  ],
})
export class AppModule {}
