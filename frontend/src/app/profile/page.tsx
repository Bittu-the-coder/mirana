'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';
import {
    Gamepad2,
    Puzzle,
    Swords,
    Target,
    Trophy
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const statCards = [
  { label: 'Games Played', key: 'gamesPlayed', icon: Gamepad2, color: 'text-blue-500' },
  { label: 'Puzzles Solved', key: 'puzzlesSolved', icon: Puzzle, color: 'text-green-500' },
  { label: 'Puzzles Created', key: 'puzzlesCreated', icon: Target, color: 'text-purple-500' },
  { label: 'Multiplayer Wins', key: 'multiplayerWins', icon: Swords, color: 'text-amber-500' },
];

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const winRate = user.stats.multiplayerGames > 0
    ? Math.round((user.stats.multiplayerWins / user.stats.multiplayerGames) * 100)
    : 0;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                {user.bio && <p className="mt-2">{user.bio}</p>}
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {user.stats.totalScore.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const value = user.stats[stat.key as keyof typeof user.stats];
            return (
              <Card key={stat.key}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Multiplayer Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5" />
              Multiplayer Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{user.stats.multiplayerGames}</p>
                <p className="text-xs text-muted-foreground">Total Games</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{user.stats.multiplayerWins}</p>
                <p className="text-xs text-muted-foreground">Wins</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{winRate}%</p>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Win Rate</span>
                <span>{winRate}%</span>
              </div>
              <Progress value={winRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Button asChild variant="outline" className="justify-start h-12">
                <Link href="/games">
                  <Gamepad2 className="h-5 w-5 mr-3" />
                  Play Solo Games
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start h-12">
                <Link href="/multiplayer">
                  <Swords className="h-5 w-5 mr-3" />
                  Find Match
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start h-12">
                <Link href="/puzzles">
                  <Puzzle className="h-5 w-5 mr-3" />
                  Browse Puzzles
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start h-12">
                <Link href="/leaderboard">
                  <Trophy className="h-5 w-5 mr-3" />
                  View Leaderboard
                </Link>
              </Button>
            </div>
            <Separator />
            <Button variant="destructive" onClick={logout} className="w-full">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
