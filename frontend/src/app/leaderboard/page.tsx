'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
    Crown,
    Gamepad2,
    Medal,
    Swords,
    TrendingUp,
    Trophy,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const rankColors = ['text-amber-400', 'text-slate-400', 'text-amber-600'];
const rankIcons = [Crown, Medal, Medal];

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('global');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.getGlobalLeaderboard(50);
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground mt-1">
            Top players across all games and challenges
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="global" className="mb-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="global" className="flex-1 sm:flex-none">
              <TrendingUp className="h-4 w-4 mr-2" />
              Global
            </TabsTrigger>
            <TabsTrigger value="solo" className="flex-1 sm:flex-none">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Solo Games
            </TabsTrigger>
            <TabsTrigger value="multiplayer" className="flex-1 sm:flex-none">
              <Swords className="h-4 w-4 mr-2" />
              Multiplayer
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Top 3 */}
        {!loading && users.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1, 0, 2].map((position) => {
              const user = users[position];
              const RankIcon = rankIcons[position] || Medal;
              const isFirst = position === 0;

              return (
                <Card key={position} className={cn(
                  'text-center',
                  isFirst && 'sm:-mt-4 border-amber-500/50'
                )}>
                  <CardContent className="pt-6">
                    <div className="relative inline-block">
                      <Avatar className={cn('h-16 w-16 mx-auto', isFirst && 'h-20 w-20')}>
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {user?.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        'absolute -bottom-1 -right-1 h-8 w-8 rounded-full flex items-center justify-center',
                        position === 0 && 'bg-amber-500',
                        position === 1 && 'bg-slate-400',
                        position === 2 && 'bg-amber-600'
                      )}>
                        <RankIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold mt-3">{user?.username}</h3>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {user?.stats?.totalScore?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Full List */}
        <Card>
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {users.map((user, index) => (
                  <div
                    key={user.id || index}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-lg transition-colors',
                      index < 3 && 'bg-muted/50'
                    )}
                  >
                    <span className={cn(
                      'w-8 text-center font-bold text-lg',
                      index < 3 && rankColors[index]
                    )}>
                      {index + 1}
                    </span>
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.username}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{user.stats?.gamesPlayed} games</span>
                        <span>•</span>
                        <span>{user.stats?.puzzlesSolved} puzzles</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{user.stats?.totalScore?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
