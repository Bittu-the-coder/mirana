
'use client';

import { GameGuideDialog } from '@/components/game-guide-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import { Brain, Timer, Trophy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function MentalMathPage() {
  const { user } = useAuth();
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [question, setQuestion] = useState<{ text: string; answer: number } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      api.getBestScore(GameType.MENTAL_MATH)
        .then(({ bestScore }) => setBestScore(bestScore))
        .catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            endGame();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  const generateQuestion = () => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * 20) + 1;
    let b = Math.floor(Math.random() * 20) + 1;

    // Adjust difficulty based on score
    if (score > 100) {
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * 50) + 10;
    }

    if (op === '*') {
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 12) + 2;
    } else if (op === '-') {
      if (a < b) [a, b] = [b, a];
    }

    let answer = 0;
    switch (op) {
      case '+': answer = a + b; break;
      case '-': answer = a - b; break;
      case '*': answer = a * b; break;
    }

    setQuestion({ text: `${a} ${op} ${b}`, answer });
    setInputValue('');
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsPlaying(true);
    generateQuestion();
    setInputValue('');
  };

  const endGame = () => {
    setIsPlaying(false);
    toast.success(`Game Over! Score: ${score}`);

    // Use bespoke game type if available, using placeholder for now
    // In a real scenario we'd add MENTAL_MATH to GameType enum
    if (user) {
        // api.submitScore(...)
        // For now just show toast as we might need to add GameType backend side first if strictly typed
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlaying || !question) return;

    if (parseInt(inputValue) === question.answer) {
      const points = 10 + Math.ceil(timeLeft / 10); // Bonus for speed
      setScore(s => s + points);
      toast.success('Correct!');
      generateQuestion();
    } else {
      toast.error('Wrong! Try again');
      setInputValue(''); // Optional: clear input on wrong answer
      // Penalty?
       setScore(s => Math.max(0, s - 5));
    }
    // Refocus input after each submission
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
             <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                Mental Math
              </CardTitle>
              <div className="flex items-center gap-2">
                 {bestScore !== null && (
                  <Badge variant="outline">
                    <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                    {bestScore}
                  </Badge>
                )}
                <GameGuideDialog
                  title="Mental Math"
                  description="Solve arithmetic problems against the clock."
                  rules={[
                    "You maximize your score in 60 seconds.",
                    "Solve the math problems shown.",
                    "Correct answers give points.",
                    "Wrong answers deduct points.",
                  ]}
                  scoring={[
                    "Base points for correct answer.",
                    "Speed bonuses apply!",
                  ]}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
                <div className="text-center">
                    <span className="text-sm text-muted-foreground block">Score</span>
                    <span className="text-2xl font-bold">{score}</span>
                </div>
                <div className="text-center">
                     <span className="text-sm text-muted-foreground block">Time</span>
                     <div className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        <span className={`text-2xl font-bold ${timeLeft < 10 ? 'text-red-500' : ''}`}>
                            {timeLeft}s
                        </span>
                     </div>
                </div>
            </div>

            {!isPlaying ? (
               <div className="text-center py-8">
                  <p className="mb-4 text-muted-foreground">Solve as many problems as you can in 60 seconds!</p>
                  <Button size="lg" onClick={startGame} className="w-full">Start Game</Button>
               </div>
            ) : (
                <div className="space-y-6">
                    <div className="text-center py-8">
                        <span className="text-5xl font-bold block mb-2">{question?.text} = ?</span>
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                           ref={inputRef}
                           type="number"
                           autoFocus
                           className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                           placeholder="Answer..."
                           value={inputValue}
                           onChange={(e) => setInputValue(e.target.value)}
                        />
                        <Button type="submit" size="lg">Check</Button>
                    </form>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                 <Button variant="ghost" onClick={() => window.location.href = '/games'} className="w-full">
                    Back to Games
                 </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
