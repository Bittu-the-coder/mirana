'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Lightbulb, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Level {
  letters: string[];
  words: string[];
  hint: string;
}

const LEVELS: Level[] = [
  { letters: ['D', 'O', 'G'], words: ['DOG', 'GOD', 'DO', 'GO'], hint: 'Man\'s best friend' },
  { letters: ['C', 'A', 'T', 'S'], words: ['CAT', 'CATS', 'SAT', 'ACT', 'ACTS', 'CAST'], hint: 'Furry pets' },
  { letters: ['W', 'O', 'R', 'D'], words: ['WORD', 'ROW', 'ROD', 'OWN', 'WORN', 'DOWN'], hint: 'What you read' },
  { letters: ['T', 'I', 'M', 'E'], words: ['TIME', 'ITEM', 'EMIT', 'MITE', 'TIE', 'MET'], hint: 'Clock shows this' },
  { letters: ['P', 'L', 'A', 'Y'], words: ['PLAY', 'PAL', 'LAY', 'PAY', 'LAP'], hint: 'What kids do' },
  { letters: ['S', 'T', 'A', 'R'], words: ['STAR', 'RATS', 'ARTS', 'TAR', 'SAT', 'RAT'], hint: 'Twinkle twinkle' },
  { letters: ['H', 'O', 'M', 'E'], words: ['HOME', 'HEM', 'HOE', 'MOE'], hint: 'Where you live' },
  { letters: ['L', 'I', 'G', 'H', 'T'], words: ['LIGHT', 'GILT', 'HILT', 'HIT', 'LIT'], hint: 'Opposite of dark' },
];

export default function WordConnectPage() {
  const { user } = useAuth();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const level = LEVELS[currentLevel];
  const letters = level.letters;
  const centerX = 120;
  const centerY = 120;
  const radius = 80;

  useEffect(() => {
    if (user) {
      api.getBestScore(GameType.WORD_CHAIN) // Using WORD_CHAIN as placeholder
        .then(({ bestScore }) => setBestScore(bestScore))
        .catch(console.error);
    }
  }, [user]);

  const getLetterPosition = (index: number) => {
    const angle = (index * (360 / letters.length) - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const handleLetterStart = (index: number) => {
    setIsDragging(true);
    setSelectedLetters([index]);
    setCurrentWord(letters[index]);
  };

  const handleLetterEnter = (index: number) => {
    if (!isDragging) return;
    if (selectedLetters.includes(index)) {
      // If going back, remove letters after this index
      const existingIndex = selectedLetters.indexOf(index);
      if (existingIndex < selectedLetters.length - 1) {
        const newSelected = selectedLetters.slice(0, existingIndex + 1);
        setSelectedLetters(newSelected);
        setCurrentWord(newSelected.map(i => letters[i]).join(''));
      }
      return;
    }
    setSelectedLetters([...selectedLetters, index]);
    setCurrentWord(prev => prev + letters[index]);
  };

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const word = currentWord.toUpperCase();
    if (word.length >= 2 && level.words.includes(word) && !foundWords.includes(word)) {
      setFoundWords([...foundWords, word]);
      const wordScore = word.length * 10;
      setScore(s => s + wordScore);
      toast.success(`+${wordScore} points!`);

      // Check if level complete
      if (foundWords.length + 1 >= level.words.length) {
        setTimeout(() => {
          if (currentLevel < LEVELS.length - 1) {
            toast.success('Level Complete! 🎉');
            setCurrentLevel(l => l + 1);
            setFoundWords([]);
            setShowHint(false);
          } else {
            // Game complete
            const finalScore = score + wordScore + 100;
            toast.success(`All levels complete! Final score: ${finalScore}`);
            if (user) {
              api.submitScore({
                gameType: GameType.WORD_CHAIN,
                score: finalScore,
                level: currentLevel + 1,
              }).then(() => {
                if (!bestScore || finalScore > bestScore) {
                  setBestScore(finalScore);
                }
              }).catch(console.error);
            }
          }
        }, 500);
      }
    }

    setSelectedLetters([]);
    setCurrentWord('');
  }, [isDragging, currentWord, level.words, foundWords, currentLevel, score, user, bestScore]);

  const resetGame = () => {
    setCurrentLevel(0);
    setFoundWords([]);
    setScore(0);
    setShowHint(false);
    setSelectedLetters([]);
    setCurrentWord('');
  };

  // Draw line between selected letters
  const getLinePath = () => {
    if (selectedLetters.length < 2) return '';
    const points = selectedLetters.map(i => getLetterPosition(i));
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Word Connect
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary">Level {currentLevel + 1}</Badge>
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
            {/* Score */}
            <div className="text-center">
              <p className="text-3xl font-bold">{score}</p>
              <p className="text-sm text-muted-foreground">Score</p>
            </div>

            {/* Word Display Grid */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex flex-wrap gap-2 justify-center min-h-[60px]">
                {level.words.map((word, i) => (
                  <div
                    key={i}
                    className={cn(
                      'px-3 py-2 rounded-lg font-bold text-sm transition-all',
                      foundWords.includes(word)
                        ? 'bg-green-500 text-white'
                        : 'bg-muted-foreground/20 text-transparent'
                    )}
                  >
                    {foundWords.includes(word) ? word : word.replace(/./g, '_')}
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">
                {foundWords.length}/{level.words.length} words found
              </p>
            </div>

            {/* Current Input */}
            <div className="h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary tracking-widest">
                {currentWord || '\u00A0'}
              </span>
            </div>

            {/* Letter Circle */}
            <div
              ref={containerRef}
              className="relative mx-auto"
              style={{ width: 240, height: 240 }}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchEnd={handleDragEnd}
            >
              {/* SVG for connection lines */}
              <svg className="absolute inset-0 pointer-events-none" width="240" height="240">
                <path
                  d={getLinePath()}
                  stroke="hsl(var(--primary))"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              {/* Center decoration */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30" />

              {/* Letters */}
              {letters.map((letter, index) => {
                const pos = getLetterPosition(index);
                const isSelected = selectedLetters.includes(index);
                return (
                  <button
                    key={index}
                    className={cn(
                      'absolute w-14 h-14 rounded-full font-bold text-xl transition-all -translate-x-1/2 -translate-y-1/2',
                      isSelected
                        ? 'bg-primary text-primary-foreground scale-110'
                        : 'bg-muted hover:bg-muted-foreground/20'
                    )}
                    style={{ left: pos.x, top: pos.y }}
                    onMouseDown={() => handleLetterStart(index)}
                    onMouseEnter={() => handleLetterEnter(index)}
                    onTouchStart={() => handleLetterStart(index)}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            {/* Hint */}
            {showHint && (
              <div className="text-center p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm"><strong>Hint:</strong> {level.hint}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowHint(true)}
                disabled={showHint}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Hint
              </Button>
              <Button onClick={resetGame} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
