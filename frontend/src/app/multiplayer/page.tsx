'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/lib/socket-context';
import { GameType } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
    Calculator,
    Copy,
    Grid3X3,
    Link as LinkIcon,
    Loader2,
    MessageSquare,
    Swords,
    UserPlus,
    Users,
    Wifi,
    WifiOff,
    Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

const multiplayerGames = [
  {
    id: GameType.SPEED_MATH_DUEL,
    name: 'Speed Math Duel',
    description: 'Race to solve math problems faster than your opponent',
    icon: Calculator,
    color: 'text-blue-500',
  },
  {
    id: GameType.RIDDLE_ARENA,
    name: 'Riddle Arena',
    description: 'Compete to solve riddles and brain teasers',
    icon: MessageSquare,
    color: 'text-purple-500',
  },
  {
    id: GameType.MEMORY_MATCH_BATTLE,
    name: 'Memory Match Battle',
    description: 'Find matching pairs before your opponent',
    icon: Grid3X3,
    color: 'text-green-500',
  },
  {
    id: GameType.WORD_CHAIN,
    name: 'Word Chain',
    description: 'Build words using the last letter of the previous word',
    icon: LinkIcon,
    color: 'text-amber-500',
  },
];

export default function MultiplayerPage() {
  const { user } = useAuth();
  const {
    isConnected,
    findMatch,
    cancelMatchmaking,
    createPrivateRoom,
    joinWithCode,
    matchmakingStatus,
    currentRoom,
    inviteCode,
  } = useSocket();
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const handleFindMatch = (gameType: GameType) => {
    if (!user) {
      toast.error('Please login to play multiplayer');
      return;
    }
    setSelectedGame(gameType);
    findMatch(gameType);
  };

  const handleCreatePrivate = (gameType: GameType) => {
    if (!user) {
      toast.error('Please login to play multiplayer');
      return;
    }
    createPrivateRoom(gameType);
  };

  const handleJoinWithCode = () => {
    if (!user) {
      toast.error('Please login to play multiplayer');
      return;
    }
    if (joinCode.length !== 6) {
      toast.error('Invalid invite code');
      return;
    }
    joinWithCode(joinCode);
    setShowJoinDialog(false);
  };

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast.success('Invite code copied!');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Swords className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Multiplayer Games</h1>
          <p className="text-muted-foreground mb-8">
            Login to compete with players from around the world in real-time matches.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
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
                    {currentRoom.players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {player.username[0].toUpperCase()}
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
                </>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (matchmakingStatus === 'searching') {
                    cancelMatchmaking();
                  } else if (currentRoom) {
                    // Leave room logic would go here
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

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Multiplayer Games</h1>
            <Badge variant={isConnected ? 'default' : 'secondary'} className="gap-1">
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isConnected ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Challenge players worldwide or invite friends for head-to-head matches.
          </p>
        </div>

        {/* Join with Code */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <UserPlus className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Have an invite code?</p>
                  <p className="text-sm text-muted-foreground">Join a friend&apos;s private room</p>
                </div>
              </div>
              <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Enter Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join Private Room</DialogTitle>
                    <DialogDescription>
                      Enter the 6-character invite code shared by your friend.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="text-center text-2xl font-mono tracking-widest"
                      maxLength={6}
                    />
                    <Button onClick={handleJoinWithCode} className="w-full" disabled={joinCode.length !== 6}>
                      Join Room
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Games Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {multiplayerGames.map((game) => {
            const Icon = game.icon;
            return (
              <Card key={game.id} className="group">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={cn('h-12 w-12 rounded-lg bg-muted flex items-center justify-center', game.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{game.name}</CardTitle>
                      <CardDescription>{game.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleFindMatch(game.id)}
                      disabled={!isConnected}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Quick Match
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCreatePrivate(game.id)}
                      disabled={!isConnected}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Private
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
