'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/lib/socket-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
    Calculator,
    CheckCircle,
    Copy,
    Grid3X3,
    Link as LinkIcon,
    Loader2,
    MessageSquare,
    Swords,
    Trophy,
    UserPlus,
    Users,
    Wifi,
    WifiOff,
    XCircle,
    Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
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
    id: GameType.RIDDLE_ARENA,
    name: 'Riddle Arena',
    description: 'Compete in puzzle solving challenges',
    icon: MessageSquare,
    color: 'bg-purple-500',
    players: '2 Players',
  },
  {
    id: GameType.MEMORY_MATCH_BATTLE,
    name: 'Memory Match Battle',
    description: 'Find matching pairs before your opponent',
    icon: Grid3X3,
    color: 'bg-green-500',
    players: '2 Players',
  },
  {
    id: GameType.WORD_CHAIN,
    name: 'Word Chain',
    description: 'Build words one letter at a time',
    icon: LinkIcon,
    color: 'bg-amber-500',
    players: '2 Players',
  },
];

// Speed Math Game Component
function SpeedMathGame({
  room,
  userId,
  onSubmitAnswer,
  onNextRound,
}: {
  room: any;
  userId: string;
  onSubmitAnswer: (answer: number, correct: boolean, points: number) => void;
  onNextRound: () => void;
}) {
  const [question, setQuestion] = useState({ a: 0, b: 0, op: '+', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [answered, setAnswered] = useState(false);

  const generateQuestion = useCallback(() => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * 20) + 1;
    let b = Math.floor(Math.random() * 12) + 1;

    // Ensure subtraction doesn't go negative
    if (op === '-' && b > a) [a, b] = [b, a];

    let answer: number;
    switch (op) {
      case '+': answer = a + b; break;
      case '-': answer = a - b; break;
      case '*': answer = a * b; break;
      default: answer = a + b;
    }

    return { a, b, op, answer };
  }, []);

  useEffect(() => {
    // Generate new question for each round
    setQuestion(generateQuestion());
    setUserAnswer('');
    setFeedback(null);
    setAnswered(false);
    setTimeLeft(10);
  }, [room.currentRound, generateQuestion]);

  useEffect(() => {
    if (answered || room.status !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // Time's up - wrong answer
          setAnswered(true);
          onSubmitAnswer(0, false, 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [answered, room.status, onSubmitAnswer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answered) return;

    const isCorrect = parseInt(userAnswer) === question.answer;
    const points = isCorrect ? 10 + timeLeft : 0;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setAnswered(true);
    onSubmitAnswer(parseInt(userAnswer), isCorrect, points);
  };

  const mePlayer = room.players.find((p: any) => p.id === userId);
  const opponent = room.players.find((p: any) => p.id !== userId);

  if (room.status === 'finished') {
    const winner = room.players.reduce((w: any, p: any) => !w || p.score > w.score ? p : w, null);
    const isWinner = winner?.id === userId;

    return (
      <div className="text-center space-y-6">
        <Trophy className={`h-20 w-20 mx-auto ${isWinner ? 'text-amber-500' : 'text-gray-400'}`} />
        <h2 className="text-2xl font-bold">{isWinner ? 'You Win!' : 'Game Over'}</h2>
        <div className="grid grid-cols-2 gap-4">
          {room.players.map((p: any) => (
            <div key={p.id} className={`p-4 rounded-lg ${p.id === winner?.id ? 'bg-amber-500/20 border-2 border-amber-500' : 'bg-muted'}`}>
              <p className="font-medium">{p.username}</p>
              <p className="text-2xl font-bold">{p.score}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-primary/10 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">{mePlayer?.username || 'You'}</p>
          <p className="text-2xl font-bold">{mePlayer?.score || 0}</p>
        </div>
        <div className="p-3 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground">{opponent?.username || 'Opponent'}</p>
          <p className="text-2xl font-bold">{opponent?.score || 0}</p>
        </div>
      </div>

      {/* Round indicator */}
      <div className="flex items-center justify-between text-sm">
        <span>Round {room.currentRound} of {room.maxRounds}</span>
        <Badge variant={timeLeft <= 3 ? 'destructive' : 'secondary'}>{timeLeft}s</Badge>
      </div>
      <Progress value={(timeLeft / 10) * 100} className="h-2" />

      {/* Question */}
      <div className={cn(
        "text-center p-8 rounded-xl transition-colors",
        feedback === 'correct' ? 'bg-green-500/20' :
        feedback === 'wrong' ? 'bg-red-500/20' :
        'bg-primary/10'
      )}>
        <p className="text-4xl font-bold">
          {question.a} {question.op} {question.b} = ?
        </p>
      </div>

      {/* Answer input */}
      {!answered ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Your answer"
            className="text-center text-2xl h-14"
            autoFocus
          />
          <Button type="submit" className="w-full" disabled={!userAnswer}>
            Submit
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            {feedback === 'correct' ? (
              <><CheckCircle className="h-6 w-6 text-green-500" /> Correct!</>
            ) : (
              <><XCircle className="h-6 w-6 text-red-500" /> Answer was {question.answer}</>
            )}
          </div>
          {room.currentRound < room.maxRounds && (
            <Button onClick={onNextRound} className="w-full">
              Next Round
            </Button>
          )}
        </div>
      )}
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
    joinWithCode,
    setReady,
    leaveRoom,
    submitAnswer,
    nextRound,
    matchmakingStatus,
    currentRoom,
    inviteCode,
  } = useSocket();
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinDialog, setShowJoinDialog] = useState(false);

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

  const handleSubmitAnswer = (answer: number, correct: boolean, points: number) => {
    if (currentRoom) {
      submitAnswer(currentRoom.id, answer, correct, points);
    }
  };

  const handleNextRound = () => {
    if (currentRoom) {
      nextRound(currentRoom.id);
    }
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

  // Show game in progress
  if (currentRoom && currentRoom.status === 'playing') {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Speed Math Duel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SpeedMathGame
                room={currentRoom}
                userId={user.id}
                onSubmitAnswer={handleSubmitAnswer}
                onNextRound={handleNextRound}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Waiting room or matchmaking
  if (matchmakingStatus === 'searching' || currentRoom) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-lg mx-auto">
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
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Players:</p>
                    {currentRoom.players.map((player: any, index: number) => (
                      <div key={player.id || player.socketId || `player-${index}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {player.username?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="font-medium">{player.username}</span>
                        </div>
                        <Badge variant={player.ready ? 'default' : 'secondary'}>
                          {player.ready ? 'Ready' : 'Waiting'}
                        </Badge>
                      </div>
                    ))}
                    {currentRoom.players.length < 2 && (
                      <div className="p-3 border border-dashed rounded-lg text-center text-muted-foreground">
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

                  {/* Ready Button - Show when 2 players are in the room */}
                  {currentRoom.players.length >= 2 && currentRoom.status === 'waiting' && (
                    <Button
                      className="w-full"
                      onClick={() => setReady(currentRoom.id)}
                      disabled={currentRoom.players.find((p: any) => p.socketId === user?.id)?.ready}
                    >
                      {currentRoom.players.every((p: any) => p.ready) ? 'Starting...' : "I'm Ready!"}
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Swords className="h-8 w-8 text-primary" />
            Multiplayer Arena
          </h1>
          <p className="text-muted-foreground">
            Challenge other players in real-time battles
          </p>
          <div className="flex items-center gap-2 mt-4">
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
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Join with Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Private Room</DialogTitle>
                <DialogDescription>
                  Enter the 6-character invite code to join a friends game
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  className="font-mono text-lg text-center uppercase"
                  maxLength={6}
                />
                <Button
                  className="w-full"
                  onClick={handleJoinWithCode}
                  disabled={joinCode.length !== 6}
                >
                  Join Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Games Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {multiplayerGames.map((game) => {
            const Icon = game.icon;
            return (
              <Card key={game.id} className="group hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center', game.color)}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {game.name}
                      </CardTitle>
                      <CardDescription>{game.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{game.players}</Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedGame(game.id);
                          createPrivateRoom(game.id);
                        }}
                        disabled={!isConnected}
                      >
                        Private
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedGame(game.id);
                          findMatch(game.id);
                        }}
                        disabled={!isConnected}
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Play
                      </Button>
                    </div>
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
