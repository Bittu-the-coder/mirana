'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Clock, Move, RotateCcw, Shuffle, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Tile {
  value: number;
  row: number;
  col: number;
}

const GRID_SIZE = 4;

function createSolvedPuzzle(): number[] {
  return Array.from({ length: GRID_SIZE * GRID_SIZE - 1 }, (_, i) => i + 1).concat([0]);
}

function shufflePuzzle(tiles: number[]): number[] {
  const shuffled = [...tiles];
  let blankIndex = shuffled.indexOf(0);

  // Perform random valid moves
  for (let i = 0; i < 200; i++) {
    const possibleMoves = [];
    const row = Math.floor(blankIndex / GRID_SIZE);
    const col = blankIndex % GRID_SIZE;

    if (row > 0) possibleMoves.push(blankIndex - GRID_SIZE);
    if (row < GRID_SIZE - 1) possibleMoves.push(blankIndex + GRID_SIZE);
    if (col > 0) possibleMoves.push(blankIndex - 1);
    if (col < GRID_SIZE - 1) possibleMoves.push(blankIndex + 1);

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

export default function SlidingPuzzlePage() {
  const { user } = useAuth();
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [solved, setSolved] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    setTiles(createSolvedPuzzle());
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

  const startGame = useCallback(() => {
    setTiles(shufflePuzzle(createSolvedPuzzle()));
    setMoves(0);
    setTime(0);
    setIsPlaying(true);
    setSolved(false);
  }, []);

  const handleTileClick = useCallback((index: number) => {
    if (!isPlaying || solved) return;

    const blankIndex = tiles.indexOf(0);
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const blankRow = Math.floor(blankIndex / GRID_SIZE);
    const blankCol = blankIndex % GRID_SIZE;

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

        const score = Math.max(1000 - moves * 10 - time * 2, 100);

        if (user) {
          api.submitScore({
            gameType: GameType.SLIDING_PUZZLE,
            score,
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
  }, [tiles, isPlaying, solved, moves, time, user, bestScore]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Sliding Puzzle</CardTitle>
              <Badge variant="outline">4x4</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <div className="grid grid-cols-4 gap-1 h-full">
                {tiles.map((tile, index) => (
                  <button
                    key={index}
                    onClick={() => handleTileClick(index)}
                    disabled={!isPlaying || tile === 0}
                    className={cn(
                      'aspect-square rounded-lg font-bold text-2xl transition-all duration-150',
                      tile === 0
                        ? 'bg-transparent'
                        : 'bg-primary text-primary-foreground hover:scale-105 active:scale-95',
                      solved && tile !== 0 && 'bg-green-500'
                    )}
                  >
                    {tile !== 0 && tile}
                  </button>
                ))}
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
              <Button
                variant="outline"
                onClick={() => {
                  setTiles(createSolvedPuzzle());
                  setMoves(0);
                  setTime(0);
                  setIsPlaying(false);
                  setSolved(false);
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
