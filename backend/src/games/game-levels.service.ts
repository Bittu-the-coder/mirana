import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Difficulty, GameLevel, GameLevelDocument } from './schemas/game-level.schema';
import { GameType } from './schemas/game-score.schema';

@Injectable()
export class GameLevelsService {
  constructor(
    @InjectModel(GameLevel.name) private gameLevelModel: Model<GameLevelDocument>,
  ) {}

  async createLevel(levelData: Partial<GameLevel>): Promise<GameLevelDocument> {
    const level = new this.gameLevelModel(levelData);
    return level.save();
  }

  async createManyLevels(levels: Partial<GameLevel>[]): Promise<any[]> {
    return this.gameLevelModel.insertMany(levels);
  }

  async getLevelsByGameType(
    gameType: GameType,
    difficulty?: Difficulty,
    limit?: number,
  ): Promise<GameLevelDocument[]> {
    const query: any = { gameType, isActive: true };
    if (difficulty) query.difficulty = difficulty;

    let queryBuilder = this.gameLevelModel.find(query).sort({ level: 1 });
    if (limit) queryBuilder = queryBuilder.limit(limit);

    return queryBuilder.exec();
  }

  async getLevelById(id: string): Promise<GameLevelDocument | null> {
    return this.gameLevelModel.findById(id).exec();
  }

  async getLevel(gameType: GameType, level: number): Promise<GameLevelDocument | null> {
    return this.gameLevelModel.findOne({ gameType, level, isActive: true }).exec();
  }

  async getRandomLevels(
    gameType: GameType,
    count: number,
    difficulty?: Difficulty,
  ): Promise<GameLevelDocument[]> {
    const query: any = { gameType, isActive: true };
    if (difficulty) query.difficulty = difficulty;

    return this.gameLevelModel.aggregate([
      { $match: query },
      { $sample: { size: count } },
    ]);
  }

  async updateLevel(id: string, updateData: Partial<GameLevel>): Promise<GameLevelDocument | null> {
    return this.gameLevelModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async deleteLevel(id: string): Promise<GameLevelDocument | null> {
    return this.gameLevelModel.findByIdAndDelete(id).exec();
  }

  async deleteManyByGameType(gameType: GameType): Promise<{ deletedCount?: number }> {
    return this.gameLevelModel.deleteMany({ gameType }).exec();
  }

  async getLevelCount(gameType: GameType): Promise<number> {
    return this.gameLevelModel.countDocuments({ gameType, isActive: true }).exec();
  }

  async getAllLevelCounts(): Promise<Record<string, number>> {
    const results = await this.gameLevelModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$gameType', count: { $sum: 1 } } },
    ]);

    return results.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);
  }

  // Daily Mystery Word specific
  async getDailyWord(date?: string): Promise<GameLevelDocument | null> {
    const today = date || new Date().toISOString().split('T')[0];

    // First try to find a word for this specific date
    let word = await this.gameLevelModel.findOne({
      gameType: GameType.DAILY_MYSTERY_WORD,
      date: today,
      isActive: true,
    }).exec();

    // If no specific date word, get a random word based on date hash
    if (!word) {
      const words = await this.gameLevelModel.find({
        gameType: GameType.DAILY_MYSTERY_WORD,
        isActive: true,
      }).exec();

      if (words.length > 0) {
        const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        word = words[hash % words.length];
      }
    }

    return word;
  }
}
