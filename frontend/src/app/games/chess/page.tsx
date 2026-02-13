'use client';

import { GameGuideDialog } from '@/components/game-guide-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Castle, CheckCircle2, RefreshCcw, Trophy, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type ChessSide = 'w' | 'b';

type ChessPuzzle = {
  id: number;
  title: string;
  fen: string;
  sideToMove: ChessSide;
  options: string[];
  answer: string;
  explanation: string;
  points: number;
};

const CHESS_PUZZLES: ChessPuzzle[] = [
  {
    id: 1,
    title: 'Fork The Queen',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/3nP3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1',
    sideToMove: 'w',
    options: ['Nxd4', 'Nxe5', 'Bb5', 'Bc4'],
    answer: 'Nxe5',
    explanation: 'The knight jump wins material by attacking central pieces with tempo.',
    points: 80,
  },
  {
    id: 2,
    title: 'Mate Threat',
    fen: 'r1bq1rk1/ppp2ppp/2n2n2/3pp3/3PP3/2P1BN2/PP3PPP/RN1Q1RK1 w - - 0 1',
    sideToMove: 'w',
    options: ['dxe5', 'Nxe5', 'Qa4', 'Re1'],
    answer: 'dxe5',
    explanation: 'Open the center while black king is less coordinated.',
    points: 95,
  },
  {
    id: 3,
    title: 'Deflection',
    fen: '2rq1rk1/pp2bppp/2n1pn2/3p4/3P4/2P1PN2/PPQ2PPP/2KR1B1R w - - 0 1',
    sideToMove: 'w',
    options: ['Kb1', 'Bd3', 'c4', 'h4'],
    answer: 'c4',
    explanation: 'Push c-pawn to deflect and gain initiative on d5.',
    points: 110,
  },
  {
    id: 4,
    title: 'Open The File',
    fen: 'r2q1rk1/pp2bppp/2n1pn2/3p4/3P4/2P1PN2/PPQ1BPPP/R3R1K1 w - - 0 1',
    sideToMove: 'w',
    options: ['Bd3', 'c4', 'Qb3', 'a3'],
    answer: 'c4',
    explanation: 'The pawn break opens lines toward black king and weakens d5.',
    points: 120,
  },
  {
    id: 5,
    title: 'King Attack',
    fen: 'r1b2rk1/pp1n1ppp/2p1pn2/q2p4/3P4/2N1PN2/PPQ1BPPP/R1B2RK1 w - - 0 1',
    sideToMove: 'w',
    options: ['Bd2', 'e4', 'b4', 'Ne5'],
    answer: 'e4',
    explanation: 'Break in the center before black finishes regrouping.',
    points: 140,
  },
  {
    id: 6,
    title: 'Final Puzzle',
    fen: '2r2rk1/pp2qppp/2n1pn2/3p4/3P4/2P1PN2/PPQ1BPPP/2R2RK1 w - - 0 1',
    sideToMove: 'w',
    options: ['Qa4', 'Bd3', 'Qb3', 'c4'],
    answer: 'c4',
    explanation: 'The thematic break appears again. Consistency wins positions.',
    points: 160,
  },
];

