import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GamesService } from './games.service';
import { GameType } from './schemas/game-score.schema';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('score')
  async submitScore(
    @Request() req: any,
    @Body() data: {
      gameType: GameType;
      score: number;
      level?: number;
      timeSpent?: number;
      isMultiplayer?: boolean;
      opponentId?: string;
      isWinner?: boolean;
    }
  ) {
    return this.gamesService.submitScore(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('scores')
  async getUserScores(@Request() req: any, @Query('gameType') gameType?: GameType) {
    return this.gamesService.getUserScores(req.user.userId, gameType);
  }

  @Get('leaderboard/:gameType')
  async getLeaderboard(
    @Param('gameType') gameType: GameType,
    @Query('limit') limit?: number
  ) {
    return this.gamesService.getTopScores(gameType, limit || 10);
  }

  @UseGuards(JwtAuthGuard)
  @Get('best/:gameType')
  async getBestScore(@Request() req: any, @Param('gameType') gameType: GameType) {
    return { bestScore: await this.gamesService.getUserBestScore(req.user.userId, gameType) };
  }
}
