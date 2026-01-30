import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async create(userId: string, puzzleId: string, content: string, parentCommentId?: string): Promise<CommentDocument> {
    const comment = new this.commentModel({
      author: new Types.ObjectId(userId),
      puzzle: new Types.ObjectId(puzzleId),
      content,
      parentComment: parentCommentId ? new Types.ObjectId(parentCommentId) : undefined,
    });
    return comment.save();
  }

  async findByPuzzle(puzzleId: string): Promise<CommentDocument[]> {
    return this.commentModel
      .find({ puzzle: new Types.ObjectId(puzzleId), parentComment: { $exists: false } })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findReplies(commentId: string): Promise<CommentDocument[]> {
    return this.commentModel
      .find({ parentComment: new Types.ObjectId(commentId) })
      .populate('author', 'username avatar')
      .sort({ createdAt: 1 })
      .exec();
  }

  async upvote(commentId: string, userId: string): Promise<CommentDocument> {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) throw new NotFoundException('Comment not found');

    const userObjectId = new Types.ObjectId(userId);
    const hasUpvoted = comment.upvotedBy.some(id => id.equals(userObjectId));

    if (hasUpvoted) {
      return this.commentModel.findByIdAndUpdate(
        commentId,
        { $pull: { upvotedBy: userObjectId }, $inc: { upvotes: -1 } },
        { new: true }
      ).exec() as Promise<CommentDocument>;
    } else {
      return this.commentModel.findByIdAndUpdate(
        commentId,
        { $addToSet: { upvotedBy: userObjectId }, $inc: { upvotes: 1 } },
        { new: true }
      ).exec() as Promise<CommentDocument>;
    }
  }

  async delete(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) throw new NotFoundException('Comment not found');
    if (!comment.author.equals(new Types.ObjectId(userId))) {
      throw new ForbiddenException('Not authorized');
    }
    await this.commentModel.findByIdAndDelete(commentId).exec();
  }
}
