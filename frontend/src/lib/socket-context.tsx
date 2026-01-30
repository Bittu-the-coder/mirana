'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';
import { GameRoom, GameType } from './types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  findMatch: (gameType: GameType) => void;
  cancelMatchmaking: () => void;
  createPrivateRoom: (gameType: GameType) => void;
  joinWithCode: (code: string) => void;
  setReady: (roomId: string) => void;
  submitAnswer: (roomId: string, answer: unknown, correct: boolean, points: number) => void;
  nextRound: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  currentRoom: GameRoom | null;
  matchmakingStatus: 'idle' | 'searching' | 'found' | 'cancelled';
  inviteCode: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [matchmakingStatus, setMatchmakingStatus] = useState<'idle' | 'searching' | 'found' | 'cancelled'>('idle');
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('authenticate', { userId: user.id, username: user.username });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('authenticated', () => {
      console.log('Socket authenticated');
    });

    newSocket.on('matchmaking', (data: { status: string }) => {
      setMatchmakingStatus(data.status as 'idle' | 'searching' | 'found' | 'cancelled');
    });

    newSocket.on('matchFound', (data: { room: GameRoom }) => {
      setCurrentRoom(data.room);
      setMatchmakingStatus('found');
    });

    newSocket.on('roomCreated', (data: { room: GameRoom; inviteCode: string }) => {
      setCurrentRoom(data.room);
      setInviteCode(data.inviteCode);
    });

    newSocket.on('playerJoined', (data: { room: GameRoom }) => {
      setCurrentRoom(data.room);
    });

    newSocket.on('playerReady', (data: { room: GameRoom }) => {
      setCurrentRoom(data.room);
    });

    newSocket.on('gameStart', (data: { room: GameRoom }) => {
      setCurrentRoom(data.room);
    });

    newSocket.on('answerSubmitted', (data: { room: GameRoom }) => {
      setCurrentRoom(data.room);
    });

    newSocket.on('newRound', (data: { room: GameRoom }) => {
      setCurrentRoom(data.room);
    });

    newSocket.on('gameEnd', (data: { room: GameRoom }) => {
      setCurrentRoom(data.room);
    });

    newSocket.on('playerLeft', (data: { room: GameRoom }) => {
      setCurrentRoom(data.room);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const findMatch = useCallback((gameType: GameType) => {
    socket?.emit('findMatch', { gameType });
    setMatchmakingStatus('searching');
  }, [socket]);

  const cancelMatchmaking = useCallback(() => {
    socket?.emit('cancelMatchmaking');
    setMatchmakingStatus('idle');
  }, [socket]);

  const createPrivateRoom = useCallback((gameType: GameType) => {
    socket?.emit('createPrivateRoom', { gameType });
  }, [socket]);

  const joinWithCode = useCallback((code: string) => {
    socket?.emit('joinWithCode', { code });
  }, [socket]);

  const setReady = useCallback((roomId: string) => {
    socket?.emit('ready', { roomId });
  }, [socket]);

  const submitAnswer = useCallback((roomId: string, answer: unknown, correct: boolean, points: number) => {
    socket?.emit('submitAnswer', { roomId, answer, correct, points });
  }, [socket]);

  const nextRound = useCallback((roomId: string) => {
    socket?.emit('nextRound', { roomId });
  }, [socket]);

  const leaveRoom = useCallback((roomId: string) => {
    socket?.emit('leaveRoom', { roomId });
    setCurrentRoom(null);
    setInviteCode(null);
    setMatchmakingStatus('idle');
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        findMatch,
        cancelMatchmaking,
        createPrivateRoom,
        joinWithCode,
        setReady,
        submitAnswer,
        nextRound,
        leaveRoom,
        currentRoom,
        matchmakingStatus,
        inviteCode,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
