'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Play, RotateCcw, Route, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const GRID_SIZE = 5;

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

  useEffect(() => {
    if (user) {
      if (user.progress?.[GameType.MEMORY_PATH]) {
        setLevel(user.progress[GameType.MEMORY_PATH] + 1);
      }

      api.getBestScore(GameType.MEMORY_PATH)
        .then(({ bestScore }) => setBestScore(bestScore))
        .catch(console.error);
    }
  }, [user]);

  const generatePath = useCallback((length: number): number[] => {
    const newPath: number[] = [];
    const totalCells = GRID_SIZE * GRID_SIZE;

    while (newPath.length < length) {
      const randomCell = Math.floor(Math.random() * totalCells);
      if (!newPath.includes(randomCell)) {
        newPath.push(randomCell);
      }
    }
    return newPath;
  }, []);

  const showPath = useCallback(async (pathToShow: number[]) => {
    setIsShowing(true);
    for (let i = 0; i < pathToShow.length; i++) {
      setActiveCell(pathToShow[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveCell(null);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    setIsShowing(false);
  }, []);

  const startGame = useCallback(async () => {
    const pathLength = 3 + Math.floor(level / 2);
    const newPath = generatePath(pathLength);
    setPath(newPath);
    setPlayerPath([]);
    setIsPlaying(true);
    setGameOver(false);
    await showPath(newPath);
  }, [level, generatePath, showPath]);

  const handleCellClick = useCallback((index: number) => {
    if (isShowing || !isPlaying || gameOver) return;

    const newPlayerPath = [...playerPath, index];
    setPlayerPath(newPlayerPath);

    const currentStep = newPlayerPath.length - 1;
    if (path[currentStep] !== index) {
      // Wrong cell
      setGameOver(true);
      setIsPlaying(false);
      const score = (level - 1) * 50;

      if (user && score > 0) {
        api.submitScore({
          gameType: GameType.MEMORY_PATH,
          score,
          level: level - 1,
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
      // Completed level
      toast.success(`Level ${level} complete!`);
      setLevel(l => l + 1);
      setTimeout(() => {
        startGame();
      }, 1000);
    }
  }, [isShowing, isPlaying, gameOver, playerPath, path, level, user, bestScore, startGame]);

  const resetGame = () => {
    setLevel(1);
    setPath([]);
    setPlayerPath([]);
    setIsPlaying(false);
    setGameOver(false);
  };

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
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instructions */}
            <div className="text-center p-3 bg-muted rounded-lg">
              {isShowing ? (
                <p className="font-medium">Watch the path...</p>
              ) : isPlaying ? (
                <p className="font-medium">Trace the path! ({playerPath.length}/{path.length})</p>
              ) : gameOver ? (
                <p className="font-medium text-red-500">Game Over!</p>
              ) : (
                <p className="text-muted-foreground">Remember and trace the highlighted cells in order</p>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                const isInPath = path.includes(index);
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

            {/* Controls */}
            <div className="flex gap-3">
              {!isPlaying && !gameOver ? (
                <Button onClick={startGame} className="flex-1">
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
