import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GameLevelsService } from './game-levels.service';
import { Difficulty, GameLevel } from './schemas/game-level.schema';
import { GameType } from './schemas/game-score.schema';

@Controller('games/levels')
export class GameLevelsController {
  constructor(private readonly gameLevelsService: GameLevelsService) {}

  // Public endpoints
  @Get(':gameType')
  async getLevels(
    @Param('gameType') gameType: GameType,
    @Query('difficulty') difficulty?: Difficulty,
    @Query('limit') limit?: string,
  ) {
    return this.gameLevelsService.getLevelsByGameType(
      gameType,
      difficulty,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get(':gameType/random')
  async getRandomLevels(
    @Param('gameType') gameType: GameType,
    @Query('count') count: string = '10',
    @Query('difficulty') difficulty?: Difficulty,
  ) {
    return this.gameLevelsService.getRandomLevels(
      gameType,
      parseInt(count, 10),
      difficulty,
    );
  }

  @Get(':gameType/:level')
  async getLevel(
    @Param('gameType') gameType: GameType,
    @Param('level') level: string,
  ) {
    return this.gameLevelsService.getLevel(gameType, parseInt(level, 10));
  }

  @Get('daily-word/today')
  async getDailyWord(@Query('date') date?: string) {
    return this.gameLevelsService.getDailyWord(date);
  }

  @Get('stats/counts')
  async getLevelCounts() {
    return this.gameLevelsService.getAllLevelCounts();
  }

  // Admin endpoints (protected)
  @Post()
  @UseGuards(JwtAuthGuard)
  async createLevel(@Body() levelData: Partial<GameLevel>) {
    return this.gameLevelsService.createLevel(levelData);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  async createManyLevels(@Body() levels: Partial<GameLevel>[]) {
    return this.gameLevelsService.createManyLevels(levels);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateLevel(
    @Param('id') id: string,
    @Body() updateData: Partial<GameLevel>,
  ) {
    return this.gameLevelsService.updateLevel(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteLevel(@Param('id') id: string) {
    return this.gameLevelsService.deleteLevel(id);
  }

  @Delete('game/:gameType')
  @UseGuards(JwtAuthGuard)
  async deleteLevelsByGame(@Param('gameType') gameType: GameType) {
    return this.gameLevelsService.deleteManyByGameType(gameType);
  }
}
