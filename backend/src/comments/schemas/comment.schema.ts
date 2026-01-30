import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'Puzzle', required: true })
  puzzle: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: 0 })
  upvotes: number;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  upvotedBy: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Comment' })
  parentComment?: Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
