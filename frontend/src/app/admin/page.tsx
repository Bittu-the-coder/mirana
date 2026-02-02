'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import {
    Database,
    Gamepad2,
    LayoutDashboard,
    Loader2,
    RefreshCw,
    Settings,
    Shield,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Stats {
  levelCounts: Record<string, number>;
  totalLevels: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchStats();
  }, [user, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/games/levels/stats/counts`);
      const levelCounts = await response.json();
      const totalLevels = Object.values(levelCounts as Record<string, number>).reduce((a, b) => a + b, 0);
      setStats({ levelCounts, totalLevels });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const gameTypeNames: Record<string, string> = {
    [GameType.WORD_CHAIN]: 'Word Connect',
    [GameType.DAILY_MYSTERY_WORD]: 'Daily Mystery Word',
    [GameType.PATTERN_SPOTTER]: 'Pattern Spotter',
    [GameType.COLOR_MEMORY]: 'Color Memory',
    [GameType.MEMORY_PATH]: 'Memory Path',
    [GameType.NUMBER_PYRAMID]: 'Number Pyramid',
    [GameType.RIDDLE_ARENA]: 'Riddle Arena',
    [GameType.SPEED_MATH_DUEL]: 'Speed Math Duel',
    [GameType.MEMORY_MATCH_BATTLE]: 'Memory Match Battle',
    [GameType.SLIDING_PUZZLE]: 'Sliding Puzzle',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage game levels, users, and application settings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Game Levels</CardDescription>
              <CardTitle className="text-3xl">{stats?.totalLevels || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <Database className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Game Types</CardDescription>
              <CardTitle className="text-3xl">{Object.keys(stats?.levelCounts || {}).length}</CardTitle>
            </CardHeader>
            <CardContent>
              <Gamepad2 className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Users</CardDescription>
              <CardTitle className="text-3xl">-</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>System Status</CardDescription>
              <CardTitle className="text-3xl">
                <Badge variant="default" className="bg-green-500">Online</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Settings className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button asChild>
            <Link href="/admin/levels">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Manage Levels
            </Link>
          </Button>
          <Button variant="outline" onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Stats
          </Button>
        </div>

        {/* Level Counts per Game */}
        <Card>
          <CardHeader>
            <CardTitle>Levels per Game</CardTitle>
            <CardDescription>Number of levels available for each game type</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.levelCounts && Object.keys(stats.levelCounts).length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.levelCounts).map(([gameType, count]) => (
                  <div
                    key={gameType}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <span className="font-medium">
                      {gameTypeNames[gameType] || gameType}
                    </span>
                    <Badge variant="secondary">{count} levels</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No levels found in database.</p>
                <p className="text-sm mt-2">
                  Run <code className="bg-muted px-2 py-1 rounded">pnpm seed:levels</code> in the backend to seed game levels.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
