import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PuzzleDocument = Puzzle & Document;

export enum PuzzleCategory {
  RIDDLE = 'riddle',
  LOGIC = 'logic',
  MATH = 'math',
  WORD = 'word',
  VISUAL = 'visual',
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

@Schema({ timestamps: true })
export class Puzzle {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: PuzzleCategory })
  category: PuzzleCategory;

  @Prop({ required: true, enum: Difficulty })
  difficulty: Difficulty;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  solution: string;

  @Prop({ type: [String], default: [] })
  hints: string[];

  @Prop({ default: 0 })
  upvotes: number;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  upvotedBy: Types.ObjectId[];

  @Prop({ default: 0 })
  solvedCount: number;

  @Prop({ default: 0 })
  attemptCount: number;
}

export const PuzzleSchema = SchemaFactory.createForClass(Puzzle);
