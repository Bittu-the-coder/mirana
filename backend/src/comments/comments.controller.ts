import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('puzzle/:puzzleId')
  async create(
    @Request() req: any,
    @Param('puzzleId') puzzleId: string,
    @Body() data: { content: string; parentCommentId?: string }
  ) {
    return this.commentsService.create(req.user.userId, puzzleId, data.content, data.parentCommentId);
  }

  @Get('puzzle/:puzzleId')
  async findByPuzzle(@Param('puzzleId') puzzleId: string) {
    return this.commentsService.findByPuzzle(puzzleId);
  }

  @Get(':commentId/replies')
  async findReplies(@Param('commentId') commentId: string) {
    return this.commentsService.findReplies(commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':commentId/upvote')
  async upvote(@Request() req: any, @Param('commentId') commentId: string) {
    return this.commentsService.upvote(commentId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  async delete(@Request() req: any, @Param('commentId') commentId: string) {
    await this.commentsService.delete(commentId, req.user.userId);
    return { message: 'Comment deleted' };
  }
}
