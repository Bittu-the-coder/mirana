import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameLevel, GameLevelDocument } from './schemas/game-level.schema';
import { allGameLevels } from './seed-levels';

@Injectable()
export class SeedingService implements OnModuleInit {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    @InjectModel(GameLevel.name) private gameLevelModel: Model<GameLevelDocument>,
  ) {}

  async onModuleInit() {
    await this.seedLevels();
  }

  async seedLevels() {
    try {
      this.logger.log('🌱 Checking for game levels to seed...');

      const count = await this.gameLevelModel.countDocuments();
      if (count > 0) {
        this.logger.log(`✅ Levels already seeded (${count} levels found). Skipping.`);
        // Optional: logic to update/upsert if versions change
        return;
      }

      this.logger.log(`🚀 Seeding ${allGameLevels.length} levels...`);

      // Batch insert for performance
      await this.gameLevelModel.insertMany(allGameLevels);

      this.logger.log('✨ Levels seeded successfully!');
    } catch (error) {
      this.logger.error('❌ Failed to seed levels:', error);
    }
  }
}
