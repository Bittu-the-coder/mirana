import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GameScore, GameScoreSchema } from './schemas/game-score.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GameScore.name, schema: GameScoreSchema }]),
    UsersModule,
  ],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
