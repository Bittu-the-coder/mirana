import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, MessageSquare, Puzzle, Star, TrendingUp, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

const featuredPuzzles = [
  { title: 'The Missing Number', author: 'BrainMaster', upvotes: 142, category: 'Logic' },
  { title: 'Word Ladder Challenge', author: 'PuzzleKing', upvotes: 98, category: 'Word' },
  { title: 'Pattern Recognition', author: 'MindBender', upvotes: 87, category: 'Visual' },
];

const topContributors = [
  { username: 'BrainMaster', puzzles: 45, score: 12500 },
  { username: 'PuzzleKing', puzzles: 38, score: 10200 },
  { username: 'MindBender', puzzles: 32, score: 9800 },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mirana Community</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Connect with puzzle enthusiasts, share your creations, and challenge each other to become
            the ultimate brain trainer.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Star className="h-5 w-5 text-amber-500" />
                  Featured Puzzles
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="w-full sm:w-auto justify-center sm:justify-start">
                  <Link href="/puzzles">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {featuredPuzzles.map((puzzle) => (
                <div key={puzzle.title} className="p-4 bg-muted/50 rounded-lg border border-border/60">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{puzzle.title}</p>
                      <p className="text-sm text-muted-foreground truncate">by {puzzle.author}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <Badge variant="outline">{puzzle.category}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {puzzle.upvotes}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Trophy className="h-5 w-5 text-amber-500" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topContributors.map((user, index) => (
                <div key={user.username} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.puzzles} puzzles</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{user.score.toLocaleString()}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
          {[
            { label: 'Active Users', value: '2.5K+', icon: Users },
            { label: 'Puzzles Created', value: '1,250+', icon: Puzzle },
            { label: 'Games Played', value: '50K+', icon: TrendingUp },
            { label: 'Comments', value: '8K+', icon: MessageSquare },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-5 sm:pt-6 text-center px-3 sm:px-6">
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6 sm:mt-8 border-primary/25 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardContent className="p-5 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Create Your First Puzzle</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6 max-w-lg mx-auto">
              Share your creativity with the community. Create riddles, logic puzzles, or brain teasers
              for others to solve.
            </p>
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/puzzles/create">
                <Puzzle className="h-5 w-5 mr-2" />
                Create Puzzle
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
