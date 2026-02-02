import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GameScoreDocument = GameScore & Document;

export enum GameType {
  SLIDING_PUZZLE = 'sliding_puzzle',
  DAILY_MYSTERY_WORD = 'daily_mystery_word',
  NUMBER_PYRAMID = 'number_pyramid',
  MEMORY_PATH = 'memory_path',
  LETTER_MAZE = 'letter_maze',
  PATTERN_SPOTTER = 'pattern_spotter',
  COLOR_MEMORY = 'color_memory',
  BALANCE_PUZZLE = 'balance_puzzle',
  SPEED_MATH_DUEL = 'speed_math_duel',
  RIDDLE_ARENA = 'riddle_arena',
  MEMORY_MATCH_BATTLE = 'memory_match_battle',
  WORD_CHAIN = 'word_chain',
  WORD_CONNECT = 'word_connect',
}

@Schema({ timestamps: true })
export class GameScore {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true, enum: GameType })
  gameType: GameType;

  @Prop({ required: true })
  score: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  timeSpent: number;

  @Prop({ default: false })
  isMultiplayer: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  opponent?: Types.ObjectId;

  @Prop({ default: false })
  isWinner: boolean;
}

export const GameScoreSchema = SchemaFactory.createForClass(GameScore);
