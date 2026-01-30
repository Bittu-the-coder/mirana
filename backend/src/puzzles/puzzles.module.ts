import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { PuzzlesController } from './puzzles.controller';
import { PuzzlesService } from './puzzles.service';
import { Puzzle, PuzzleSchema } from './schemas/puzzle.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Puzzle.name, schema: PuzzleSchema }]),
    UsersModule,
  ],
  controllers: [PuzzlesController],
  providers: [PuzzlesService],
  exports: [PuzzlesService],
})
export class PuzzlesModule {}
