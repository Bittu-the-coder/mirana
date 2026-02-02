import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { GameLevelsController } from './game-levels.controller';
import { GameLevelsService } from './game-levels.service';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GameLevel, GameLevelSchema } from './schemas/game-level.schema';
import { GameScore, GameScoreSchema } from './schemas/game-score.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameScore.name, schema: GameScoreSchema },
      { name: GameLevel.name, schema: GameLevelSchema },
    ]),
    UsersModule,
  ],
  controllers: [GamesController, GameLevelsController],
  providers: [GamesService, GameLevelsService],
  exports: [GamesService, GameLevelsService],
})
export class GamesModule {}
