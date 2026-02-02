'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';
import { GameRoom, GameType } from './types';

export interface GameSettings {
  questionCount: number;
  timePerQuestion: number;
}

export interface Question {
  id: number;
  a: number;
  b: number;
  op: string;
  answer: number;
}

export interface PlayerResult {
  id: string;
  username: string;
  score: number;
  correctAnswers: number;
  totalTime: number;
  isWinner: boolean;
}

export interface GameResult {
  room: GameRoom;
  winner: { id: string; username: string; score: number } | null;
  playerResults: PlayerResult[];
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  findMatch: (gameType: GameType) => void;
  cancelMatchmaking: () => void;
  createPrivateRoom: (gameType: GameType, settings?: Partial<GameSettings>) => void;
  updateSettings: (roomId: string, settings: Partial<GameSettings>) => void;
  joinWithCode: (code: string) => void;
  setReady: (roomId: string) => void;
  submitAnswer: (roomId: string, answer: unknown, correct: boolean, points: number) => void;
  finishGame: (roomId: string, answers: { questionId: number; answer: number; correct: boolean; timeMs: number }[]) => void;
  leaveRoom: (roomId: string) => void;
  currentRoom: GameRoom | null;
  matchmakingStatus: 'idle' | 'searching' | 'found' | 'cancelled';
  inviteCode: string | null;
  gameQuestions: Question[];
  gameSettings: GameSettings | null;
  gameResult: GameResult | null;
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
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

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
      // Use _id as fallback since MongoDB returns _id but types expect id
      const userId = user.id || (user as any)._id;
      newSocket.emit('authenticate', { userId, username: user.username });
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

    newSocket.on('matchFound', (data: { room: GameRoom; questions?: Question[] }) => {
      setCurrentRoom(data.room);
      setMatchmakingStatus('found');
      if (data.questions) {
        setGameQuestions(data.questions);
      }
    });

    newSocket.on('roomCreated', (data: { room: GameRoom; inviteCode: string }) => {
      setCurrentRoom(data.room);
      setInviteCode(data.inviteCode);
      setGameResult(null);
    });

    newSocket.on('playerJoined', (data: { room: GameRoom }) => {
      setCurrentRoom(data.room);
    });

    newSocket.on('playerReady', (data: { room: GameRoom }) => {
      setCurrentRoom(data.room);
    });

    newSocket.on('settingsUpdated', (data: { room: GameRoom }) => {
      setCurrentRoom(data.room);
      if (data.room.settings) {
        setGameSettings(data.room.settings as GameSettings);
      }
    });

    newSocket.on('gameStart', (data: { room: GameRoom; questions: Question[]; settings: GameSettings }) => {
      setCurrentRoom(data.room);
      setGameQuestions(data.questions);
      setGameSettings(data.settings);
      setGameResult(null);
    });

    newSocket.on('answerSubmitted', (data: { room: GameRoom }) => {
      setCurrentRoom(data.room);
    });

    newSocket.on('playerFinished', (data: { room: GameRoom }) => {
      setCurrentRoom(data.room);
    });

    newSocket.on('gameEnd', (data: GameResult) => {
      setCurrentRoom(data.room);
      setGameResult(data);
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
    setGameResult(null);
  }, [socket]);

  const cancelMatchmaking = useCallback(() => {
    socket?.emit('cancelMatchmaking');
    setMatchmakingStatus('idle');
  }, [socket]);

  const createPrivateRoom = useCallback((gameType: GameType, settings?: Partial<GameSettings>) => {
    socket?.emit('createPrivateRoom', { gameType, settings });
    setGameResult(null);
  }, [socket]);

  const updateSettings = useCallback((roomId: string, settings: Partial<GameSettings>) => {
    socket?.emit('updateSettings', { roomId, settings });
  }, [socket]);

  const joinWithCode = useCallback((code: string) => {
    socket?.emit('joinWithCode', { code });
    setGameResult(null);
  }, [socket]);

  const setReady = useCallback((roomId: string) => {
    socket?.emit('ready', { roomId });
  }, [socket]);

  const submitAnswer = useCallback((roomId: string, answer: unknown, correct: boolean, points: number) => {
    socket?.emit('submitAnswer', { roomId, answer, correct, points });
  }, [socket]);

  const finishGame = useCallback((roomId: string, answers: { questionId: number; answer: number; correct: boolean; timeMs: number }[]) => {
    socket?.emit('finishGame', { roomId, answers });
  }, [socket]);

  const leaveRoom = useCallback((roomId: string) => {
    socket?.emit('leaveRoom', { roomId });
    setCurrentRoom(null);
    setInviteCode(null);
    setMatchmakingStatus('idle');
    setGameQuestions([]);
    setGameSettings(null);
    setGameResult(null);
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        findMatch,
        cancelMatchmaking,
        createPrivateRoom,
        updateSettings,
        joinWithCode,
        setReady,
        submitAnswer,
        finishGame,
        leaveRoom,
        currentRoom,
        matchmakingStatus,
        inviteCode,
        gameQuestions,
        gameSettings,
        gameResult,
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
