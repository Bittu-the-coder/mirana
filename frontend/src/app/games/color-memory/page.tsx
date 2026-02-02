'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Palette, Play, RotateCcw, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const COLORS = [
  { name: 'Red', bg: 'bg-red-500', value: 0 },
  { name: 'Green', bg: 'bg-green-500', value: 1 },
  { name: 'Blue', bg: 'bg-blue-500', value: 2 },
  { name: 'Yellow', bg: 'bg-yellow-400', value: 3 },
  { name: 'Purple', bg: 'bg-purple-500', value: 4 },
  { name: 'Orange', bg: 'bg-orange-500', value: 5 },
];

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

  useEffect(() => {
    if (user) {
      if (user.progress?.[GameType.COLOR_MEMORY]) {
        setLevel(user.progress[GameType.COLOR_MEMORY] + 1);
      }

      api.getBestScore(GameType.COLOR_MEMORY)
        .then(({ bestScore }) => setBestScore(bestScore))
        .catch(console.error);
    }
  }, [user]);

  const showSequence = useCallback(async (seq: number[]) => {
    setIsShowingSequence(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveColor(seq[i]);
      await new Promise(resolve => setTimeout(resolve, 400));
      setActiveColor(null);
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsShowingSequence(false);
  }, []);

  const startGame = useCallback(async () => {
    const newColor = Math.floor(Math.random() * COLORS.length);
    setSequence([newColor]);
    setPlayerSequence([]);
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    await showSequence([newColor]);
  }, [showSequence]);

  const nextLevel = useCallback(async () => {
    const newColor = Math.floor(Math.random() * COLORS.length);
    const newSequence = [...sequence, newColor];
    setSequence(newSequence);
    setPlayerSequence([]);
    setLevel(l => l + 1);
    await showSequence(newSequence);
  }, [sequence, showSequence]);

  const handleColorClick = useCallback(async (colorIndex: number) => {
    if (isShowingSequence || gameOver || !isPlaying) return;

    setActiveColor(colorIndex);
    setTimeout(() => setActiveColor(null), 200);

    const newPlayerSequence = [...playerSequence, colorIndex];
    setPlayerSequence(newPlayerSequence);

    const currentIndex = newPlayerSequence.length - 1;
    if (sequence[currentIndex] !== colorIndex) {
      // Wrong color
      setGameOver(true);
      setIsPlaying(false);
      const finalScore = (level - 1) * 100;
      setScore(finalScore);

      if (user && finalScore > 0) {
        api.submitScore({
          gameType: GameType.COLOR_MEMORY,
          score: finalScore,
          level: level - 1,
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

    // Correct sequence so far
    if (newPlayerSequence.length === sequence.length) {
      // Completed level
      setScore(level * 100);
      await new Promise(resolve => setTimeout(resolve, 500));
      await nextLevel();
    }
  }, [isShowingSequence, gameOver, isPlaying, playerSequence, sequence, level, user, bestScore, nextLevel]);

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
                <p className="text-lg font-medium">Press Start to play</p>
              )}
            </div>

            {/* Color Grid */}
            <div className="grid grid-cols-3 gap-3">
              {COLORS.map((color, index) => (
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
