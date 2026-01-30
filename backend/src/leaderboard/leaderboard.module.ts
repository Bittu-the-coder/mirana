import { Module } from '@nestjs/common';
import { GamesModule } from '../games/games.module';
import { UsersModule } from '../users/users.module';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

@Module({
  imports: [GamesModule, UsersModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
