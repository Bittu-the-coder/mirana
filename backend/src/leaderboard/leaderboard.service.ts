import { Injectable } from '@nestjs/common';
import { GamesService } from '../games/games.service';
import { GameType } from '../games/schemas/game-score.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class LeaderboardService {
  constructor(
    private gamesService: GamesService,
    private usersService: UsersService,
  ) {}

  async getGlobalLeaderboard(limit: number = 20) {
    return this.usersService.getTopUsers(limit);
  }

  async getGameLeaderboard(gameType: GameType, limit: number = 20) {
    return this.gamesService.getTopScores(gameType, limit);
  }

  async getMultiplayerLeaderboard(limit: number = 20) {
    return this.usersService.getTopUsers(limit);
  }
}
