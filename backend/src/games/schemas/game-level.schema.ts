import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GameType } from './game-score.schema';

export type GameLevelDocument = GameLevel & Document;

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

@Schema({ timestamps: true })
export class GameLevel {
  @Prop({ required: true, enum: GameType })
  gameType: GameType;

  @Prop({ required: true })
  level: number;

  @Prop({ required: true, enum: Difficulty, default: Difficulty.MEDIUM })
  difficulty: Difficulty;

  // Word Connect specific
  @Prop({ type: [String] })
  letters?: string[];

  @Prop({ type: [String] })
  words?: string[];

  @Prop()
  hint?: string;

  // Daily Mystery Word specific
  @Prop()
  word?: string;

  @Prop()
  date?: string;

  // Pattern Spotter specific
  @Prop({ type: [Number] })
  sequence?: number[];

  @Prop({ type: Object })
  answer?: number | string;

  @Prop({ type: [Object] })
  options?: (number | string)[];

  @Prop()
  patternType?: string;

  // Riddle Arena specific
  @Prop()
  question?: string;

  @Prop()
  category?: string;

  // Speed Math specific
  @Prop()
  minA?: number;

  @Prop()
  maxA?: number;

  @Prop()
  minB?: number;

  @Prop()
  maxB?: number;

  @Prop({ type: [String] })
  operations?: string[];

  // Memory Match specific
  @Prop({ type: [String] })
  icons?: string[];

  @Prop()
  pairs?: number;

  // Balance Puzzle specific
  @Prop({ type: Object })
  weights?: Record<string, number>;

  @Prop()
  targetWeight?: number;

  // Letter Maze specific
  @Prop({ type: [[String]] })
  grid?: string[][];

  @Prop({ type: [String] })
  hiddenWords?: string[];

  // Generic
  @Prop({ default: true })
  isActive: boolean;
}

export const GameLevelSchema = SchemaFactory.createForClass(GameLevel);

// Index for efficient queries
GameLevelSchema.index({ gameType: 1, level: 1 });
GameLevelSchema.index({ gameType: 1, difficulty: 1 });
