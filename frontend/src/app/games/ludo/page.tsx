'use client';

import { GameGuideDialog } from '@/components/game-guide-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Bot, Dice6, Flag, Play, RefreshCcw, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const TRACK_LENGTH = 30;

function randomDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function computeAIBonus(level: number): number {
  if (level >= 12) return Math.random() < 0.35 ? 2 : 1;
  if (level >= 8) return Math.random() < 0.3 ? 1 : 0;
  if (level >= 4) return Math.random() < 0.2 ? 1 : 0;
  return 0;
}

export default function LudoPage() {
  const { user } = useAuth();
  const [level, setLevel] = useState(1);
  const [playerPos, setPlayerPos] = useState(0);
  const [aiPos, setAiPos] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [lastRoll, setLastRoll] = useState<{ player?: number; ai?: number }>({});
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const userIdentity = user as ({ id?: string; _id?: string } | null);
  const userId = String(userIdentity?.id ?? userIdentity?._id ?? 'guest');
  const storageKey = useMemo(() => `mirana_level_ludo_${userId}`, [userId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const localLevel = Number.parseInt(localStorage.getItem(storageKey) || '1', 10);
    const safeLocalLevel = Number.isFinite(localLevel) && localLevel > 0 ? localLevel : 1;
    const serverLevel = (user?.progress?.[GameType.LUDO] || 0) + 1;
    setLevel(Math.max(safeLocalLevel, serverLevel));

    if (user) {
      api.getBestScore(GameType.LUDO)
        .then(({ bestScore: fetchedBestScore }) => setBestScore(fetchedBestScore))
        .catch(console.error);
    }
  }, [storageKey, user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey, String(level));
  }, [level, storageKey]);

  const submitMatchScore = async (finalScore: number, nextLevel: number) => {
    if (!user || finalScore <= 0) return;

    try {
      await api.submitScore({
        gameType: GameType.LUDO,
        score: finalScore,
        level: nextLevel,
      });
      setBestScore((prev) => (prev === null ? finalScore : Math.max(prev, finalScore)));
    } catch (error) {
      console.error(error);
    }
  };

  const resetBoard = (keepRunScore = true) => {
    setPlayerPos(0);
    setAiPos(0);
    setTurn('player');
    setLastRoll({});
    setIsRolling(false);
    setIsPlaying(true);

    if (!keepRunScore) {
      setScore(0);
      setWins(0);
      setLosses(0);
    }
  };

  const finishMatch = async (didPlayerWin: boolean, newPlayerPos: number, newAiPos: number) => {
    setIsPlaying(false);
    setPlayerPos(newPlayerPos);
    setAiPos(newAiPos);

    if (didPlayerWin) {
      const gained = 120 + level * 25 + Math.max(0, TRACK_LENGTH - newAiPos) * 3;
      const nextScore = score + gained;
      const nextLevel = level + 1;

      setWins((value) => value + 1);
      setScore(nextScore);
      setLevel(nextLevel);
      toast.success(`You win! +${gained} points`);
      await submitMatchScore(nextScore, nextLevel);
      return;
    }

    const reducedScore = Math.max(0, score - 45);
    const nextLevel = Math.max(1, level - (level > 3 ? 1 : 0));
    setLosses((value) => value + 1);
    setScore(reducedScore);
    setLevel(nextLevel);
    toast.error('You lose. AI reached the finish first.');
  };

  const runAiTurn = async () => {
    setTurn('ai');
    setIsRolling(true);

    await new Promise((resolve) => window.setTimeout(resolve, 600));
    const roll = randomDice();
    const bonus = computeAIBonus(level);
    const moved = Math.min(TRACK_LENGTH, aiPos + roll + bonus);

    setLastRoll((value) => ({ ...value, ai: roll + bonus }));
    setAiPos(moved);
    setIsRolling(false);

    if (moved >= TRACK_LENGTH) {
      await finishMatch(false, playerPos, moved);
      return;
    }

    setTurn('player');
  };

  const rollForPlayer = async () => {
    if (!isPlaying || turn !== 'player' || isRolling) return;

    setIsRolling(true);
    const roll = randomDice();
    const bonusStep = roll === 6 ? 1 : 0;
    const moved = Math.min(TRACK_LENGTH, playerPos + roll + bonusStep);

    setLastRoll((value) => ({ ...value, player: roll + bonusStep }));
    setPlayerPos(moved);
    setIsRolling(false);

    if (moved >= TRACK_LENGTH) {
      await finishMatch(true, moved, aiPos);
      return;
    }

    await runAiTurn();
  };

  return (
    <div className="min-h-screen px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="border-primary/20">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Dice6 className="h-6 w-6 text-primary" />
                Ludo Race
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Level {level}</Badge>
                {bestScore !== null && (
                  <Badge variant="outline">
                    <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                    {bestScore}
                  </Badge>
                )}
                <GameGuideDialog
                  title="Ludo Race"
                  description="A fast one-token Ludo duel versus AI."
                  rules={[
                    'Roll and move your token to the finish line.',
                    'AI moves after your turn.',
                    'The AI gets stronger at higher levels.',
                    'First to cell 30 wins the round.',
                  ]}
                  scoring={[
                    'Win gives level-scaled points.',
                    'A loss reduces score and can drop one level.',
                    'Higher levels increase AI bonus steps.',
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
              <div className="rounded-lg bg-muted p-2 sm:p-3">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-lg sm:text-2xl font-bold">{score}</p>
              </div>
              <div className="rounded-lg bg-muted p-2 sm:p-3">
                <p className="text-xs text-muted-foreground">Wins</p>
                <p className="text-lg sm:text-2xl font-bold">{wins}</p>
              </div>
              <div className="rounded-lg bg-muted p-2 sm:p-3">
                <p className="text-xs text-muted-foreground">Losses</p>
                <p className="text-lg sm:text-2xl font-bold">{losses}</p>
              </div>
              <div className="rounded-lg bg-muted p-2 sm:p-3">
                <p className="text-xs text-muted-foreground">Turn</p>
                <p className="text-sm sm:text-base font-semibold">{turn === 'player' ? 'You' : 'AI'}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-4">
              <div className="rounded-xl border p-3 sm:p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Your Token</span>
                  <span className="text-muted-foreground">Roll: {lastRoll.player ?? '-'}</span>
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: TRACK_LENGTH }, (_, index) => {
                    const cell = index + 1;
                    const reached = cell <= playerPos;
                    const current = cell === playerPos;
                    return (
                      <div
                        key={`player-${cell}`}
                        className={cn(
                          'h-6 rounded text-[10px] flex items-center justify-center border',
                          reached ? 'bg-emerald-500/70 border-emerald-400 text-emerald-50' : 'bg-muted border-border',
                          current && 'ring-2 ring-emerald-300',
                        )}
                      >
                        {current ? 'Y' : cell}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border p-3 sm:p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium inline-flex items-center gap-1">
                    <Bot className="h-4 w-4" />
                    AI Token
                  </span>
                  <span className="text-muted-foreground">Roll: {lastRoll.ai ?? '-'}</span>
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: TRACK_LENGTH }, (_, index) => {
                    const cell = index + 1;
                    const reached = cell <= aiPos;
                    const current = cell === aiPos;
                    return (
                      <div
                        key={`ai-${cell}`}
                        className={cn(
                          'h-6 rounded text-[10px] flex items-center justify-center border',
                          reached ? 'bg-rose-500/70 border-rose-400 text-rose-50' : 'bg-muted border-border',
                          current && 'ring-2 ring-rose-300',
                        )}
                      >
                        {current ? 'AI' : cell}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <Flag className="h-4 w-4 text-primary" />
                Reach cell {TRACK_LENGTH} first to win
              </span>
              <span className="text-muted-foreground">{isRolling ? 'Rolling...' : 'Ready'}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {!isPlaying ? (
                <Button onClick={() => resetBoard(true)}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Match
                </Button>
              ) : (
                <Button onClick={rollForPlayer} disabled={turn !== 'player' || isRolling}>
                  <Dice6 className="h-4 w-4 mr-2" />
                  Roll Dice
                </Button>
              )}

              <Button variant="outline" onClick={() => resetBoard(false)}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                New Run
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
