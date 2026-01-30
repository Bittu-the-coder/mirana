import { Controller, Get, Param, Query } from '@nestjs/common';
import { GameType } from '../games/schemas/game-score.schema';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('global')
  async getGlobalLeaderboard(@Query('limit') limit?: number) {
    return this.leaderboardService.getGlobalLeaderboard(limit || 20);
  }

  @Get('game/:gameType')
  async getGameLeaderboard(
    @Param('gameType') gameType: GameType,
    @Query('limit') limit?: number
  ) {
    return this.leaderboardService.getGameLeaderboard(gameType, limit || 20);
  }

  @Get('multiplayer')
  async getMultiplayerLeaderboard(@Query('limit') limit?: number) {
    return this.leaderboardService.getMultiplayerLeaderboard(limit || 20);
  }
}
