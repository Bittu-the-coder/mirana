'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import { GameResult, GameSettings, Question, useSocket } from '@/lib/socket-context';
import { GameRoom, GameType, RoomPlayer } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Calculator,
  Clock,
  Copy,
  Grid3X3,
  Loader2,
  Settings,
  Sparkles,
  Swords,
  Target,
  Trophy,
  UserPlus,
  Users,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const multiplayerGames = [
  {
    id: GameType.SPEED_MATH_DUEL,
    name: 'Speed Math Duel',
    description: 'Race to solve math problems faster than your opponent',
    icon: Calculator,
    color: 'bg-blue-500',
    players: '2 Players',
  },
  {
    id: GameType.MEMORY_MATCH_BATTLE,
    name: 'Memory Match Battle',
    description: 'Find matching pairs before your opponent and beat them',
    icon: Grid3X3,
    color: 'bg-green-500',
    players: '2 Players',
  },
  {
    id: GameType.RIDDLE_ARENA,
    name: 'Riddle Arena',
    description: 'Solve riddles faster than your opponent',
    icon: Sparkles,
    color: 'bg-purple-500',
    players: '2 Players',
  },
];

const normalizeId = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return typeof value === 'string' ? value : String(value);
};

type GameAnswer = {
  questionId: number;
  answer: number;
  correct: boolean;
  timeMs: number;
};

type MemoryCard = {
  id: number;
  icon: string;
  matched?: boolean;
};

type RiddleQuestion = {
  question: string;
  options?: string[];
  answer: number;
};

