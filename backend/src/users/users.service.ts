import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: { username: string; password: string }): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new this.userModel({
      username: createUserDto.username,
      password: hashedPassword,
    });
    return user.save();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async updateStats(userId: string, stats: Record<string, number>): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $inc: stats },
      { new: true }
    ).select('-password').exec();
  }

  async updateProfile(userId: string, updates: { avatar?: string; bio?: string }): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select('-password').exec();
  }

  async setOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { isOnline }).exec();
  }

  async getTopUsers(limit: number = 10): Promise<UserDocument[]> {
    return this.userModel
      .find()
      .select('-password')
      .sort({ 'stats.totalScore': -1 })
      .limit(limit)
      .exec();
  }

  async addFriend(userId: string, friendId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { friends: friendId },
    }).exec();
  }

  async getOnlineFriends(userId: string): Promise<UserDocument[]> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return [];
    return this.userModel
      .find({ _id: { $in: user.friends }, isOnline: true })
      .select('-password')
      .exec();
  }

  async updateProgress(userId: string, gameType: string, level: number): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return;

    const currentLevel = user.progress.get(gameType) || 0;
    if (level > currentLevel) {
      user.progress.set(gameType, level);
      await user.save();
    }
  }
}
