'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import {
    Eye,
    Grid3X3,
    Hash,
    Palette,
    Play,
    Puzzle,
    Route,
    Scale,
    Sparkles,
    Type
} from 'lucide-react';
import Link from 'next/link';

const games = [
  {
    id: 'sliding-puzzle',
    name: 'Sliding Puzzle',
    description: 'Arrange tiles in order by sliding them into the empty space',
    icon: Grid3X3,
    difficulty: 'Medium',
    category: 'Logic',
    color: 'text-blue-500',
  },
  {
    id: 'word-connect',
    name: 'Word Connect',
    description: 'Swipe letters in a circle to form hidden words',
    icon: Sparkles,
    difficulty: 'Medium',
    category: 'Word',
    color: 'text-violet-500',
    isNew: true,
  },
  {
    id: 'daily-mystery-word',
    name: 'Daily Mystery Word',
    description: 'Guess the hidden word in 6 tries with color-coded hints',
    icon: Type,
    difficulty: 'Hard',
    category: 'Word',
    color: 'text-green-500',
  },
  {
    id: 'number-pyramid',
    name: 'Number Pyramid',
    description: 'Fill in missing numbers where each cell is the sum of two below',
    icon: Hash,
    difficulty: 'Easy',
    category: 'Math',
    color: 'text-amber-500',
  },
  {
    id: 'memory-path',
    name: 'Memory Path',
    description: 'Remember and trace the highlighted path on a grid',
    icon: Route,
    difficulty: 'Medium',
    category: 'Memory',
    color: 'text-purple-500',
  },
  {
    id: 'pattern-spotter',
    name: 'Pattern Spotter',
    description: 'Identify the next element in visual and numerical patterns',
    icon: Eye,
    difficulty: 'Easy',
    category: 'Logic',
    color: 'text-cyan-500',
  },
  {
    id: 'color-memory',
    name: 'Color Memory',
    description: 'Memorize and reproduce increasingly long color sequences',
    icon: Palette,
    difficulty: 'Medium',
    category: 'Memory',
    color: 'text-pink-500',
  },
  {
    id: 'letter-maze',
    name: 'Letter Maze',
    description: 'Find words hidden in a maze of letters',
    icon: Puzzle,
    difficulty: 'Hard',
    category: 'Word',
    color: 'text-rose-500',
    isUpcoming: true,
  },
  {
    id: 'balance-puzzle',
    name: 'Balance Puzzle',
    description: 'Determine the weight needed to balance the scale',
    icon: Scale,
    difficulty: 'Hard',
    category: 'Logic',
    color: 'text-orange-500',
    isUpcoming: true,
  },
  {
    id: 'mental-math',
    name: 'Mental Math',
    description: 'Solve arithmetic problems against the clock',
    icon: Hash,
    difficulty: 'Medium',
    category: 'Math',
    color: 'text-blue-500',
  },
];

const difficultyColors: Record<string, string> = {
  Easy: 'bg-green-500/10 text-green-500 border-green-500/20',
  Medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Hard: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function GamesPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Solo Games</h1>
          <p className="text-muted-foreground">
            Train your brain with 9 unique puzzle games. Track your progress and compete for high scores.
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {games.map((game) => {
            const Icon = game.icon;
            const isUpcoming = 'isUpcoming' in game && game.isUpcoming;
            return (
              <Card key={game.id} className={`group hover:border-primary transition-all duration-200 relative ${isUpcoming ? 'opacity-70' : ''}`}>
                {game.isNew && (
                  <Badge className="absolute -top-2 -right-2 z-10 bg-violet-500">NEW</Badge>
                )}
                {isUpcoming && (
                  <Badge className="absolute -top-2 -right-2 z-10 bg-gray-500">Upcoming</Badge>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center ${game.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className={difficultyColors[game.difficulty]}>
                      {game.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-4 group-hover:text-primary transition-colors">
                    {game.name}
                  </CardTitle>
                  <div className="flex items-center justify-between mt-1">
                    <CardDescription className="text-sm">
                      {game.description}
                    </CardDescription>
                    {user?.progress?.[game.id.replace(/-/g, '_')] && (
                      <Badge variant="outline" className="text-[10px] h-5 py-0 px-1 border-primary/30 text-primary">
                        Lvl {user.progress[game.id.replace(/-/g, '_')]}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {game.category}
                    </Badge>
                    {isUpcoming ? (
                      <Button size="sm" variant="outline" disabled>
                        Coming Soon
                      </Button>
                    ) : (
                      <Button size="sm" asChild>
                        <Link href={`/games/${game.id}`}>
                          <Play className="h-4 w-4 mr-1" />
                          Play
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
