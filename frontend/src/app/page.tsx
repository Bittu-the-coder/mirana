import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  Brain,
  Calculator,
  Eye,
  Gamepad2,
  Grid3X3,
  Hash,
  Palette,
  Play,
  Puzzle,
  Route,
  Scale,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Type,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Gamepad2,
    title: '8+ Solo Games',
    description: 'Challenge yourself with puzzles, memory games, and logic challenges',
  },
  {
    icon: Swords,
    title: 'Multiplayer Battles',
    description: 'Compete with friends or find random opponents in real-time',
  },
  {
    icon: Puzzle,
    title: 'Community Puzzles',
    description: 'Create, share, and solve puzzles from the community',
  },
  {
    icon: Trophy,
    title: 'Global Leaderboards',
    description: 'Climb the ranks and prove your cognitive prowess',
  },
];

const soloGames = [
  { name: 'Sliding Puzzle', difficulty: 'Medium', icon: Grid3X3, href: '/games/sliding-puzzle', color: 'text-blue-500' },
  { name: 'Daily Mystery Word', difficulty: 'Hard', icon: Type, href: '/games/daily-mystery-word', color: 'text-green-500' },
  { name: 'Number Pyramid', difficulty: 'Easy', icon: Hash, href: '/games/number-pyramid', color: 'text-amber-500' },
  { name: 'Memory Path', difficulty: 'Medium', icon: Route, href: '/games/memory-path', color: 'text-purple-500' },
  { name: 'Letter Maze', difficulty: 'Hard', icon: Type, href: '/games/letter-maze', color: 'text-pink-500' },
  { name: 'Pattern Spotter', difficulty: 'Easy', icon: Eye, href: '/games/pattern-spotter', color: 'text-cyan-500' },
  { name: 'Color Memory', difficulty: 'Medium', icon: Palette, href: '/games/color-memory', color: 'text-red-500' },
  { name: 'Balance Puzzle', difficulty: 'Hard', icon: Scale, href: '/games/balance-puzzle', color: 'text-orange-500' },
];

const multiplayerGames = [
  { name: 'Speed Math Duel', description: 'Race to solve math problems' },
  { name: 'Riddle Arena', description: 'Competitive puzzle solving' },
  { name: 'Memory Match Battle', description: 'Find pairs before your opponent' },
  { name: 'Word Chain', description: 'Build words in turns' },
];

const brainChallenges = [
  { name: 'Multiplication Sprint', description: 'Solve multiplication problems fast', icon: Calculator, color: 'bg-green-500', href: '/games/multiplication-sprint', status: 'active' },
  { name: 'Mental Math', description: 'Quick arithmetic challenges', icon: Brain, color: 'bg-blue-500', href: '#', status: 'upcoming' },
  { name: 'Number Sequences', description: 'Find the pattern and continue', icon: Hash, color: 'bg-amber-500', href: '/games/pattern-spotter', status: 'active' },
  { name: 'Quick Memory', description: 'Remember and recall numbers', icon: Zap, color: 'bg-purple-500', href: '/games/color-memory', status: 'active' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            Train Your Brain Daily
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Sharpen Your Mind with
            <span className="text-primary block mt-2">Mirana</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Interactive brain games, multiplayer challenges, and a community of puzzle enthusiasts.
            Make mental exercise fun and social.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/games">
                <Gamepad2 className="h-5 w-5 mr-2" />
                Start Playing
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/multiplayer">
                <Swords className="h-5 w-5 mr-2" />
                Multiplayer
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Everything You Need to Train Your Brain
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-0 bg-card">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Train Your Brain Section */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Brain className="h-7 w-7 text-primary" />
                Train Your Brain
              </h2>
              <p className="text-muted-foreground mt-1">Quick mental exercises and challenges</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {brainChallenges.map((challenge) => {
              const Icon = challenge.icon;
              const isUpcoming = challenge.status === 'upcoming';
              return (
                <Link key={challenge.name} href={challenge.href}>
                  <Card className={`hover:border-primary transition-colors cursor-pointer group overflow-hidden relative ${isUpcoming ? 'opacity-70' : ''}`}>
                    {isUpcoming && (
                      <Badge className="absolute top-2 right-2 z-10 bg-gray-500">Upcoming</Badge>
                    )}
                    <CardContent className="p-0">
                      <div className={`${challenge.color} p-4 flex items-center justify-center`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{challenge.name}</h3>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        <Button size="sm" className="mt-3 w-full" variant="outline" disabled={isUpcoming}>
                          <Play className="h-4 w-4 mr-2" />
                          {isUpcoming ? 'Coming Soon' : 'Start'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solo Games */}
      <section className="px-4 py-16 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Solo Games</h2>
              <p className="text-muted-foreground mt-1">Challenge yourself at your own pace</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/games" className="flex items-center gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {soloGames.map((game) => {
              const Icon = game.icon;
              return (
                <Link key={game.name} href={game.href}>
                  <Card className="hover:border-primary transition-colors cursor-pointer group h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${game.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium group-hover:text-primary transition-colors">
                            {game.name}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {game.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" className="w-full" variant="secondary">
                        <Play className="h-4 w-4 mr-2" />
                        Play Now
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Multiplayer */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                Multiplayer Games
              </h2>
              <p className="text-muted-foreground mt-1">Compete with players worldwide</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/multiplayer" className="flex items-center gap-2">
                Play Now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {multiplayerGames.map((game) => (
              <Card key={game.name} className="hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{game.name}</h3>
                      <p className="text-sm text-muted-foreground">{game.description}</p>
                    </div>
                    <Button size="sm" asChild>
                      <Link href="/multiplayer">
                        <Target className="h-4 w-4 mr-2" />
                        Play
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8 md:p-12">
              <Users className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Join the Community
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Create an account to track your progress, compete on leaderboards,
                and share puzzles with others.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/register">Create Free Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/puzzles">Browse Puzzles</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