const PIECE_LABELS: Record<string, string> = {
  K: 'K',
  Q: 'Q',
  R: 'R',
  B: 'B',
  N: 'N',
  P: 'P',
  k: 'K',
  q: 'Q',
  r: 'R',
  b: 'B',
  n: 'N',
  p: 'P',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

function parseFenBoard(fen: string): string[][] {
  const boardPart = fen.split(' ')[0];
  const rows = boardPart.split('/');

  return rows.map((row) => {
    const parsed: string[] = [];
    for (const char of row) {
      const count = Number.parseInt(char, 10);
      if (Number.isFinite(count)) {
        for (let i = 0; i < count; i += 1) {
          parsed.push('');
        }
      } else {
        parsed.push(char);
      }
    }
    return parsed;
  });
}

function scoreForPuzzle(base: number, streak: number): number {
  const streakBonus = Math.min(60, Math.max(0, streak - 1) * 10);
  return base + streakBonus;
}

export default function ChessPage() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMove, setSelectedMove] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);

  const userIdentity = user as ({ id?: string; _id?: string } | null);
  const userId = String(userIdentity?.id ?? userIdentity?._id ?? 'guest');
  const storageKey = useMemo(() => `mirana_level_chess_${userId}`, [userId]);
  const puzzle = CHESS_PUZZLES[currentIndex];
  const board = useMemo(() => parseFenBoard(puzzle.fen), [puzzle.fen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const localLevel = Number.parseInt(localStorage.getItem(storageKey) || '1', 10);
    const safeLocalLevel = Number.isFinite(localLevel) && localLevel > 0 ? localLevel : 1;
    const serverLevel = (user?.progress?.[GameType.CHESS] || 0) + 1;
    const resumeLevel = Math.min(Math.max(safeLocalLevel, serverLevel), CHESS_PUZZLES.length);
    setCurrentIndex(resumeLevel - 1);

    if (user) {
      api.getBestScore(GameType.CHESS)
        .then(({ bestScore: fetchedBestScore }) => setBestScore(fetchedBestScore))
        .catch(console.error);
    }
  }, [storageKey, user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey, String(currentIndex + 1));
  }, [currentIndex, storageKey]);

  const submitRunScore = async (finalScore: number, level: number) => {
    if (!user || finalScore <= 0) return;
    try {
      await api.submitScore({
        gameType: GameType.CHESS,
        score: finalScore,
        level,
      });
      setBestScore((prev) => (prev === null ? finalScore : Math.max(prev, finalScore)));
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckMove = async () => {
    if (!selectedMove || completed) return;

    if (selectedMove === puzzle.answer) {
      const puzzlePoints = scoreForPuzzle(puzzle.points, streak + 1);
      const nextScore = score + puzzlePoints;

      setFeedback('correct');
      setStreak((value) => value + 1);
      setScore(nextScore);

      toast.success(`Correct! +${puzzlePoints} points`);

      if (currentIndex >= CHESS_PUZZLES.length - 1) {
        setCompleted(true);
        await submitRunScore(nextScore, CHESS_PUZZLES.length);
        toast.success(`Tactics complete. Final score: ${nextScore}`);
        return;
      }

      window.setTimeout(() => {
        setCurrentIndex((value) => value + 1);
        setSelectedMove('');
        setFeedback('idle');
      }, 500);
      return;
    }

    setFeedback('wrong');
    setStreak(0);
    setScore((value) => Math.max(0, value - 20));
    toast.error('Not the best move. Try again.');
  };

  const restart = () => {
    setCurrentIndex(0);
    setSelectedMove('');
    setFeedback('idle');
    setScore(0);
    setStreak(0);
    setCompleted(false);
  };

  return (
    <div className="min-h-screen px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="border-primary/20">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <Castle className="h-6 w-6 text-primary" />
                Chess Tactics
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Puzzle {currentIndex + 1}/{CHESS_PUZZLES.length}
                </Badge>
                {bestScore !== null && (
                  <Badge variant="outline">
                    <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                    {bestScore}
                  </Badge>
                )}
                <GameGuideDialog
                  title="Chess Tactics"
                  description="Choose the strongest move from each position."
                  rules={[
                    'One puzzle at a time, with multiple move options.',
                    'Correct moves increase score and streak bonus.',
                    'Wrong answers apply a score penalty.',
                    'Complete all puzzles to submit your run score.',
                  ]}
                  scoring={[
                    'Each puzzle has base points.',
                    'Consecutive correct moves add streak bonus.',
                    'Wrong move: -20 points.',
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              <div className="rounded-lg bg-muted p-2 sm:p-3">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-xl sm:text-2xl font-bold">{score}</p>
              </div>
              <div className="rounded-lg bg-muted p-2 sm:p-3">
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="text-xl sm:text-2xl font-bold">{streak}</p>
              </div>
              <div className="rounded-lg bg-muted p-2 sm:p-3">
                <p className="text-xs text-muted-foreground">Turn</p>
                <p className="text-xl sm:text-2xl font-bold">{puzzle.sideToMove === 'w' ? 'White' : 'Black'}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <h2 className="font-semibold text-lg">{puzzle.title}</h2>
              <p className="text-sm text-muted-foreground">{puzzle.explanation}</p>
            </div>

            <div className="rounded-xl border overflow-hidden">
              <div className="grid grid-cols-[18px_repeat(8,minmax(0,1fr))] sm:grid-cols-[24px_repeat(8,minmax(0,1fr))]">
                <div />
                {FILES.map((file) => (
                  <div key={file} className="text-center text-[10px] sm:text-xs text-muted-foreground py-1">
                    {file}
                  </div>
                ))}
                {board.map((row, rowIndex) => (
                  <div key={RANKS[rowIndex]} className="contents">
                    <div className="text-[10px] sm:text-xs text-muted-foreground text-center pt-2">
                      {RANKS[rowIndex]}
                    </div>
                    {row.map((piece, colIndex) => {
                      const isDark = (rowIndex + colIndex) % 2 === 1;
                      const isWhitePiece = piece && piece === piece.toUpperCase();

                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={cn(
                            'aspect-square flex items-center justify-center text-sm sm:text-base font-semibold',
                            isDark ? 'bg-slate-700/80' : 'bg-slate-300/90',
                          )}
                        >
                          {piece ? (
                            <span
                              className={cn(
                                'h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center',
                                isWhitePiece ? 'bg-white text-slate-900' : 'bg-slate-900 text-white',
                              )}
                            >
                              {PIECE_LABELS[piece]}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {puzzle.options.map((move) => (
                <button
                  key={move}
                  type="button"
                  onClick={() => setSelectedMove(move)}
                  className={cn(
                    'rounded-lg border px-3 py-3 text-left text-sm font-semibold transition-colors',
                    selectedMove === move
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/40',
                  )}
                >
                  {move}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleCheckMove} disabled={!selectedMove || completed}>
                Check Move
              </Button>
              <Button variant="outline" onClick={restart}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Restart
              </Button>
              {feedback === 'correct' && (
                <span className="inline-flex items-center gap-1 text-green-500 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Best move
                </span>
              )}
              {feedback === 'wrong' && (
                <span className="inline-flex items-center gap-1 text-red-500 text-sm">
                  <XCircle className="h-4 w-4" />
                  Try another move
                </span>
              )}
              {completed && (
                <span className="text-sm font-medium text-primary">
                  Run complete. Score submitted.
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
