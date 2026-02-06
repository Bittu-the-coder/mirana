'use client';

import { GameGuideDialog } from '@/components/game-guide-dialog';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Clock, Grid3X3, Move, RotateCcw, Shuffle, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

type GridSize = 4 | 5 | 6;

function createSolvedPuzzle(size: GridSize): number[] {
  return Array.from({ length: size * size - 1 }, (_, i) => i + 1).concat([0]);
}

function shufflePuzzle(tiles: number[], size: GridSize): number[] {
  const shuffled = [...tiles];
  let blankIndex = shuffled.indexOf(0);

  // Perform random valid moves (more for larger grids)
  const shuffleCount = size === 4 ? 150 : size === 5 ? 200 : 250;
  for (let i = 0; i < shuffleCount; i++) {
    const possibleMoves = [];
    const row = Math.floor(blankIndex / size);
    const col = blankIndex % size;

    if (row > 0) possibleMoves.push(blankIndex - size);
    if (row < size - 1) possibleMoves.push(blankIndex + size);
    if (col > 0) possibleMoves.push(blankIndex - 1);
    if (col < size - 1) possibleMoves.push(blankIndex + 1);

    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    [shuffled[blankIndex], shuffled[randomMove]] = [shuffled[randomMove], shuffled[blankIndex]];
    blankIndex = randomMove;
  }

  return shuffled;
}

function isSolved(tiles: number[]): boolean {
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[tiles.length - 1] === 0;
}

function isInCorrectPosition(tile: number, index: number): boolean {
  if (tile === 0) return false;
  return tile === index + 1;
}

export default function SlidingPuzzlePage() {
  const { user } = useAuth();
  const [gridSize, setGridSize] = useState<GridSize>(4);
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [solved, setSolved] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    // Load progress
    if (user?.progress?.[GameType.SLIDING_PUZZLE]) {
      setGridSize(user.progress[GameType.SLIDING_PUZZLE] as GridSize);
    }

    setTiles(createSolvedPuzzle(gridSize));
    if (user) {
      api.getBestScore(GameType.SLIDING_PUZZLE)
        .then(({ bestScore }) => setBestScore(bestScore))
        .catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !solved) {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, solved]);

  const handleGridSizeChange = (size: string) => {
    if (isPlaying) return;
    const newSize = parseInt(size) as GridSize;
    setGridSize(newSize);
    setTiles(createSolvedPuzzle(newSize));
    setMoves(0);
    setTime(0);
    setSolved(false);
  };

  const startGame = useCallback(() => {
    setTiles(shufflePuzzle(createSolvedPuzzle(gridSize), gridSize));
    setMoves(0);
    setTime(0);
    setIsPlaying(true);
    setSolved(false);
  }, [gridSize]);

  const handleTileClick = useCallback((index: number) => {
    if (!isPlaying || solved) return;

    const blankIndex = tiles.indexOf(0);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const blankRow = Math.floor(blankIndex / gridSize);
    const blankCol = blankIndex % gridSize;

    const isAdjacent =
      (Math.abs(row - blankRow) === 1 && col === blankCol) ||
      (Math.abs(col - blankCol) === 1 && row === blankRow);

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[blankIndex]] = [newTiles[blankIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves((m) => m + 1);

      if (isSolved(newTiles)) {
        setSolved(true);
        setIsPlaying(false);

        // Score multiplier based on grid size
        const multiplier = gridSize === 4 ? 1 : gridSize === 5 ? 1.5 : 2;
        const baseScore = Math.max(1000 - moves * 10 - time * 2, 100);
        const score = Math.round(baseScore * multiplier);

        if (user) {
          api.submitScore({
            gameType: GameType.SLIDING_PUZZLE,
            score,
            level: gridSize,
            timeSpent: time,
          }).then(() => {
            toast.success(`Puzzle solved! Score: ${score}`);
            if (!bestScore || score > bestScore) {
              setBestScore(score);
            }
          }).catch(console.error);
        } else {
          toast.success(`Puzzle solved! Score: ${score}`);
        }
      }
    }
  }, [tiles, isPlaying, solved, moves, time, user, bestScore, gridSize]);

  const resetGame = () => {
    setTiles(createSolvedPuzzle(gridSize));
    setMoves(0);
    setTime(0);
    setIsPlaying(false);
    setSolved(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyLabel = () => {
    return gridSize === 4 ? 'Easy' : gridSize === 5 ? 'Medium' : 'Hard';
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Grid3X3 className="h-6 w-6 text-primary" />
                Sliding Puzzle
              </CardTitle>
              <Badge variant={gridSize === 4 ? 'default' : gridSize === 5 ? 'secondary' : 'destructive'}>
                {getDifficultyLabel()}
              </Badge>
              <GameGuideDialog
                  title="Sliding Puzzle"
                  description="Order the tiles."
                  rules={[
                    "Slide tiles into the empty space.",
                    "Arrange numbers in ascending order.",
                  ]}
                />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Difficulty Selection */}
            <Tabs
              value={gridSize.toString()}
              onValueChange={handleGridSizeChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="4" disabled={isPlaying}>4×4 Easy</TabsTrigger>
                <TabsTrigger value="5" disabled={isPlaying}>5×5 Medium</TabsTrigger>
                <TabsTrigger value="6" disabled={isPlaying}>6×6 Hard</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <Move className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">{moves}</p>
                <p className="text-xs text-muted-foreground">Moves</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">{formatTime(time)}</p>
                <p className="text-xs text-muted-foreground">Time</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Trophy className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                <p className="text-2xl font-bold">{bestScore || '-'}</p>
                <p className="text-xs text-muted-foreground">Best</p>
              </div>
            </div>

            {/* Puzzle Grid */}
            <div className="relative aspect-square bg-muted rounded-xl p-2">
              <div
                className="grid gap-1 h-full"
                style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
              >
                {tiles.map((tile, index) => {
                  const isCorrect = isInCorrectPosition(tile, index);
                  return (
                    <button
                      key={index}
                      onClick={() => handleTileClick(index)}
                      disabled={!isPlaying || tile === 0}
                      className={cn(
                        'aspect-square rounded-lg font-bold transition-all duration-150 flex items-center justify-center',
                        gridSize === 4 ? 'text-2xl' : gridSize === 5 ? 'text-xl' : 'text-lg',
                        tile === 0
                          ? 'bg-transparent'
                          : isCorrect && isPlaying
                            ? 'bg-green-500 text-white hover:scale-105 active:scale-95'
                            : 'bg-primary text-primary-foreground hover:scale-105 active:scale-95',
                        solved && tile !== 0 && 'bg-green-500 text-white'
                      )}
                    >
                      {tile !== 0 && tile}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Solved Message */}
            {solved && (
              <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="font-bold text-green-500">Puzzle Solved!</p>
                <p className="text-sm text-muted-foreground">
                  {moves} moves in {formatTime(time)}
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-3">
              <Button onClick={startGame} className="flex-1">
                <Shuffle className="h-4 w-4 mr-2" />
                {isPlaying ? 'Restart' : 'Start'}
              </Button>
              <Button variant="outline" onClick={resetGame}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
