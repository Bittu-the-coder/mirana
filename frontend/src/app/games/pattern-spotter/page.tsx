'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, Eye, Play, RotateCcw, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Pattern {
  sequence: (number | string)[];
  answer: number | string;
  options: (number | string)[];
}

function generatePattern(): Pattern {
  const patternTypes = [
    // Arithmetic sequences
    () => {
      const start = Math.floor(Math.random() * 10) + 1;
      const diff = Math.floor(Math.random() * 5) + 1;
      const sequence = Array.from({ length: 4 }, (_, i) => start + diff * i);
      const answer = start + diff * 4;
      const options = [answer, answer + 1, answer - 1, answer + diff].sort(() => Math.random() - 0.5);
      return { sequence, answer, options };
    },
    // Geometric sequences
    () => {
      const start = Math.floor(Math.random() * 3) + 1;
      const ratio = Math.floor(Math.random() * 2) + 2;
      const sequence = Array.from({ length: 4 }, (_, i) => start * Math.pow(ratio, i));
      const answer = start * Math.pow(ratio, 4);
      const options = [answer, answer + ratio, answer - ratio, answer * 2].sort(() => Math.random() - 0.5);
      return { sequence, answer, options };
    },
    // Square numbers
    () => {
      const start = Math.floor(Math.random() * 3) + 1;
      const sequence = Array.from({ length: 4 }, (_, i) => (start + i) * (start + i));
      const answer = (start + 4) * (start + 4);
      const options = [answer, answer + 1, (start + 3) * (start + 3) + 1, answer - 2].sort(() => Math.random() - 0.5);
      return { sequence, answer, options };
    },
  ];

  const generator = patternTypes[Math.floor(Math.random() * patternTypes.length)];
  return generator();
}

export default function PatternSpotterPage() {
  const { user } = useAuth();
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const MAX_ROUNDS = 10;

  useEffect(() => {
    if (user) {
      api.getBestScore(GameType.PATTERN_SPOTTER)
        .then(({ bestScore }) => setBestScore(bestScore))
        .catch(console.error);
    }
  }, [user]);

  const startGame = useCallback(() => {
    setPattern(generatePattern());
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setRound(1);
    setGameOver(false);
  }, []);

  const handleAnswer = useCallback((answer: number | string) => {
    if (isCorrect !== null || !pattern) return;

    setSelectedAnswer(answer);
    const correct = answer === pattern.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore(s => s + 100);
    }

    setTimeout(() => {
      if (round >= MAX_ROUNDS) {
        const finalScore = score + (correct ? 100 : 0);
        setGameOver(true);

        if (user) {
          api.submitScore({
            gameType: GameType.PATTERN_SPOTTER,
            score: finalScore,
          }).then(() => {
            toast.success(`Game complete! Score: ${finalScore}`);
            if (!bestScore || finalScore > bestScore) {
              setBestScore(finalScore);
            }
          }).catch(console.error);
        } else {
          toast.success(`Game complete! Score: ${finalScore}`);
        }
      } else {
        setPattern(generatePattern());
        setSelectedAnswer(null);
        setIsCorrect(null);
        setRound(r => r + 1);
      }
    }, 1000);
  }, [isCorrect, pattern, round, score, user, bestScore]);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                Pattern Spotter
              </CardTitle>
              <div className="flex gap-2">
                {round > 0 && <Badge variant="secondary">{round}/{MAX_ROUNDS}</Badge>}
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
            {!pattern ? (
              <>
                <div className="text-center p-6 bg-muted rounded-lg">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Find the next number in each sequence. Complete 10 patterns to finish!
                  </p>
                </div>
                <Button onClick={startGame} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Game
                </Button>
              </>
            ) : gameOver ? (
              <>
                <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                  <p className="text-2xl font-bold">Game Complete!</p>
                  <p className="text-muted-foreground">Score: {score}</p>
                </div>
                <Button onClick={startGame} className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Play Again
                </Button>
              </>
            ) : (
              <>
                {/* Score */}
                <div className="text-center">
                  <p className="text-3xl font-bold">{score}</p>
                  <p className="text-sm text-muted-foreground">points</p>
                </div>

                {/* Pattern Sequence */}
                <div className="flex justify-center gap-2">
                  {pattern.sequence.map((num, index) => (
                    <div
                      key={index}
                      className="w-14 h-14 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xl"
                    >
                      {num}
                    </div>
                  ))}
                  <div className="w-14 h-14 border-2 border-dashed border-primary rounded-lg flex items-center justify-center font-bold text-xl text-primary">
                    ?
                  </div>
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-2 gap-3">
                  {pattern.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={
                        selectedAnswer === option
                          ? isCorrect
                            ? 'default'
                            : 'destructive'
                          : 'outline'
                      }
                      className={cn(
                        'h-14 text-lg font-bold',
                        selectedAnswer === option && isCorrect && 'bg-green-500 hover:bg-green-500',
                        selectedAnswer !== null && option === pattern.answer && 'border-green-500'
                      )}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                    >
                      {option}
                      {selectedAnswer !== null && option === pattern.answer && (
                        <Check className="h-5 w-5 ml-2" />
                      )}
                    </Button>
                  ))}
                </div>

                {/* Result Feedback */}
                {isCorrect !== null && (
                  <div className={cn(
                    'text-center p-3 rounded-lg font-medium',
                    isCorrect ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  )}>
                    {isCorrect ? 'Correct! +100 points' : `Wrong! The answer was ${pattern.answer}`}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
