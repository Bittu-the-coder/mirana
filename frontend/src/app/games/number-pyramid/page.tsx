'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, Hash, Play, RotateCcw, Trophy, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PyramidCell {
  value: number | null;
  isInput: boolean;
  userValue: string;
  isCorrect: boolean | null;
}

function generatePyramid(rows: number): { pyramid: PyramidCell[][]; solution: number[][] } {
  // Generate bottom row
  const solution: number[][] = [];
  const bottomRow = Array.from({ length: rows }, () => Math.floor(Math.random() * 9) + 1);
  solution.push(bottomRow);

  // Build up
  for (let i = 1; i < rows; i++) {
    const prevRow = solution[i - 1];
    const newRow = [];
    for (let j = 0; j < prevRow.length - 1; j++) {
      newRow.push(prevRow[j] + prevRow[j + 1]);
    }
    solution.push(newRow);
  }

  solution.reverse();

  // Create puzzle with some values hidden
  const pyramid: PyramidCell[][] = solution.map((row, rowIndex) => {
    return row.map((value, colIndex) => {
      // Show some values, hide others
      const showValue = Math.random() > 0.5 || rowIndex === 0;
      return {
        value: showValue ? value : null,
        isInput: !showValue,
        userValue: '',
        isCorrect: null,
      };
    });
  });

  return { pyramid, solution };
}

export default function NumberPyramidPage() {
  const { user } = useAuth();
  const [pyramid, setPyramid] = useState<PyramidCell[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [rows, setRows] = useState(5);

  useEffect(() => {
    if (user) {
      api.getBestScore(GameType.NUMBER_PYRAMID)
        .then(({ bestScore }) => setBestScore(bestScore))
        .catch(console.error);
    }
  }, [user]);

  const startGame = useCallback(() => {
    const { pyramid: newPyramid, solution: newSolution } = generatePyramid(rows);
    setPyramid(newPyramid);
    setSolution(newSolution);
    setIsPlaying(true);
    setIsChecked(false);
  }, [rows]);

  const handleInputChange = (rowIndex: number, colIndex: number, value: string) => {
    if (isChecked) return;

    const newPyramid = pyramid.map((row, ri) =>
      row.map((cell, ci) => {
        if (ri === rowIndex && ci === colIndex) {
          return { ...cell, userValue: value.replace(/\D/g, '') };
        }
        return cell;
      })
    );
    setPyramid(newPyramid);
  };

  const checkSolution = () => {
    let allCorrect = true;
    let correctCount = 0;
    let totalInputs = 0;

    const checkedPyramid = pyramid.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (cell.isInput) {
          totalInputs++;
          const isCorrect = parseInt(cell.userValue) === solution[rowIndex][colIndex];
          if (isCorrect) correctCount++;
          else allCorrect = false;
          return { ...cell, isCorrect };
        }
        return cell;
      })
    );

    setPyramid(checkedPyramid);
    setIsChecked(true);

    const score = correctCount * 50;

    if (allCorrect) {
      if (user) {
        api.submitScore({
          gameType: GameType.NUMBER_PYRAMID,
          score: score + 100,
        }).then(() => {
          toast.success(`Perfect! Score: ${score + 100}`);
          if (!bestScore || score + 100 > bestScore) {
            setBestScore(score + 100);
          }
        }).catch(console.error);
      } else {
        toast.success(`Perfect! Score: ${score + 100}`);
      }
    } else {
      toast.info(`${correctCount}/${totalInputs} correct`);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Hash className="h-6 w-6 text-primary" />
                Number Pyramid
              </CardTitle>
              {bestScore !== null && (
                <Badge variant="outline">
                  <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                  {bestScore}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instructions */}
            {!isPlaying && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Each number is the sum of the two numbers directly below it.
                  Fill in the missing numbers to complete the pyramid.
                </p>
              </div>
            )}

            {/* Pyramid */}
            {isPlaying && (
              <div className="space-y-2">
                {pyramid.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center gap-1">
                    {row.map((cell, colIndex) => (
                      <div key={colIndex} className="relative">
                        {cell.isInput ? (
                          <Input
                            value={cell.userValue}
                            onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                            disabled={isChecked}
                            className={cn(
                              'w-12 h-12 text-center font-bold text-lg p-0',
                              isChecked && cell.isCorrect && 'border-green-500 bg-green-500/10',
                              isChecked && cell.isCorrect === false && 'border-red-500 bg-red-500/10'
                            )}
                            maxLength={3}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg">
                            {cell.value}
                          </div>
                        )}
                        {isChecked && cell.isInput && (
                          <div className={cn(
                            'absolute -right-1 -top-1 w-4 h-4 rounded-full flex items-center justify-center',
                            cell.isCorrect ? 'bg-green-500' : 'bg-red-500'
                          )}>
                            {cell.isCorrect ? (
                              <Check className="h-3 w-3 text-white" />
                            ) : (
                              <X className="h-3 w-3 text-white" />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-3">
              {!isPlaying ? (
                <Button onClick={startGame} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Start Game
                </Button>
              ) : !isChecked ? (
                <>
                  <Button onClick={checkSolution} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    Check
                  </Button>
                  <Button variant="outline" onClick={startGame}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button onClick={startGame} className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Puzzle
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
