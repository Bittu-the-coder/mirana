'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Crown, Gamepad2, Medal, Swords, TrendingUp, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const rankColors = ['text-amber-400', 'text-slate-400', 'text-amber-600'];
const rankIcons = [Crown, Medal, Medal];

type LeaderboardTab = 'global' | 'solo' | 'multiplayer';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');

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

    void fetchLeaderboard();
  }, []);

  const getScoreForTab = (user: User, tab: LeaderboardTab) => {
    if (tab === 'multiplayer') {
      const wins = user.stats?.multiplayerWins || 0;
      const games = user.stats?.multiplayerGames || 0;
      return wins * 120 + games * 30;
    }

    if (tab === 'solo') {
      const total = user.stats?.totalScore || 0;
      const multiplayerGames = user.stats?.multiplayerGames || 0;
      return Math.max(0, total - multiplayerGames * 30);
    }

    return user.stats?.totalScore || 0;
  };

  const rankedUsers = useMemo(
    () => [...users].sort((a, b) => getScoreForTab(b, activeTab) - getScoreForTab(a, activeTab)),
    [users, activeTab],
  );

  const scoreLabel = activeTab === 'multiplayer' ? 'rating' : 'points';

  return (
    <div className="min-h-screen px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <Trophy className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-amber-500" />
          <h1 className="text-2xl sm:text-3xl font-bold">Leaderboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Top players across all games and challenges
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LeaderboardTab)} className="mb-6">
          <TabsList className="w-full overflow-x-auto justify-start">
            <TabsTrigger value="global" className="flex-1 sm:flex-none min-w-[110px]">
              <TrendingUp className="h-4 w-4 mr-2" />
              Global
            </TabsTrigger>
            <TabsTrigger value="solo" className="flex-1 sm:flex-none min-w-[120px]">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Solo Games
            </TabsTrigger>
            <TabsTrigger value="multiplayer" className="flex-1 sm:flex-none min-w-[130px]">
              <Swords className="h-4 w-4 mr-2" />
              Multiplayer
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {!loading && rankedUsers.length >= 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[0, 1, 2].map((position) => {
              const user = rankedUsers[position];
              const RankIcon = rankIcons[position] || Medal;
              const isFirst = position === 0;

              return (
                <Card key={position} className={cn('text-center', isFirst && 'sm:-mt-4 border-amber-500/50')}>
                  <CardContent className="pt-5 sm:pt-6">
                    <div className="relative inline-block">
                      <Avatar className={cn('h-14 w-14 sm:h-16 sm:w-16 mx-auto', isFirst && 'sm:h-20 sm:w-20')}>
                        <AvatarFallback className="bg-primary text-primary-foreground text-base sm:text-xl">
                          {user?.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          'absolute -bottom-1 -right-1 h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center',
                          position === 0 && 'bg-amber-500',
                          position === 1 && 'bg-slate-400',
                          position === 2 && 'bg-amber-600',
                        )}
                      >
                        <RankIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold mt-3 truncate">{user?.username}</h3>
                    <p className="text-2xl font-bold text-primary mt-1">{getScoreForTab(user, activeTab).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{scoreLabel}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4 p-3">
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
                {rankedUsers.map((user, index) => (
                  <div
                    key={user.id || index}
                    className={cn('flex items-center gap-3 sm:gap-4 p-3 rounded-lg transition-colors', index < 3 && 'bg-muted/50')}
                  >
                    <span className={cn('w-8 shrink-0 text-center font-bold text-lg', index < 3 && rankColors[index])}>
                      {index + 1}
                    </span>
                    <Avatar className="shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{user.username}</p>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        <span>{user.stats?.gamesPlayed || 0} games</span>
                        <span>•</span>
                        <span>{user.stats?.puzzlesSolved || 0} puzzles</span>
                        {activeTab === 'multiplayer' && (
                          <>
                            <span>•</span>
                            <span>{user.stats?.multiplayerWins || 0} wins</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold">{getScoreForTab(user, activeTab).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{scoreLabel}</p>
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
