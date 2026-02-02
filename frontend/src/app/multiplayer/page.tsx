'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import { GameResult, GameSettings, Question, useSocket } from '@/lib/socket-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Calculator,
  Clock,
  Copy,
  Grid3X3,
  Loader2,
  Settings,
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
import { useEffect, useState } from 'react';
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
];

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

// Speed Math Game Component - Updated to use server questions
function SpeedMathGame({
  questions,
  settings,
  userId,
  onFinish,
}: {
  questions: Question[];
  settings: GameSettings;
  userId: string;
  onFinish: (answers: { questionId: number; answer: number; correct: boolean; timeMs: number }[]) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState<{ questionId: number; answer: number; correct: boolean; timeMs: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(settings.timePerQuestion);
  const [startTime, setStartTime] = useState(Date.now());
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    setStartTime(Date.now());
    setTimeLeft(settings.timePerQuestion);
    setUserAnswer('');
    setFeedback(null);
  }, [currentIndex, settings.timePerQuestion]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = (timeout = false) => {
    const timeMs = Date.now() - startTime;
    const answerNum = timeout ? -1 : parseInt(userAnswer);
    const correct = !timeout && answerNum === currentQuestion.answer;

    setFeedback(correct ? 'correct' : 'wrong');

    const newAnswer = {
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
        setCurrentIndex(i => i + 1);
      }
    }, 800);
  };

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
        "text-center p-8 rounded-xl transition-colors",
        feedback === 'correct' ? 'bg-green-500/20' :
        feedback === 'wrong' ? 'bg-red-500/20' :
        'bg-primary/10'
      )}>
        <p className="text-4xl font-bold">
          {currentQuestion.a} {currentQuestion.op} {currentQuestion.b} = ?
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <Input
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
  const myResult = result.playerResults.find(p => p.id === userId);
  const opponentResult = result.playerResults.find(p => p.id !== userId);

  // Winner is determined by server (considers time tiebreaker)
  const isWinner = result.winner?.id === userId;
  const isDraw = result.winner === null;
  const isTiedScore = myResult?.score === opponentResult?.score;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${seconds}.${tenths}s`;
  };

  return (
    <div className="text-center space-y-6">
      <div className={cn(
        "py-6 rounded-xl",
        isWinner ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20" :
        isDraw ? "bg-blue-500/20" :
        "bg-muted"
      )}>
        <Trophy className={cn(
          "h-16 w-16 mx-auto mb-3",
          isWinner ? "text-amber-500" : isDraw ? "text-blue-500" : "text-gray-400"
        )} />
        <h2 className="text-2xl font-bold">
          {isDraw ? "It's a Draw!" : isWinner ? '🎉 You Win!' : 'Game Over'}
        </h2>
        {isTiedScore && !isDraw && (
          <p className="text-sm text-muted-foreground mt-1">
            {isWinner ? "You were faster!" : "Opponent was faster!"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={cn(
          "p-4 rounded-lg",
          isWinner ? "bg-green-500/20 border-2 border-green-500" :
          isDraw ? "bg-blue-500/10 border-2 border-blue-500" : "bg-muted"
        )}>
          <p className="text-sm text-muted-foreground mb-1">You</p>
          <p className="text-3xl font-bold">{myResult?.score || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {myResult?.correctAnswers || 0} correct
          </p>
          <p className="text-xs text-muted-foreground">
            ⏱ {formatTime(myResult?.totalTime || 0)}
          </p>
        </div>
        <div className={cn(
          "p-4 rounded-lg",
          !isWinner && !isDraw ? "bg-amber-500/20 border-2 border-amber-500" :
          isDraw ? "bg-blue-500/10 border-2 border-blue-500" : "bg-muted"
        )}>
          <p className="text-sm text-muted-foreground mb-1">{opponentResult?.username || 'Opponent'}</p>
          <p className="text-3xl font-bold">{opponentResult?.score || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {opponentResult?.correctAnswers || 0} correct
          </p>
          <p className="text-xs text-muted-foreground">
            ⏱ {formatTime(opponentResult?.totalTime || 0)}
          </p>
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
function WaitingForOpponent({ room, userId }: { room: any; userId: string }) {
  const opponent = room.players.find((p: any) => p.id !== userId);
  const meFinished = room.players.find((p: any) => p.id === userId)?.finished;

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

  useEffect(() => {
    if (currentRoom?.settings) {
      setLocalSettings(currentRoom.settings as GameSettings);
    }
  }, [currentRoom?.settings]);

  useEffect(() => {
    if (gameResult) {
      setHasFinished(false);
    }
  }, [gameResult]);

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
    const updated = { ...localSettings, ...newSettings };
    setLocalSettings(updated);
    if (currentRoom && inviteCode) {
      updateSettings(currentRoom.id, newSettings);
    }
  };

  const handleCreatePrivateRoom = (gameType: GameType) => {
    createPrivateRoom(gameType, localSettings);
    setSelectedGame(gameType);
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
                userId={user.id}
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
                <WaitingForOpponent room={currentRoom} userId={user.id} />
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
                Speed Math Duel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SpeedMathGame
                questions={gameQuestions}
                settings={gameSettings}
                userId={user.id}
                onFinish={handleFinishGame}
              />
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
                      settings={localSettings}
                      onSettingsChange={handleSettingsChange}
                      disabled={currentRoom.players.length >= 2}
                    />
                  )}

                  {/* Player list */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Players:</p>
                    {currentRoom.players.map((player: any, index: number) => {
                      const isMe = player.id === user?.id;
                      return (
                        <div
                          key={player.id || player.socketId || `player-${index}`}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-lg transition-all",
                            isMe
                              ? "bg-primary/20 border-2 border-primary/50"
                              : "bg-muted",
                            player.ready && "ring-2 ring-green-500/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold",
                              isMe ? "bg-primary text-primary-foreground" : "bg-secondary"
                            )}>
                              {player.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <span className="font-medium flex items-center gap-2">
                                {player.username}
                                {isMe && <Badge variant="outline" className="text-xs">You</Badge>}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={player.ready ? 'default' : 'secondary'}
                            className={player.ready ? 'bg-green-500' : ''}
                          >
                            {player.ready ? '✓ Ready' : 'Waiting'}
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
                      disabled={currentRoom.players.find((p: any) => p.id === user?.id)?.ready}
                    >
                      {currentRoom.players.every((p: any) => p.ready) ? (
                        <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Starting Game...</>
                      ) : currentRoom.players.find((p: any) => p.id === user?.id)?.ready ? (
                        '✓ Ready - Waiting for opponent'
                      ) : (
                        <>🎮 I'm Ready!</>
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
