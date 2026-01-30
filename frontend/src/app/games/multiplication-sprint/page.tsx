'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Calculator, CheckCircle, Clock, Trophy, XCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Challenge {
  a: number;
  b: number;
  answer: number;
}

function generateChallenge(level: number): Challenge {
  // Difficulty scales with level
  const maxNum = Math.min(5 + Math.floor(level / 3), 15);
  const minNum = Math.max(2, Math.floor(level / 5));
  const a = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
  const b = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
  return { a, b, answer: a * b };
}

const STORAGE_KEY = 'mirana_brain_training_level';

export default function MultiplicationSprintPage() {
  const { user } = useAuth();
  const [level, setLevel] = useState(1);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Load saved level
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (saved) {
        setLevel(parseInt(saved) || 1);
      }
    }
  }, [user]);

  // Save level when it changes
  useEffect(() => {
    if (user && level > 1) {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, level.toString());
    }
  }, [level, user]);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setChallenge(generateChallenge(level));
    setUserAnswer('');
    setFeedback(null);
  }, [level]);

  const endGame = () => {
    setIsPlaying(false);
    const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

    // Level up if accuracy > 80% and answered enough
    if (accuracy >= 80 && correctAnswers >= 10) {
      const newLevel = level + 1;
      setLevel(newLevel);
      toast.success(`Level Up! Now at Level ${newLevel}`);
    }

    if (streak > bestStreak) {
      setBestStreak(streak);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || !userAnswer) return;

    const isCorrect = parseInt(userAnswer) === challenge.answer;
    setQuestionsAnswered((q) => q + 1);

    if (isCorrect) {
      setCorrectAnswers((c) => c + 1);
      setStreak((s) => s + 1);
      const points = 10 + (streak * 2) + level;
      setScore((s) => s + points);
      setFeedback('correct');
    } else {
      setStreak(0);
      setFeedback('wrong');
    }

    // Clear feedback after animation
    setTimeout(() => setFeedback(null), 300);

    // Generate new challenge with fresh numbers
    setChallenge(generateChallenge(level));
    setUserAnswer('');
  };

  const skipQuestion = () => {
    setStreak(0);
    setQuestionsAnswered((q) => q + 1);
    setChallenge(generateChallenge(level));
    setUserAnswer('');
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>

        <Card className={feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calculator className="h-6 w-6 text-primary" />
                Multiplication Sprint
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary">Level {level}</Badge>
                {user && <Badge variant="outline">Saved</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isPlaying ? (
              // Start Screen
              <div className="text-center space-y-6">
                <div className="p-8 bg-muted rounded-xl">
                  <Calculator className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <h2 className="text-xl font-bold mb-2">Ready to Train?</h2>
                  <p className="text-muted-foreground">
                    Solve as many multiplication problems as possible in 60 seconds!
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Trophy className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                    <p className="text-xl font-bold">{bestStreak}</p>
                    <p className="text-xs text-muted-foreground">Best Streak</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Zap className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-xl font-bold">{level}</p>
                    <p className="text-xs text-muted-foreground">Level</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <p className="text-xl font-bold">{score}</p>
                    <p className="text-xs text-muted-foreground">Last Score</p>
                  </div>
                </div>

                <Button onClick={startGame} className="w-full" size="lg">
                  <Zap className="h-5 w-5 mr-2" />
                  Start Sprint
                </Button>
              </div>
            ) : (
              // Game Screen
              <div className="space-y-6">
                {/* Timer and Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Clock className="h-4 w-4 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{timeLeft}s</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Zap className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                    <p className="text-2xl font-bold">{streak}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Trophy className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">{score}</p>
                  </div>
                </div>

                {/* Progress */}
                <Progress value={(timeLeft / 60) * 100} className="h-2" />

                {/* Challenge */}
                {challenge && (
                  <div className="text-center p-8 bg-primary/10 rounded-xl">
                    <p className="text-5xl font-bold mb-2">
                      {challenge.a} × {challenge.b}
                    </p>
                    <p className="text-sm text-muted-foreground">= ?</p>
                  </div>
                )}

                {/* Answer Input */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Your answer"
                    className="text-center text-2xl h-14"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={!userAnswer}>
                      Submit
                    </Button>
                    <Button type="button" variant="outline" onClick={skipQuestion}>
                      Skip
                    </Button>
                  </div>
                </form>

                {/* Feedback icons */}
                {feedback && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    {feedback === 'correct' ? (
                      <CheckCircle className="h-16 w-16 text-green-500 animate-ping" />
                    ) : (
                      <XCircle className="h-16 w-16 text-red-500 animate-ping" />
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
