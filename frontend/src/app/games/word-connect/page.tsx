'use client';

import { GameGuideDialog } from '@/components/game-guide-dialog';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Lightbulb, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type WordConnectLevel = {
  letters: string[];
  words: string[];
  hint: string;
};

const FALLBACK_LEVELS: WordConnectLevel[] = [
  { letters: ['D', 'O', 'G'], words: ['DOG', 'GOD', 'DO', 'GO'], hint: "Man's best friend" },
  { letters: ['C', 'A', 'T', 'S'], words: ['CAST', 'CATS', 'ACTS', 'CAT', 'ACT', 'SAT'], hint: 'Furry pets' },
  { letters: ['W', 'O', 'R', 'D'], words: ['WORD', 'ROW', 'ROD', 'DO', 'OR'], hint: 'What you read' },
  { letters: ['T', 'I', 'M', 'E'], words: ['TIME', 'ITEM', 'TIE', 'MET', 'EMIT'], hint: 'Clock shows this' },
  { letters: ['P', 'L', 'A', 'Y'], words: ['PLAY', 'PAL', 'LAY', 'PAY', 'LAP'], hint: 'What kids do' },
  { letters: ['S', 'T', 'A', 'R'], words: ['STAR', 'RATS', 'ARTS', 'TAR', 'SAT', 'RAT'], hint: 'Twinkle twinkle' },
  { letters: ['H', 'O', 'M', 'E'], words: ['HOME', 'HEM', 'HOE'], hint: 'Where you live' },
  { letters: ['L', 'I', 'G', 'H', 'T'], words: ['LIGHT', 'GILT', 'HILT', 'HIT', 'LIT'], hint: 'Opposite of dark' },
];

const normalizeToken = (value: string): string => value.toUpperCase().replace(/[^A-Z]/g, '');

const canBuildWord = (word: string, letters: string[]): boolean => {
  const pool = new Map<string, number>();
  for (const letter of letters) {
    pool.set(letter, (pool.get(letter) || 0) + 1);
  }

  for (const char of word) {
    const remaining = pool.get(char) || 0;
    if (remaining <= 0) return false;
    pool.set(char, remaining - 1);
  }

  return true;
};

const sanitizeLevel = (raw: unknown): WordConnectLevel | null => {
  const source = raw as { letters?: unknown[]; words?: unknown[]; hint?: unknown };

  const letters: string[] = Array.isArray(source.letters)
    ? source.letters.map((value) => normalizeToken(String(value))).filter((token) => token.length === 1)
    : [];

  const uniqueLetters: string[] = Array.from(new Set<string>(letters));
  if (uniqueLetters.length < 3 || uniqueLetters.length !== letters.length) return null;

  const words: string[] = Array.isArray(source.words)
    ? source.words
        .map((value) => normalizeToken(String(value)))
        .filter((word) => word.length >= 2)
        .filter((word) => canBuildWord(word, uniqueLetters))
    : [];

  const uniqueWords: string[] = Array.from(new Set<string>(words)).sort(
    (a, b) => b.length - a.length || a.localeCompare(b),
  );
  if (uniqueWords.length < 3) return null;

  return {
    letters: uniqueLetters,
    words: uniqueWords,
    hint: typeof source.hint === 'string' && source.hint.trim().length
      ? source.hint.trim()
      : 'Find all valid words from these letters.',
  };
};

