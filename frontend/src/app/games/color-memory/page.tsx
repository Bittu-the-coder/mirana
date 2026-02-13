'use client';

import { GameGuideDialog } from '@/components/game-guide-dialog';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Palette, Play, RotateCcw, Trophy } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const COLORS = [
  { name: 'Red', bg: 'bg-red-500', value: 0 },
  { name: 'Green', bg: 'bg-green-500', value: 1 },
  { name: 'Blue', bg: 'bg-blue-500', value: 2 },
  { name: 'Yellow', bg: 'bg-yellow-400', value: 3 },
  { name: 'Purple', bg: 'bg-purple-500', value: 4 },
  { name: 'Orange', bg: 'bg-orange-500', value: 5 },
  { name: 'Pink', bg: 'bg-pink-500', value: 6 },
  { name: 'Cyan', bg: 'bg-cyan-500', value: 7 },
  { name: 'Lime', bg: 'bg-lime-500', value: 8 },
  { name: 'Teal', bg: 'bg-teal-500', value: 9 },
];

type ColorMemoryConfig = {
  colorCount: number;
  initialSequenceLength: number;
  preFlashMs: number;
  flashMs: number;
  pauseMs: number;
};

const getLevelConfig = (level: number): ColorMemoryConfig => {
  if (level <= 5) {
    return {
      colorCount: 4,
      initialSequenceLength: 3 + Math.floor((level - 1) / 1.5),
      preFlashMs: 380,
      flashMs: 380,
      pauseMs: 220,
    };
  }

  if (level <= 12) {
    return {
      colorCount: 5,
      initialSequenceLength: 6 + Math.floor((level - 6) * 0.9),
      preFlashMs: 300,
      flashMs: 300,
      pauseMs: 150,
    };
  }

  if (level <= 20) {
    return {
      colorCount: 7,
      initialSequenceLength: 12 + Math.floor((level - 13) * 0.9),
      preFlashMs: 240,
      flashMs: 230,
      pauseMs: 120,
    };
  }

  if (level <= 30) {
    return {
      colorCount: 8,
      initialSequenceLength: 20 + Math.floor((level - 21) * 0.9),
      preFlashMs: 200,
      flashMs: 190,
      pauseMs: 95,
    };
  }

  return {
    colorCount: 9,
    initialSequenceLength: 29 + Math.floor((level - 31) * 0.8),
    preFlashMs: 170,
    flashMs: 160,
    pauseMs: 85,
  };
};

const pickNextColor = (sequence: number[], colorCount: number): number => {
  if (colorCount <= 1) return 0;

  let nextColor = Math.floor(Math.random() * colorCount);
  const previousColor = sequence.length > 0 ? sequence[sequence.length - 1] : null;

  while (
    nextColor === previousColor ||
    (sequence.length >= 3 &&
      nextColor === sequence[sequence.length - 2] &&
      sequence[sequence.length - 1] === sequence[sequence.length - 3])
  ) {
    nextColor = Math.floor(Math.random() * colorCount);
  }

  return nextColor;
};

const createSequence = (level: number): number[] => {
  const config = getLevelConfig(level);
  const sequence: number[] = [];

  for (let i = 0; i < config.initialSequenceLength; i++) {
    sequence.push(pickNextColor(sequence, config.colorCount));
  }

  return sequence;
};

const scoreForLevel = (level: number) => Math.max(0, level * 220 + level * level * 2);

