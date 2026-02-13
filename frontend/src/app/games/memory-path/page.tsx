'use client';

import { GameGuideDialog } from '@/components/game-guide-dialog';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Play, RotateCcw, Route, Trophy } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type MemoryPathConfig = {
  gridSize: 4 | 5 | 6;
  pathLength: number;
  flashMs: number;
  gapMs: number;
};

const GRID_CLASS_BY_SIZE: Record<MemoryPathConfig['gridSize'], string> = {
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

const getLevelConfig = (level: number): MemoryPathConfig => {
  if (level <= 5) {
    return {
      gridSize: 4,
      pathLength: Math.min(4 + level, 9),
      flashMs: Math.max(420, 620 - level * 25),
      gapMs: 210,
    };
  }

  if (level <= 12) {
    return {
      gridSize: 5,
      pathLength: Math.min(8 + Math.floor((level - 5) * 0.75), 14),
      flashMs: Math.max(320, 520 - (level - 5) * 20),
      gapMs: 180,
    };
  }

  return {
    gridSize: 6,
    pathLength: Math.min(13 + Math.floor((level - 12) * 0.65), 24),
    flashMs: Math.max(240, 380 - (level - 12) * 10),
    gapMs: 140,
  };
};

export default function MemoryPathPage() {
  const { user } = useAuth();
  const [path, setPath] = useState<number[]>([]);
  const [playerPath, setPlayerPath] = useState<number[]>([]);
  const [isShowing, setIsShowing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [activeCell, setActiveCell] = useState<number | null>(null);

  const userIdentity = user as ({ id?: string; _id?: string } | null);
  const userId = String(userIdentity?.id ?? userIdentity?._id ?? 'guest');
  const storageKey = useMemo(() => `mirana_level_memory_path_${userId}`, [userId]);
  const levelConfig = useMemo(() => getLevelConfig(level), [level]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedLevel = Number.parseInt(localStorage.getItem(storageKey) || '1', 10);
    const localLevel = Number.isFinite(savedLevel) && savedLevel > 0 ? savedLevel : 1;
    const serverLevel = (user?.progress?.[GameType.MEMORY_PATH] || 0) + 1;
    const resumeLevel = Math.max(1, localLevel, serverLevel);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLevel(resumeLevel);

    if (user) {
      api.getBestScore(GameType.MEMORY_PATH)
        .then(({ bestScore }) => setBestScore(bestScore))
        .catch(console.error);
    }
  }, [storageKey, user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey, level.toString());
  }, [level, storageKey]);

  const generatePath = useCallback((length: number, gridSize: number): number[] => {
    const totalCells = gridSize * gridSize;
    const maxLength = Math.min(length, totalCells);
    const uniqueCells = new Set<number>();

    while (uniqueCells.size < maxLength) {
      uniqueCells.add(Math.floor(Math.random() * totalCells));
    }

    return Array.from(uniqueCells);
  }, []);

  const showPath = useCallback(async (pathToShow: number[], flashMs: number, gapMs: number) => {
    setIsShowing(true);
    for (const cell of pathToShow) {
      setActiveCell(cell);
      await new Promise(resolve => setTimeout(resolve, flashMs));
      setActiveCell(null);
      await new Promise(resolve => setTimeout(resolve, gapMs));
    }
    setIsShowing(false);
  }, []);

  const startRound = useCallback(async (targetLevel: number) => {
    const config = getLevelConfig(targetLevel);
    const newPath = generatePath(config.pathLength, config.gridSize);
    setPath(newPath);
    setPlayerPath([]);
    setIsPlaying(true);
    setGameOver(false);
    await showPath(newPath, config.flashMs, config.gapMs);
  }, [generatePath, showPath]);

  const handleStartGame = useCallback(() => {
    void startRound(level);
  }, [level, startRound]);

  const handleCellClick = useCallback((index: number) => {
    if (isShowing || !isPlaying || gameOver) return;

    const newPlayerPath = [...playerPath, index];
    setPlayerPath(newPlayerPath);

    const currentStep = newPlayerPath.length - 1;
    if (path[currentStep] !== index) {
      setGameOver(true);
      setIsPlaying(false);

      const achievedLevel = Math.max(level - 1, 0);
      const score = achievedLevel * 120;

      if (user && score > 0) {
        api.submitScore({
          gameType: GameType.MEMORY_PATH,
          score,
          level: achievedLevel,
        }).then(() => {
          toast.error(`Wrong path! Score: ${score}`);
          if (!bestScore || score > bestScore) {
            setBestScore(score);
          }
        }).catch(console.error);
      } else {
        toast.error('Wrong path!');
      }
      return;
    }

    if (newPlayerPath.length === path.length) {
      const nextLevel = level + 1;
      toast.success(`Level ${level} complete!`);
      setLevel(nextLevel);
      setTimeout(() => {
        void startRound(nextLevel);
      }, 700);
    }
  }, [bestScore, gameOver, isPlaying, isShowing, level, path, playerPath, startRound, user]);

  const resetGame = useCallback(() => {
    setPath([]);
    setPlayerPath([]);
    setIsPlaying(false);
    setGameOver(false);
    setActiveCell(null);
  }, []);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Route className="h-6 w-6 text-primary" />
                Memory Path
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
                  title="Memory Path"
                  description="Remember and trace the path."
                  rules={[
                    'Watch the path in order.',
                    'Wait until highlights disappear.',
                    'Tap the exact same path.',
                  ]}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              {isShowing ? (
                <p className="font-medium">Watch the path...</p>
              ) : isPlaying ? (
                <p className="font-medium">Trace the path! ({playerPath.length}/{path.length})</p>
              ) : gameOver ? (
                <p className="font-medium text-red-500">Game Over!</p>
              ) : (
                <p className="text-muted-foreground">
                  Grid {levelConfig.gridSize}x{levelConfig.gridSize} | Path length {levelConfig.pathLength}
                </p>
              )}
            </div>

            <div className={cn('grid gap-2', GRID_CLASS_BY_SIZE[levelConfig.gridSize])}>
              {Array.from({ length: levelConfig.gridSize * levelConfig.gridSize }).map((_, index) => {
                const isClicked = playerPath.includes(index);
                const isCorrect = isClicked && path[playerPath.indexOf(index)] === index;

                return (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={isShowing || !isPlaying}
                    className={cn(
                      'aspect-square rounded-lg transition-all duration-200 border-2',
                      activeCell === index && 'bg-primary border-primary scale-105',
                      isClicked && isCorrect && 'bg-green-500 border-green-500',
                      isClicked && !isCorrect && 'bg-red-500 border-red-500',
                      !isClicked && 'bg-muted border-muted-foreground/20',
                      isPlaying && !isShowing && !isClicked && 'hover:border-primary cursor-pointer'
                    )}
                  />
                );
              })}
            </div>

            <div className="flex gap-3">
              {!isPlaying && !gameOver ? (
                <Button onClick={handleStartGame} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Start Game
                </Button>
              ) : (
                <Button onClick={resetGame} className="flex-1" variant={gameOver ? 'default' : 'outline'}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {gameOver ? 'Try Again' : 'Restart'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
