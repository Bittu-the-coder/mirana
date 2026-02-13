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
const podiumOrder = [1, 0, 2];

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
          <TabsList className="w-full overflow-x-auto justify-start gap-1">
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
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 mt-12">
            {podiumOrder.map((position) => {
              const user = rankedUsers[position];
              const RankIcon = rankIcons[position] || Medal;
              const isFirst = position === 0;

              return (
                <Card
                  key={position}
                  className={cn(
                    'relative overflow-visible text-center border-white/10',
                    'bg-gradient-to-b from-card to-muted/40',
                    isFirst && '-translate-y-2 border-amber-500/50 shadow-[0_8px_30px_rgba(245,158,11,0.18)]',
                  )}
                >
                  <CardContent className="pt-10 pb-4 px-2 sm:px-4">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                      <div className="relative">
                        <Avatar
                          className={cn(
                            'h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem] ring-4 ring-background',
                            isFirst && 'h-20 w-20 ring-amber-500/60',
                          )}
                        >
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg sm:text-xl">
                            {user?.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            'absolute -bottom-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center',
                            position === 0 && 'bg-amber-500',
                            position === 1 && 'bg-slate-400',
                            position === 2 && 'bg-amber-700',
                          )}
                        >
                          <RankIcon className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] sm:text-xs uppercase tracking-wide text-muted-foreground">
                      Rank #{position + 1}
                    </p>
                    <h3 className="font-semibold text-sm sm:text-base truncate mt-1">{user?.username}</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-primary mt-1 leading-none">
                      {getScoreForTab(user, activeTab).toLocaleString()}
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{scoreLabel}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="border-white/10 bg-gradient-to-b from-card to-muted/20">
          <CardHeader className="pb-3">
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
              <div className="space-y-2">
                {rankedUsers.map((user, index) => (
                  <div
                    key={user.id || index}
                    className={cn(
                      'grid grid-cols-[32px_40px_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3 p-3 rounded-lg transition-colors',
                      index < 3 && 'bg-muted/50',
                    )}
                  >
                    <span className={cn('w-8 shrink-0 text-center font-bold text-lg', index < 3 && rankColors[index])}>
                      {index + 1}
                    </span>
                    <Avatar className="shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{user.username}</p>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        <span>{user.stats?.gamesPlayed || 0} games</span>
                        <span>|</span>
                        <span>{user.stats?.puzzlesSolved || 0} puzzles</span>
                        {activeTab === 'multiplayer' && (
                          <>
                            <span>|</span>
                            <span>{user.stats?.multiplayerWins || 0} wins</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-1">
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
