import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowRight,
    MessageSquare,
    Puzzle,
    Star,
    TrendingUp,
    Trophy,
    Users,
} from 'lucide-react';
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
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Mirana Community</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with puzzle enthusiasts, share your creations, and challenge each other
            to become the ultimate brain trainer.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Featured Puzzles */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Featured Puzzles
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/puzzles">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {featuredPuzzles.map((puzzle, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{puzzle.title}</p>
                    <p className="text-sm text-muted-foreground">by {puzzle.author}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{puzzle.category}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {puzzle.upvotes}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topContributors.map((user, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.puzzles} puzzles</p>
                  </div>
                  <Badge variant="secondary">{user.score.toLocaleString()}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Community Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Active Users', value: '2.5K+', icon: Users },
            { label: 'Puzzles Created', value: '1,250+', icon: Puzzle },
            { label: 'Games Played', value: '50K+', icon: TrendingUp },
            { label: 'Comments', value: '8K+', icon: MessageSquare },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6 text-center">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <Card className="mt-8 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Create Your First Puzzle</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Share your creativity with the community. Create riddles, logic puzzles,
              or brain teasers for others to solve.
            </p>
            <Button size="lg" asChild>
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
