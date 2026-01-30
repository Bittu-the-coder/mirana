'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Difficulty, PuzzleCategory, Puzzle as PuzzleType } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
    ChevronRight,
    Clock,
    MessageSquare,
    Plus,
    Puzzle,
    ThumbsUp
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const categoryColors: Record<PuzzleCategory, string> = {
  [PuzzleCategory.RIDDLE]: 'bg-purple-500/10 text-purple-500',
  [PuzzleCategory.LOGIC]: 'bg-blue-500/10 text-blue-500',
  [PuzzleCategory.MATH]: 'bg-amber-500/10 text-amber-500',
  [PuzzleCategory.WORD]: 'bg-green-500/10 text-green-500',
  [PuzzleCategory.VISUAL]: 'bg-pink-500/10 text-pink-500',
};

const difficultyColors: Record<Difficulty, string> = {
  [Difficulty.EASY]: 'text-green-500',
  [Difficulty.MEDIUM]: 'text-amber-500',
  [Difficulty.HARD]: 'text-orange-500',
  [Difficulty.EXPERT]: 'text-red-500',
};

export default function PuzzlesPage() {
  const { user } = useAuth();
  const [puzzles, setPuzzles] = useState<PuzzleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<PuzzleCategory | 'all'>('all');

  useEffect(() => {
    const fetchPuzzles = async () => {
      try {
        const filters = category !== 'all' ? { category } : {};
        const { puzzles } = await api.getPuzzles(filters);
        setPuzzles(puzzles);
      } catch (error) {
        console.error('Failed to fetch puzzles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPuzzles();
  }, [category]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Puzzle className="h-8 w-8 text-primary" />
              Puzzle Community
            </h1>
            <p className="text-muted-foreground mt-1">
              Solve puzzles or create your own for others to enjoy
            </p>
          </div>
          {user && (
            <Button asChild>
              <Link href="/puzzles/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Puzzle
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setCategory('all')}>All</TabsTrigger>
            <TabsTrigger value={PuzzleCategory.RIDDLE} onClick={() => setCategory(PuzzleCategory.RIDDLE)}>Riddles</TabsTrigger>
            <TabsTrigger value={PuzzleCategory.LOGIC} onClick={() => setCategory(PuzzleCategory.LOGIC)}>Logic</TabsTrigger>
            <TabsTrigger value={PuzzleCategory.MATH} onClick={() => setCategory(PuzzleCategory.MATH)}>Math</TabsTrigger>
            <TabsTrigger value={PuzzleCategory.WORD} onClick={() => setCategory(PuzzleCategory.WORD)}>Word</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Puzzles List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : puzzles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Puzzle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No puzzles yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create a puzzle in this category!
              </p>
              {user && (
                <Button asChild>
                  <Link href="/puzzles/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Puzzle
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {puzzles.map((puzzle) => (
              <Link key={puzzle._id} href={`/puzzles/${puzzle._id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'h-12 w-12 rounded-lg flex items-center justify-center shrink-0',
                        categoryColors[puzzle.category]
                      )}>
                        <Puzzle className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {puzzle.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {puzzle.description}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                          <Badge variant="outline" className={difficultyColors[puzzle.difficulty]}>
                            {puzzle.difficulty}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {puzzle.upvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {puzzle.solvedCount} solved
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(puzzle.createdAt)}
                          </span>
                          <span>by {puzzle.author?.username || 'Anonymous'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