// Game Settings Component
function GameSettingsPanel({
  settings,
  onSettingsChange,
  disabled,
}: {
  settings: GameSettings;
  onSettingsChange: (settings: Partial<GameSettings>) => void;
  disabled: boolean;
}) {
  return (
    <div className="p-4 bg-muted/50 rounded-lg space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Settings className="h-4 w-4" />
        Game Settings
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-2">
            <Target className="h-3 w-3 inline mr-1" />
            Questions
          </label>
          <div className="flex gap-1">
            {[5, 10, 15].map(count => (
              <Button
                key={count}
                variant={settings.questionCount === count ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onSettingsChange({ questionCount: count })}
                disabled={disabled}
              >
                {count}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-2">
            <Clock className="h-3 w-3 inline mr-1" />
            Time (s)
          </label>
          <div className="flex gap-1">
            {[10, 15, 20].map(time => (
              <Button
                key={time}
                variant={settings.timePerQuestion === time ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onSettingsChange({ timePerQuestion: time })}
                disabled={disabled}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Speed Math Game Component
function SpeedMathGame({
  questions,
  settings,
  onFinish,
}: {
  questions: Question[];
  settings: GameSettings;
  onFinish: (answers: GameAnswer[]) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState<GameAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(settings.timePerQuestion);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const questionStartTimeRef = useRef<number>(performance.now());
  const questionDeadlineRef = useRef<number>(performance.now() + settings.timePerQuestion * 1000);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(focusTimer);
  }, [currentIndex]);

  useEffect(() => {
    const now = performance.now();
    questionStartTimeRef.current = now;
    questionDeadlineRef.current = now + settings.timePerQuestion * 1000;
    setTimeLeft(settings.timePerQuestion);
  }, [currentIndex, settings.timePerQuestion]);

  const handleSubmit = useCallback((timeout = false) => {
    const elapsedMs = performance.now() - questionStartTimeRef.current;
    const timeMs = Math.min(
      settings.timePerQuestion * 1000,
      Math.max(0, Math.round(elapsedMs)),
    );
    const answerNum = timeout ? -1 : parseInt(userAnswer, 10);
    const correct = !timeout && answerNum === currentQuestion.answer;

    setFeedback(correct ? 'correct' : 'wrong');

    const newAnswer: GameAnswer = {
      questionId: currentQuestion.id,
      answer: answerNum,
      correct,
      timeMs,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        onFinish(updatedAnswers);
      } else {
        setCurrentIndex((index) => index + 1);
        setUserAnswer('');
        setFeedback(null);
      }
    }, 800);
  }, [answers, currentIndex, currentQuestion.answer, currentQuestion.id, onFinish, questions.length, settings.timePerQuestion, userAnswer]);

  useEffect(() => {
    if (feedback !== null) return;

    const timer = setInterval(() => {
      const remainingMs = questionDeadlineRef.current - performance.now();
      if (remainingMs <= 0) {
        setTimeLeft(0);
        clearInterval(timer);
        handleSubmit(true);
        return;
      }
      setTimeLeft(Math.ceil(remainingMs / 1000));
    }, 120);
    return () => clearInterval(timer);
  }, [feedback, handleSubmit]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer) return;
    handleSubmit(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <Badge variant={timeLeft <= 3 ? 'destructive' : 'secondary'}>{timeLeft}s</Badge>
      </div>
      <Progress value={(timeLeft / settings.timePerQuestion) * 100} className="h-2" />

      <div className={cn(
        "text-center p-6 sm:p-8 rounded-xl transition-colors",
        feedback === 'correct' ? 'bg-green-500/20' :
        feedback === 'wrong' ? 'bg-red-500/20' :
        'bg-primary/10'
      )}>
        <p className="text-3xl sm:text-4xl font-bold">
          {currentQuestion.a} {currentQuestion.op} {currentQuestion.b} = ?
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <Input
          ref={inputRef}
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Your answer"
          className="text-center text-2xl h-14"
          autoFocus
          disabled={feedback !== null}
        />
        <Button type="submit" className="w-full" disabled={!userAnswer || feedback !== null}>
          Submit
        </Button>
      </form>
    </div>
  );
}

// Memory Match Game Component
function MemoryBattleGame({
  questions,
  onFinish,
}: {
  questions: MemoryCard[];
  onFinish: (answers: GameAnswer[]) => void;
}) {
    const cards = questions;
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matched, setMatched] = useState<number[]>([]);
    const [attempts, setAttempts] = useState<GameAnswer[]>([]);
    const submittedRef = useRef(false);
    const lastAttemptStartedAt = useRef<number>(0);

    useEffect(() => {
        lastAttemptStartedAt.current = performance.now();
    }, []);

    // Effect to check matches
    useEffect(() => {
        if (flipped.length === 2) {
            const [first, second] = flipped;
            const isCorrect = cards[first].icon === cards[second].icon;
            const now = performance.now();

            setAttempts(prev => [
              ...prev,
              {
                questionId: prev.length,
                answer: isCorrect ? 1 : 0,
                correct: isCorrect,
                timeMs: Math.max(0, Math.round(now - lastAttemptStartedAt.current)),
              },
            ]);
            lastAttemptStartedAt.current = now;

            if (isCorrect) {
                setMatched(prev => [...prev, first, second]);
                setFlipped([]);
            } else {
                const timer = setTimeout(() => setFlipped([]), 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [flipped, cards]);

    // Submit all attempts when board is fully matched
    useEffect(() => {
        if (!submittedRef.current && matched.length === cards.length && cards.length > 0) {
             submittedRef.current = true;
             onFinish(attempts);
        }
    }, [attempts, matched.length, cards.length, onFinish]);

    const handleCardClick = (index: number) => {
        if (flipped.length >= 2 || flipped.includes(index) || matched.includes(index)) return;
        setFlipped(prev => [...prev, index]);
    };

    return (
        <div className="grid grid-cols-4 gap-4 p-4">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={cn(
                        "aspect-square flex items-center justify-center text-4xl cursor-pointer rounded-xl transition-all duration-300 transform",
                        flipped.includes(index) || matched.includes(index)
                         ? "bg-primary text-white rotate-0"
                         : "bg-muted text-transparent hover:bg-muted/80 rotate-180"
                    )}
                    onClick={() => handleCardClick(index)}
                >
                    {(flipped.includes(index) || matched.includes(index)) ? card.icon : '?'}
                </div>
            ))}
        </div>
    );
}

// Riddle Game Component
function RiddleGame({
  questions,
  onFinish,
}: {
  questions: RiddleQuestion[];
  onFinish: (answers: GameAnswer[]) => void;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<GameAnswer[]>([]);
    const questionStartTimeRef = useRef(0);

    useEffect(() => {
        questionStartTimeRef.current = performance.now();
    }, [currentIndex, questions]);

    // If questions are not loaded yet or invalid format
    if (!questions || !questions.length) return <div>Loading riddles...</div>;

    const currentRiddle = questions[currentIndex];

    // Check if options exist
    const options = currentRiddle.options || [];

    const handleAnswer = (optionIndex: number) => {
        const timeMs = Math.max(0, Math.round(performance.now() - questionStartTimeRef.current));
        const correct = optionIndex === currentRiddle.answer;

        const newAnswer = {
            questionId: currentIndex,
            answer: optionIndex,
            correct,
            timeMs,
        };

        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);

        if (currentIndex + 1 >= questions.length) {
            onFinish(updatedAnswers);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center p-8 bg-muted/30 rounded-xl">
                 <h3 className="text-xl font-semibold mb-4">Riddle {currentIndex + 1}/{questions.length}</h3>
                 <p className="text-lg mb-8">{currentRiddle.question}</p>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {options.map((option: string, idx: number) => (
                         <Button
                            key={idx}
                            variant="outline"
                            className="h-auto py-4 text-left justify-start whitespace-normal"
                            onClick={() => handleAnswer(idx)}
                         >
                            {option}
                         </Button>
                     ))}
                 </div>
            </div>
        </div>
    );
}

// Results Screen Component
function GameResultScreen({
  result,
  userId,
  onPlayAgain,
  onLeave,
}: {
  result: GameResult;
  userId: string;
  onPlayAgain: () => void;
  onLeave: () => void;
}) {
  const normalizedUserId = normalizeId(userId);
  const myResult = result.playerResults.find((player) => normalizeId(player.id) === normalizedUserId);
  const opponentResult = result.playerResults.find((player) => normalizeId(player.id) !== normalizedUserId);

  const isWinner = normalizeId(result.winner?.id) === normalizedUserId;
  const isDraw = result.winner === null;
  const isTiedScore = myResult?.score === opponentResult?.score;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${seconds}.${tenths}s`;
  };

  return (
    <div className="text-center space-y-6">
      <div
        className={cn(
          'py-6 rounded-xl',
          isWinner
            ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20'
            : isDraw
              ? 'bg-blue-500/20'
              : 'bg-red-500/15',
        )}
      >
        <Trophy
          className={cn(
            'h-16 w-16 mx-auto mb-3',
            isWinner ? 'text-amber-500' : isDraw ? 'text-blue-500' : 'text-red-500',
          )}
        />
        <h2 className="text-2xl font-bold">
          {isDraw ? "It's a Draw!" : isWinner ? 'You Win!' : 'You Lose'}
        </h2>
        {isTiedScore && !isDraw && (
          <p className="text-sm text-muted-foreground mt-1">
            {isWinner ? 'You were faster!' : 'Opponent was faster!'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className={cn(
            'p-4 rounded-lg',
            isWinner
              ? 'bg-green-500/20 border-2 border-green-500'
              : isDraw
                ? 'bg-blue-500/10 border-2 border-blue-500'
                : 'bg-red-500/15 border-2 border-red-500',
          )}
        >
          <p className="text-sm text-muted-foreground mb-1">You</p>
          <p className="text-3xl font-bold">{myResult?.score || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">{myResult?.correctAnswers || 0} correct</p>
          <p className="text-xs text-muted-foreground">Time: {formatTime(myResult?.totalTime || 0)}</p>
        </div>

        <div
          className={cn(
            'p-4 rounded-lg',
            isDraw ? 'bg-blue-500/10 border-2 border-blue-500' : 'bg-muted',
          )}
        >
          <p className="text-sm text-muted-foreground mb-1">{opponentResult?.username || 'Opponent'}</p>
          <p className="text-3xl font-bold">{opponentResult?.score || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">{opponentResult?.correctAnswers || 0} correct</p>
          <p className="text-xs text-muted-foreground">Time: {formatTime(opponentResult?.totalTime || 0)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Button onClick={onPlayAgain} className="w-full">
          Play Again
        </Button>
        <Button variant="outline" onClick={onLeave} className="w-full">
          Back to Games
        </Button>
      </div>
    </div>
  );
}
// Waiting Screen while opponent finishes
function WaitingForOpponent({ room, userId }: { room: GameRoom; userId: string }) {
  const normalizedUserId = normalizeId(userId);
  const opponent = room.players.find((p: RoomPlayer) => normalizeId(p.id) !== normalizedUserId);
  const meFinished = room.players.find((p: RoomPlayer) => normalizeId(p.id) === normalizedUserId)?.finished;

  return (
    <div className="text-center space-y-6 py-8">
      <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {meFinished ? "Waiting for opponent to finish..." : "Opponent finished!"}
        </h3>
        <p className="text-muted-foreground">
          {opponent?.username} is {opponent?.finished ? "done" : "still playing"}
        </p>
      </div>
    </div>
  );
}

export default function MultiplayerPage() {
  const { user } = useAuth();
  const {
    isConnected,
    findMatch,
    cancelMatchmaking,
    createPrivateRoom,
    updateSettings,
    joinWithCode,
    setReady,
    leaveRoom,
    finishGame,
    matchmakingStatus,
    currentRoom,
    inviteCode,
    gameQuestions,
    gameSettings,
    gameResult,
  } = useSocket();
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [localSettings, setLocalSettings] = useState<GameSettings>({ questionCount: 5, timePerQuestion: 15 });
  const [hasFinished, setHasFinished] = useState(false);
  const userIdentity = user as ({ id?: string; _id?: string } | null);
  const userId = normalizeId(userIdentity?.id ?? userIdentity?._id);
  const roomSettings = currentRoom?.settings as GameSettings | undefined;

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast.success('Invite code copied!');
    }
  };

  const handleJoinWithCode = () => {
    if (joinCode.length === 6) {
      joinWithCode(joinCode.toUpperCase());
      setShowJoinDialog(false);
      setJoinCode('');
    }
  };

  const handleSettingsChange = (newSettings: Partial<GameSettings>) => {
    const updated = { ...(roomSettings ?? localSettings), ...newSettings };
    setLocalSettings(updated);
    if (currentRoom && inviteCode) {
      updateSettings(currentRoom.id, newSettings);
    }
  };

  const handleCreatePrivateRoom = (gameType: GameType) => {
    createPrivateRoom(gameType, localSettings);
    setSelectedGame(gameType);
    setHasFinished(false);
  };

  const handleFinishGame = (answers: { questionId: number; answer: number; correct: boolean; timeMs: number }[]) => {
    if (currentRoom) {
      finishGame(currentRoom.id, answers);
      setHasFinished(true);
    }
  };

  const handlePlayAgain = () => {
    if (currentRoom) {
      leaveRoom(currentRoom.id);
    }
    setSelectedGame(null);
    setHasFinished(false);
  };

  const handleLeave = () => {
    if (currentRoom) {
      leaveRoom(currentRoom.id);
    }
    setSelectedGame(null);
    setHasFinished(false);
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Swords className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">Login to challenge other players</p>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show game results
  if (gameResult) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Game Complete!</CardTitle>
            </CardHeader>
            <CardContent>
              <GameResultScreen
                result={gameResult}
                userId={userId}
                onPlayAgain={handlePlayAgain}
                onLeave={handleLeave}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show game in progress
  if (currentRoom && currentRoom.status === 'playing' && gameQuestions.length > 0 && gameSettings) {
    // Player has finished, waiting for opponent
    if (hasFinished) {
      return (
        <div className="min-h-screen px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Speed Math Duel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WaitingForOpponent room={currentRoom} userId={userId} />
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                {currentRoom.gameType.replace(/_/g, ' ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentRoom.gameType === GameType.SPEED_MATH_DUEL ? (
                  <SpeedMathGame
                    questions={gameQuestions}
                    settings={gameSettings}
                    onFinish={handleFinishGame}
                  />
              ) : currentRoom.gameType === GameType.RIDDLE_ARENA ? (
                  <RiddleGame
                    questions={gameQuestions as unknown as RiddleQuestion[]}
                    onFinish={handleFinishGame}
                  />
              ) : currentRoom.gameType === GameType.MEMORY_MATCH_BATTLE ? (
                   <MemoryBattleGame
                    questions={gameQuestions as unknown as MemoryCard[]}
                    onFinish={handleFinishGame}
                  />
              ) : (
                  <div>Unsupported game type</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Waiting room or matchmaking
  if (matchmakingStatus === 'searching' || currentRoom) {
    const isHost = currentRoom && inviteCode;

    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              {matchmakingStatus === 'searching' ? (
                <>
                  <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                  <CardTitle>Finding Opponent...</CardTitle>
                  <CardDescription>
                    Looking for players in {selectedGame?.replace(/_/g, ' ')}
                  </CardDescription>
                </>
              ) : currentRoom ? (
                <>
                  <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle>
                    {currentRoom.status === 'waiting' ? 'Waiting Room' : 'Game in Progress'}
                  </CardTitle>
                  <CardDescription>
                    {currentRoom.gameType.replace(/_/g, ' ').toUpperCase()}
                  </CardDescription>
                </>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
              {currentRoom && (
                <>
                  {/* Game Settings - Only for private rooms and only host can change */}
                  {isHost && currentRoom.status === 'waiting' && (
                    <GameSettingsPanel
                      settings={roomSettings ?? localSettings}
                      onSettingsChange={handleSettingsChange}
                      disabled={currentRoom.players.length >= 2}
                    />
                  )}

                  {/* Player list */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Players:</p>
                    {currentRoom.players.map((player: RoomPlayer, index: number) => {
                      const isMe = normalizeId(player.id) === userId;
                      return (
                        <div
                          key={player.id || player.socketId || `player-${index}`}
                          className={cn(
                            'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg transition-all',
                            isMe ? 'bg-primary/20 border-2 border-primary/50' : 'bg-muted',
                            player.ready && 'ring-2 ring-green-500/50',
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={cn(
                                'h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0',
                                isMe ? 'bg-primary text-primary-foreground' : 'bg-secondary',
                              )}
                            >
                              {player.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <span className="font-medium flex items-center gap-2">
                                <span className="truncate">{player.username}</span>
                                {isMe && <Badge variant="outline" className="text-xs">You</Badge>}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={player.ready ? 'default' : 'secondary'}
                            className={cn('w-fit', player.ready ? 'bg-green-500' : '')}
                          >
                            {player.ready ? 'Ready' : 'Waiting'}
                          </Badge>
                        </div>
                      );
                    })}
                    {currentRoom.players.length < 2 && (
                      <div className="p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground animate-pulse">
                        <Users className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        Waiting for opponent...
                      </div>
                    )}
                  </div>

                  {inviteCode && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">Invite Code</p>
                      <div className="flex gap-2">
                        <Input value={inviteCode} readOnly className="font-mono text-lg text-center" />
                        <Button variant="outline" size="icon" onClick={copyInviteCode}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Share this code with a friend to play together
                      </p>
                    </div>
                  )}

                  {/* Ready Button */}
                  {currentRoom.players.length >= 2 && currentRoom.status === 'waiting' && (
                    <Button
                      className="w-full h-12 text-lg font-semibold"
                      onClick={() => setReady(currentRoom.id)}
                      disabled={currentRoom.players.find((p: RoomPlayer) => normalizeId(p.id) === userId)?.ready}
                    >
                      {currentRoom.players.every((p: RoomPlayer) => p.ready) ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Starting Game...
                        </>
                      ) : currentRoom.players.find((p: RoomPlayer) => normalizeId(p.id) === userId)?.ready ? (
                        'Ready - Waiting for opponent'
                      ) : (
                        <>I&apos;m Ready!</>
                      )}
                    </Button>
                  )}
                </>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (matchmakingStatus === 'searching') {
                    cancelMatchmaking();
                  }
                  if (currentRoom) {
                    leaveRoom(currentRoom.id);
                  }
                  setSelectedGame(null);
                }}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Game selection
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Swords className="h-8 w-8 text-primary" />
              Multiplayer Arena
            </h1>
            <p className="text-muted-foreground mt-1">
              Challenge other players in real-time battles
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="outline" className="text-green-500 border-green-500">
                  <Wifi className="h-3 w-3 mr-1" /> Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-500 border-red-500">
                  <WifiOff className="h-3 w-3 mr-1" /> Disconnected
                </Badge>
              )}
            </div>

            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Private Game</DialogTitle>
                  <DialogDescription>
                    Enter the 6-character invite code from your friend
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="text-center text-2xl font-mono tracking-wider"
                    maxLength={6}
                  />
                  <Button
                    onClick={handleJoinWithCode}
                    className="w-full"
                    disabled={joinCode.length !== 6}
                  >
                    Join Game
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Game list */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {multiplayerGames.map((game) => {
            const Icon = game.icon;
            return (
              <Card key={game.id} className="group hover:border-primary transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={cn('h-12 w-12 rounded-lg bg-muted flex items-center justify-center', game.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary">
                      {game.players}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mt-4 group-hover:text-primary transition-colors">
                    {game.name}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleCreatePrivateRoom(game.id as GameType)}
                      disabled={!isConnected}
                    >
                      Private
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setSelectedGame(game.id as GameType);
                        findMatch(game.id as GameType);
                      }}
                      disabled={!isConnected}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Play
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}



