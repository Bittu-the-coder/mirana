'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Calendar, RotateCcw, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const WORDS = [
  'BRAIN', 'LOGIC', 'SMART', 'THINK', 'LEARN', 'FOCUS', 'SOLVE', 'QUEST',
  'PUZZLE', 'MINDS', 'POWER', 'SHARP', 'QUICK', 'SKILL', 'GAMES', 'PLAYS',
];

const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;

type LetterState = 'correct' | 'present' | 'absent' | 'empty';

interface LetterGuess {
  letter: string;
  state: LetterState;
}

function getDailyWord(): string {
  const today = new Date().toDateString();
  const hash = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return WORDS[hash % WORDS.length];
}

export default function DailyMysteryWordPage() {
  const { user } = useAuth();
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<LetterGuess[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [usedLetters, setUsedLetters] = useState<Record<string, LetterState>>({});

  useEffect(() => {
    setTargetWord(getDailyWord());
    if (user) {
      api.getBestScore(GameType.DAILY_MYSTERY_WORD)
        .then(({ bestScore }) => setBestScore(bestScore))
        .catch(console.error);
    }
  }, [user]);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH || gameOver) return;

    const guess = currentGuess.toUpperCase();
    const result: LetterGuess[] = [];
    const targetLetters = targetWord.split('');
    const guessLetters = guess.split('');
    const newUsedLetters = { ...usedLetters };

    // First pass: mark correct letters
    guessLetters.forEach((letter, i) => {
      if (letter === targetLetters[i]) {
        result.push({ letter, state: 'correct' });
        targetLetters[i] = '';
        newUsedLetters[letter] = 'correct';
      } else {
        result.push({ letter, state: 'absent' });
      }
    });

    // Second pass: mark present letters
    result.forEach((r, i) => {
      if (r.state === 'absent') {
        const idx = targetLetters.indexOf(r.letter);
        if (idx !== -1) {
          result[i].state = 'present';
          targetLetters[idx] = '';
          if (newUsedLetters[r.letter] !== 'correct') {
            newUsedLetters[r.letter] = 'present';
          }
        } else {
          if (!newUsedLetters[r.letter]) {
            newUsedLetters[r.letter] = 'absent';
          }
        }
      }
    });

    setUsedLetters(newUsedLetters);
    setGuesses([...guesses, result]);
    setCurrentGuess('');

    if (guess === targetWord) {
      setWon(true);
      setGameOver(true);
      const score = (MAX_ATTEMPTS - guesses.length) * 100 + 100;

      if (user) {
        api.submitScore({
          gameType: GameType.DAILY_MYSTERY_WORD,
          score,
        }).then(() => {
          toast.success(`Word found! Score: ${score}`);
          if (!bestScore || score > bestScore) {
            setBestScore(score);
          }
        }).catch(console.error);
      } else {
        toast.success(`Word found! Score: ${score}`);
      }
    } else if (guesses.length + 1 >= MAX_ATTEMPTS) {
      setGameOver(true);
      toast.error(`Game over! The word was ${targetWord}`);
    }
  }, [currentGuess, targetWord, guesses, gameOver, user, bestScore, usedLetters]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameOver) return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + key);
    }
  }, [gameOver, currentGuess, submitGuess]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const resetGame = () => {
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setWon(false);
    setUsedLetters({});
  };

  const getLetterColor = (state: LetterState) => {
    switch (state) {
      case 'correct': return 'bg-green-500 border-green-500 text-white';
      case 'present': return 'bg-amber-500 border-amber-500 text-white';
      case 'absent': return 'bg-muted border-muted-foreground/20 text-muted-foreground';
      default: return 'border-muted-foreground/30';
    }
  };

  const keyboard = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ];

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Daily Mystery Word
              </CardTitle>
              {bestScore && (
                <Badge variant="secondary">
                  <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                  {bestScore}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Grid */}
            <div className="space-y-2">
              {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
                const guess = guesses[rowIndex];
                const isCurrentRow = rowIndex === guesses.length && !gameOver;

                return (
                  <div key={rowIndex} className="flex justify-center gap-1.5">
                    {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                      const letterData = guess?.[colIndex];
                      const currentLetter = isCurrentRow ? currentGuess[colIndex] : '';

                      return (
                        <div
                          key={colIndex}
                          className={cn(
                            'w-12 h-12 sm:w-14 sm:h-14 border-2 rounded-lg flex items-center justify-center font-bold text-xl transition-all',
                            letterData ? getLetterColor(letterData.state) : 'border-muted-foreground/30',
                            isCurrentRow && currentLetter && 'border-primary scale-105'
                          )}
                        >
                          {letterData?.letter || currentLetter || ''}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Win/Lose Message */}
            {gameOver && (
              <div className={cn(
                'text-center p-4 rounded-lg',
                won ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
              )}>
                <p className={cn('font-bold', won ? 'text-green-500' : 'text-red-500')}>
                  {won ? 'Congratulations!' : `The word was: ${targetWord}`}
                </p>
                {won && (
                  <p className="text-sm text-muted-foreground">
                    Solved in {guesses.length} {guesses.length === 1 ? 'try' : 'tries'}
                  </p>
                )}
              </div>
            )}

            {/* Keyboard */}
            <div className="space-y-1.5 pt-4">
              {keyboard.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-1">
                  {row.map((key) => {
                    const letterState = usedLetters[key];
                    const isSpecial = key === 'ENTER' || key === 'BACKSPACE';

                    return (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => handleKeyPress(key)}
                        disabled={gameOver}
                        className={cn(
                          'h-12 font-semibold',
                          isSpecial ? 'px-2 text-xs' : 'w-8 sm:w-10',
                          letterState === 'correct' && 'bg-green-500 text-white border-green-500 hover:bg-green-600',
                          letterState === 'present' && 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600',
                          letterState === 'absent' && 'bg-muted text-muted-foreground opacity-50'
                        )}
                      >
                        {key === 'BACKSPACE' ? '⌫' : key}
                      </Button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Reset Button */}
            {gameOver && (
              <Button onClick={resetGame} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
