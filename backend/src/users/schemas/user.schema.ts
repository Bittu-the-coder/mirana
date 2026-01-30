import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({
    type: {
      gamesPlayed: { type: Number, default: 0 },
      puzzlesSolved: { type: Number, default: 0 },
      puzzlesCreated: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      multiplayerWins: { type: Number, default: 0 },
      multiplayerGames: { type: Number, default: 0 },
    },
    default: {
      gamesPlayed: 0,
      puzzlesSolved: 0,
      puzzlesCreated: 0,
      totalScore: 0,
      multiplayerWins: 0,
      multiplayerGames: 0,
    },
  })
  stats: {
    gamesPlayed: number;
    puzzlesSolved: number;
    puzzlesCreated: number;
    totalScore: number;
    multiplayerWins: number;
    multiplayerGames: number;
  };

  @Prop({ type: [String], default: [] })
  friends: string[];

  @Prop({ default: false })
  isOnline: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
