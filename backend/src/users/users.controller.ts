import { Body, Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req: any,
    @Body() updates: { avatar?: string; bio?: string }
  ) {
    return this.usersService.updateProfile(req.user.userId, updates);
  }

  @UseGuards(JwtAuthGuard)
  @Get('friends/online')
  async getOnlineFriends(@Request() req: any) {
    return this.usersService.getOnlineFriends(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('friends/:friendId')
  async addFriend(@Request() req: any, @Param('friendId') friendId: string) {
    await this.usersService.addFriend(req.user.userId, friendId);
    return { message: 'Friend added' };
  }
}