export default function ColorMemoryPage() {
  const { user } = useAuth();
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const userIdentity = user as ({ id?: string; _id?: string } | null);
  const userId = String(userIdentity?.id ?? userIdentity?._id ?? 'guest');
  const storageKey = useMemo(() => `mirana_level_color_memory_${userId}`, [userId]);
  const levelConfig = useMemo(() => getLevelConfig(level), [level]);
  const visibleColors = useMemo(() => COLORS.slice(0, levelConfig.colorCount), [levelConfig.colorCount]);
  const gridColsClass = levelConfig.colorCount >= 8 ? 'grid-cols-4' : 'grid-cols-3';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedLevel = Number.parseInt(localStorage.getItem(storageKey) || '1', 10);
    const localLevel = Number.isFinite(savedLevel) && savedLevel > 0 ? savedLevel : 1;
    const serverLevel = (user?.progress?.[GameType.COLOR_MEMORY] || 0) + 1;
    const resumeLevel = Math.max(1, localLevel, serverLevel);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLevel(resumeLevel);

    if (user) {
      api.getBestScore(GameType.COLOR_MEMORY)
        .then(({ bestScore }) => setBestScore(bestScore))
        .catch(console.error);
    }
  }, [storageKey, user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey, level.toString());
  }, [level, storageKey]);

  const showSequence = useCallback(async (seq: number[], config: ColorMemoryConfig) => {
    setIsShowingSequence(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, config.preFlashMs));
      setActiveColor(seq[i]);
      await new Promise(resolve => setTimeout(resolve, config.flashMs));
      setActiveColor(null);
      await new Promise(resolve => setTimeout(resolve, config.pauseMs));
    }
    await new Promise(resolve => setTimeout(resolve, 220));
    setIsShowingSequence(false);
  }, []);

  const startGame = useCallback(async () => {
    const startingSequence = createSequence(level);
    setPlayerSequence([]);
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setSequence(startingSequence);
    await showSequence(startingSequence, levelConfig);
  }, [level, levelConfig, showSequence]);

  const handleColorClick = useCallback(async (colorIndex: number) => {
    if (isShowingSequence || gameOver || !isPlaying) return;

    setActiveColor(colorIndex);
    setTimeout(() => setActiveColor(null), 200);

    const newPlayerSequence = [...playerSequence, colorIndex];
    setPlayerSequence(newPlayerSequence);

    const currentIndex = newPlayerSequence.length - 1;
    if (sequence[currentIndex] !== colorIndex) {
      setGameOver(true);
      setIsPlaying(false);
      const achievedLevel = Math.max(level - 1, 0);
      const finalScore = scoreForLevel(achievedLevel);
      setScore(finalScore);

      if (user && finalScore > 0) {
        api.submitScore({
          gameType: GameType.COLOR_MEMORY,
          score: finalScore,
          level: achievedLevel,
        }).then(() => {
          toast.error(`Game Over! Reached level ${level}`);
          if (!bestScore || finalScore > bestScore) {
            setBestScore(finalScore);
          }
        }).catch(console.error);
      } else {
        toast.error(`Game Over! Reached level ${level}`);
      }
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      const nextLevel = level + 1;
      const nextConfig = getLevelConfig(nextLevel);
      const nextColor = pickNextColor(sequence, nextConfig.colorCount);
      const nextSequence = [...sequence, nextColor];

      setScore(scoreForLevel(level));
      setLevel(nextLevel);
      setSequence(nextSequence);
      setPlayerSequence([]);
      await new Promise(resolve => setTimeout(resolve, 500));
      await showSequence(nextSequence, nextConfig);
    }
  }, [isShowingSequence, gameOver, isPlaying, playerSequence, sequence, level, user, bestScore, showSequence]);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Palette className="h-6 w-6 text-primary" />
                Color Memory
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary">Level {level}</Badge>
                {bestScore !== null && (
                  <Badge variant="outline">
                    <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                    {bestScore}
                  </Badge>
                )}
                <GameGuideDialog
                  title="Color Memory"
                  description="Repeat the pattern."
                  rules={[
                    "Watch the color sequence.",
                    "Repeat it exactly.",
                    "More colors unlock as levels increase.",
                    "Sequence gets longer and faster each round.",
                  ]}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="text-center p-4 bg-muted rounded-lg">
              {isShowingSequence ? (
                <p className="text-lg font-medium">Watch the sequence...</p>
              ) : isPlaying ? (
                <p className="text-lg font-medium">Your turn! ({playerSequence.length}/{sequence.length})</p>
              ) : gameOver ? (
                <p className="text-lg font-medium text-red-500">Game Over - Level {level}</p>
              ) : (
                <p className="text-lg font-medium">
                  Press Start to play ({levelConfig.colorCount} colors)
                </p>
              )}
            </div>

            {/* Color Grid */}
            <div className={cn('grid gap-3', gridColsClass)}>
              {visibleColors.map((color, index) => (
                <button
                  key={color.name}
                  onClick={() => handleColorClick(index)}
                  disabled={isShowingSequence || !isPlaying}
                  className={cn(
                    'aspect-square rounded-xl transition-all duration-150',
                    color.bg,
                    activeColor === index && 'ring-4 ring-white scale-110 brightness-125',
                    !isPlaying && 'opacity-50',
                    isPlaying && !isShowingSequence && 'hover:scale-105 cursor-pointer active:scale-95'
                  )}
                />
              ))}
            </div>

            {/* Score Display */}
            {isPlaying && (
              <div className="text-center">
                <p className="text-3xl font-bold">{score}</p>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-3">
              <Button onClick={startGame} className="flex-1" disabled={isShowingSequence}>
                {isPlaying || gameOver ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restart
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
