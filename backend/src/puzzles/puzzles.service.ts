import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { Difficulty, Puzzle, PuzzleCategory, PuzzleDocument } from './schemas/puzzle.schema';

@Injectable()
export class PuzzlesService {
  constructor(
    @InjectModel(Puzzle.name) private puzzleModel: Model<PuzzleDocument>,
    private usersService: UsersService,
  ) {}

  async create(userId: string, data: {
    title: string;
    description: string;
    category: PuzzleCategory;
    difficulty: Difficulty;
    content: string;
    solution: string;
    hints?: string[];
  }): Promise<PuzzleDocument> {
    const puzzle = new this.puzzleModel({
      author: new Types.ObjectId(userId),
      ...data,
    });
    await puzzle.save();
    await this.usersService.updateStats(userId, { 'stats.puzzlesCreated': 1 });
    return puzzle;
  }

  async findAll(filters?: {
    category?: PuzzleCategory;
    difficulty?: Difficulty;
    page?: number;
    limit?: number;
  }): Promise<{ puzzles: PuzzleDocument[]; total: number }> {
    const query: any = {};
    if (filters?.category) query.category = filters.category;
    if (filters?.difficulty) query.difficulty = filters.difficulty;

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const [puzzles, total] = await Promise.all([
      this.puzzleModel
        .find(query)
        .populate('author', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.puzzleModel.countDocuments(query).exec(),
    ]);

    return { puzzles, total };
  }

  async findById(id: string): Promise<PuzzleDocument> {
    const puzzle = await this.puzzleModel
      .findById(id)
      .populate('author', 'username avatar')
      .exec();
    if (!puzzle) throw new NotFoundException('Puzzle not found');
    return puzzle;
  }

  async checkSolution(puzzleId: string, solution: string, userId?: string): Promise<{ correct: boolean }> {
    const puzzle = await this.puzzleModel.findById(puzzleId).exec();
    if (!puzzle) throw new NotFoundException('Puzzle not found');

    await this.puzzleModel.findByIdAndUpdate(puzzleId, { $inc: { attemptCount: 1 } }).exec();

    const correct = puzzle.solution.toLowerCase().trim() === solution.toLowerCase().trim();

    if (correct) {
      await this.puzzleModel.findByIdAndUpdate(puzzleId, { $inc: { solvedCount: 1 } }).exec();
      if (userId) {
        await this.usersService.updateStats(userId, { 'stats.puzzlesSolved': 1, 'stats.totalScore': 10 });
      }
    }

    return { correct };
  }

  async upvote(puzzleId: string, userId: string): Promise<PuzzleDocument> {
    const puzzle = await this.puzzleModel.findById(puzzleId).exec();
    if (!puzzle) throw new NotFoundException('Puzzle not found');

    const userObjectId = new Types.ObjectId(userId);
    const hasUpvoted = puzzle.upvotedBy.some(id => id.equals(userObjectId));

    if (hasUpvoted) {
      return this.puzzleModel.findByIdAndUpdate(
        puzzleId,
        { $pull: { upvotedBy: userObjectId }, $inc: { upvotes: -1 } },
        { new: true }
      ).exec() as Promise<PuzzleDocument>;
    } else {
      return this.puzzleModel.findByIdAndUpdate(
        puzzleId,
        { $addToSet: { upvotedBy: userObjectId }, $inc: { upvotes: 1 } },
        { new: true }
      ).exec() as Promise<PuzzleDocument>;
    }
  }

  async delete(puzzleId: string, userId: string): Promise<void> {
    const puzzle = await this.puzzleModel.findById(puzzleId).exec();
    if (!puzzle) throw new NotFoundException('Puzzle not found');
    if (!puzzle.author.equals(new Types.ObjectId(userId))) {
      throw new ForbiddenException('Not authorized');
    }
    await this.puzzleModel.findByIdAndDelete(puzzleId).exec();
  }
}