export default function WordConnectPage() {
  const { user } = useAuth();
  const [levels, setLevels] = useState<WordConnectLevel[]>(FALLBACK_LEVELS);
  const [levelsLoaded, setLevelsLoaded] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const userIdentity = user as ({ id?: string; _id?: string } | null);
  const userId = String(userIdentity?.id ?? userIdentity?._id ?? 'guest');
  const storageKey = useMemo(() => `mirana_level_word_connect_${userId}`, [userId]);

  useEffect(() => {
    let cancelled = false;

    const loadLevels = async () => {
      try {
        const backendLevels = await api.getGameLevels(GameType.WORD_CONNECT, undefined, 2000);
        const parsed = backendLevels
          .map((level) => sanitizeLevel(level))
          .filter((level): level is WordConnectLevel => Boolean(level));

        if (!cancelled && parsed.length > 0) {
          setLevels(parsed);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLevelsLoaded(true);
        }
      }
    };

    void loadLevels();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (levels.length === 0) return;

    const localLevel = Number.parseInt(localStorage.getItem(storageKey) || '1', 10);
    const safeLocalLevel = Number.isFinite(localLevel) && localLevel > 0 ? localLevel : 1;
    const serverLevel = (user?.progress?.[GameType.WORD_CONNECT] || 0) + 1;
    const resumeLevel = Math.min(Math.max(safeLocalLevel, serverLevel), levels.length);

    setCurrentLevel(resumeLevel - 1);

    if (user) {
      api.getBestScore(GameType.WORD_CONNECT)
        .then(({ bestScore }) => setBestScore(bestScore))
        .catch(console.error);
    }
  }, [levels.length, storageKey, user]);

  useEffect(() => {
    if (levels.length === 0) return;
    localStorage.setItem(storageKey, String(currentLevel + 1));
  }, [currentLevel, levels.length, storageKey]);

  useEffect(() => {
    if (levels.length === 0) return;
    setCurrentLevel((value) => Math.min(value, levels.length - 1));
  }, [levels.length]);

  const level = levels[currentLevel] || FALLBACK_LEVELS[0];
  const letters = level.letters;
  const centerX = 120;
  const centerY = 120;
  const radius = 80;

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
      const existingIndex = selectedLetters.indexOf(index);
      if (existingIndex < selectedLetters.length - 1) {
        const newSelected = selectedLetters.slice(0, existingIndex + 1);
        setSelectedLetters(newSelected);
        setCurrentWord(newSelected.map((letterIndex) => letters[letterIndex]).join(''));
      }
      return;
    }

    setSelectedLetters([...selectedLetters, index]);
    setCurrentWord((prev) => prev + letters[index]);
  };

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    const word = currentWord.toUpperCase();
    if (word.length >= 2 && level.words.includes(word) && !foundWords.includes(word)) {
      setFoundWords([...foundWords, word]);
      const wordScore = word.length * 10;
      setScore((value) => value + wordScore);
      toast.success(`+${wordScore} points!`);

      if (foundWords.length + 1 >= level.words.length) {
        setTimeout(() => {
          const finishedLevel = currentLevel + 1;
          const levelScore = score + wordScore;

          if (user) {
            api.submitScore({
              gameType: GameType.WORD_CONNECT,
              score: levelScore,
              level: finishedLevel,
            }).catch(console.error);
          }

          if (currentLevel < levels.length - 1) {
            toast.success('Level Complete!');
            setCurrentLevel((value) => value + 1);
            setFoundWords([]);
            setShowHint(false);
          } else {
            const finalScore = levelScore + 100;
            toast.success(`All levels complete! Final score: ${finalScore}`);
            if (!bestScore || finalScore > bestScore) {
              setBestScore(finalScore);
            }
          }
        }, 500);
      }
    }

    setSelectedLetters([]);
    setCurrentWord('');
  }, [bestScore, currentLevel, currentWord, foundWords, isDragging, level.words, levels.length, score, user]);

  const resetGame = () => {
    setCurrentLevel(0);
    setFoundWords([]);
    setScore(0);
    setShowHint(false);
    setSelectedLetters([]);
    setCurrentWord('');
  };

  const getLinePath = () => {
    if (selectedLetters.length < 2) return '';
    const points = selectedLetters.map((index) => getLetterPosition(index));
    return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  };

  if (!levelsLoaded) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              Loading levels...
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Level {currentLevel + 1}/{levels.length}
                </Badge>
                {bestScore !== null && (
                  <Badge variant="outline">
                    <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                    {bestScore}
                  </Badge>
                )}
                <GameGuideDialog
                  title="Word Connect"
                  description="Connect letters to form words and complete the level."
                  rules={[
                    'Swipe to connect letters in the circle to form words.',
                    'Find all hidden words to complete the level.',
                    'Words can be formed in any order.',
                    'Find extra words for bonus points!',
                  ]}
                  controls={[
                    'Click/Touch and drag to connect letters.',
                    'Release to submit the word.',
                  ]}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{score}</p>
              <p className="text-sm text-muted-foreground">Score</p>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex flex-wrap gap-2 justify-center min-h-[60px]">
                {level.words.map((word, index) => (
                  <div
                    key={index}
                    className={cn(
                      'px-3 py-2 rounded-lg font-bold text-sm transition-all',
                      foundWords.includes(word) ? 'bg-green-500 text-white' : 'bg-muted-foreground/20 text-transparent',
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

            <div className="h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary tracking-widest">{currentWord || '\u00A0'}</span>
            </div>

            <div
              ref={containerRef}
              className="relative mx-auto touch-none"
              style={{ width: 240, height: 240 }}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchEnd={(event) => {
                event.preventDefault();
                handleDragEnd();
              }}
              onTouchMove={(event) => {
                event.preventDefault();
                if (!isDragging || !containerRef.current) return;

                const touch = event.touches[0];
                const rect = containerRef.current.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;

                letters.forEach((_, index) => {
                  const pos = getLetterPosition(index);
                  const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                  if (dist < 40) {
                    handleLetterEnter(index);
                  }
                });
              }}
            >
              <svg className="absolute inset-0 pointer-events-none" width="240" height="240">
                <path
                  d={getLinePath()}
                  stroke="hsl(var(--primary))"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30" />

              {letters.map((letter, index) => {
                const pos = getLetterPosition(index);
                const isSelected = selectedLetters.includes(index);
                return (
                  <button
                    key={index}
                    data-index={index}
                    className={cn(
                      'absolute w-14 h-14 rounded-full font-bold text-xl transition-all -translate-x-1/2 -translate-y-1/2 touch-none select-none',
                      isSelected ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted hover:bg-muted-foreground/20',
                    )}
                    style={{ left: pos.x, top: pos.y }}
                    onMouseDown={() => handleLetterStart(index)}
                    onMouseEnter={() => handleLetterEnter(index)}
                    onTouchStart={(event) => {
                      event.preventDefault();
                      handleLetterStart(index);
                    }}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            {showHint && (
              <div className="text-center p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm">
                  <strong>Hint:</strong> {level.hint}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowHint(true)} disabled={showHint}>
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
