import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PuzzlesService } from './puzzles.service';
import { Difficulty, PuzzleCategory } from './schemas/puzzle.schema';

@Controller('puzzles')
export class PuzzlesController {
  constructor(private readonly puzzlesService: PuzzlesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req: any,
    @Body() data: {
      title: string;
      description: string;
      category: PuzzleCategory;
      difficulty: Difficulty;
      content: string;
      solution: string;
      hints?: string[];
      imageUrl?: string;
    }
  ) {
    return this.puzzlesService.create(req.user.userId, data);
  }

  @Get()
  async findAll(
    @Query('category') category?: PuzzleCategory,
    @Query('difficulty') difficulty?: Difficulty,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.puzzlesService.findAll({ category, difficulty, page, limit });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.puzzlesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/solve')
  async checkSolution(
    @Request() req: any,
    @Param('id') id: string,
    @Body('solution') solution: string
  ) {
    return this.puzzlesService.checkSolution(id, solution, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/upvote')
  async upvote(@Request() req: any, @Param('id') id: string) {
    return this.puzzlesService.upvote(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Request() req: any, @Param('id') id: string) {
    await this.puzzlesService.delete(id, req.user.userId);
    return { message: 'Puzzle deleted' };
  }
}
