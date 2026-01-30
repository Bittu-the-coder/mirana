import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { GameScore, GameScoreDocument, GameType } from './schemas/game-score.schema';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(GameScore.name) private gameScoreModel: Model<GameScoreDocument>,
    private usersService: UsersService,
  ) {}

  async submitScore(userId: string, data: {
    gameType: GameType;
    score: number;
    level?: number;
    timeSpent?: number;
    isMultiplayer?: boolean;
    opponentId?: string;
    isWinner?: boolean;
  }): Promise<GameScoreDocument> {
    const gameScore = new this.gameScoreModel({
      user: new Types.ObjectId(userId),
      ...data,
      opponent: data.opponentId ? new Types.ObjectId(data.opponentId) : undefined,
    });

    await gameScore.save();

    // Update user stats
    const statsUpdate: any = {
      'stats.gamesPlayed': 1,
      'stats.totalScore': data.score,
    };

    if (data.isMultiplayer) {
      statsUpdate['stats.multiplayerGames'] = 1;
      if (data.isWinner) {
        statsUpdate['stats.multiplayerWins'] = 1;
      }
    }

    await this.usersService.updateStats(userId, statsUpdate);

    return gameScore;
  }

  async getUserScores(userId: string, gameType?: GameType): Promise<GameScoreDocument[]> {
    const query: any = { user: new Types.ObjectId(userId) };
    if (gameType) query.gameType = gameType;

    return this.gameScoreModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async getTopScores(gameType: GameType, limit: number = 10): Promise<GameScoreDocument[]> {
    return this.gameScoreModel
      .find({ gameType })
      .populate('user', 'username avatar')
      .sort({ score: -1 })
      .limit(limit)
      .exec();
  }

  async getUserBestScore(userId: string, gameType: GameType): Promise<number> {
    const result = await this.gameScoreModel
      .findOne({ user: new Types.ObjectId(userId), gameType })
      .sort({ score: -1 })
      .exec();
    return result?.score || 0;
  }
}
