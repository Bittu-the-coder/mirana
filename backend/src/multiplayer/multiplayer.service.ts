import { Injectable } from '@nestjs/common';
import { GameType } from '../games/schemas/game-score.schema';

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

export interface PlayerAnswer {
  questionId: number;
  answer: number;
  correct: boolean;
  timeMs: number;
}

export interface GameRoom {
  id: string;
  gameType: GameType;
  players: { id: string; username: string; socketId: string; score: number; ready: boolean; finished: boolean; answers: PlayerAnswer[] }[];
  status: 'waiting' | 'playing' | 'finished';
  currentRound: number;
  maxRounds: number;
  createdAt: Date;
  inviteCode?: string;
  settings: GameSettings;
  questions: Question[];
}

@Injectable()
export class MultiplayerService {
  private rooms: Map<string, GameRoom> = new Map();
  private waitingPlayers: Map<GameType, { userId: string; username: string; socketId: string }[]> = new Map();
  private inviteCodes: Map<string, string> = new Map(); // inviteCode -> roomId

  generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateInviteCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  createRoom(
    gameType: GameType,
    player: { userId: string; username: string; socketId: string },
    isPrivate: boolean = false,
    settings: GameSettings = { questionCount: 5, timePerQuestion: 15 }
  ): GameRoom {
    const roomId = this.generateRoomId();
    const room: GameRoom = {
      id: roomId,
      gameType,
      players: [{
        id: player.userId,
        username: player.username,
        socketId: player.socketId,
        score: 0,
        ready: false,
        finished: false,
        answers: []
      }],
      status: 'waiting',
      currentRound: 0,
      maxRounds: settings.questionCount,
      createdAt: new Date(),
      settings,
      questions: [],
    };

    if (isPrivate) {
      room.inviteCode = this.generateInviteCode();
      this.inviteCodes.set(room.inviteCode, roomId);
    }

    this.rooms.set(roomId, room);
    return room;
  }

  findRoomByInviteCode(code: string): GameRoom | undefined {
    const roomId = this.inviteCodes.get(code.toUpperCase());
    if (roomId) {
      return this.rooms.get(roomId);
    }
    return undefined;
  }

  joinRoom(roomId: string, player: { userId: string; username: string; socketId: string }): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'waiting' || room.players.length >= 2) {
      return null;
    }

    room.players.push({
      id: player.userId,
      username: player.username,
      socketId: player.socketId,
      score: 0,
      ready: false,
      finished: false,
      answers: []
    });
    return room;
  }

  setPlayerReady(roomId: string, socketId: string): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find(p => p.socketId === socketId);
    if (player) player.ready = true;

    return room;
  }

  areAllPlayersReady(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length < 2) return false;
    return room.players.every(p => p.ready);
  }

  startGame(roomId: string): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.status = 'playing';
    room.currentRound = 1;
    return room;
  }

  updateScore(roomId: string, socketId: string, points: number): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find(p => p.socketId === socketId);
    if (player) player.score += points;

    return room;
  }

  nextRound(roomId: string): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.currentRound++;
    if (room.currentRound > room.maxRounds) {
      room.status = 'finished';
    }

    return room;
  }

  getWinner(roomId: string): { id: string; username: string; score: number; totalTime?: number } | null {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length < 2) return null;

    // Calculate total time for each player
    const playersWithTime = room.players.map(p => ({
      ...p,
      totalTime: p.answers.reduce((sum, a) => sum + a.timeMs, 0)
    }));

    // Sort by score (descending), then by time (ascending - faster wins)
    playersWithTime.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Higher score wins
      }
      return a.totalTime - b.totalTime; // Faster time wins on tie
    });

    const winner = playersWithTime[0];

    // Check for exact tie (same score AND same time - very unlikely)
    if (playersWithTime.length > 1 &&
        playersWithTime[0].score === playersWithTime[1].score &&
        playersWithTime[0].totalTime === playersWithTime[1].totalTime) {
      return null; // True tie
    }

    return {
      id: winner.id,
      username: winner.username,
      score: winner.score,
      totalTime: winner.totalTime
    };
  }

  removeRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room?.inviteCode) {
      this.inviteCodes.delete(room.inviteCode);
    }
    this.rooms.delete(roomId);
  }

  leaveRoom(roomId: string, socketId: string): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.players = room.players.filter(p => p.socketId !== socketId);
    if (room.players.length === 0) {
      this.removeRoom(roomId);
      return null;
    }

    return room;
  }

  // Matchmaking
  addToMatchmaking(gameType: GameType, player: { userId: string; username: string; socketId: string }): void {
    if (!this.waitingPlayers.has(gameType)) {
      this.waitingPlayers.set(gameType, []);
    }
    const queue = this.waitingPlayers.get(gameType)!;
    if (!queue.find(p => p.userId === player.userId)) {
      queue.push(player);
    }
  }

  removeFromMatchmaking(socketId: string): void {
    this.waitingPlayers.forEach((players, gameType) => {
      this.waitingPlayers.set(gameType, players.filter(p => p.socketId !== socketId));
    });
  }

  findMatch(gameType: GameType): { player1: any; player2: any } | null {
    const queue = this.waitingPlayers.get(gameType);
    if (!queue || queue.length < 2) return null;

    const player1 = queue.shift()!;
    const player2 = queue.shift()!;

    return { player1, player2 };
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  // Generate synchronized questions for the room
  generateQuestions(roomId: string): Question[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    const ops = ['+', '-', '*'];
    const questions: Question[] = [];

    for (let i = 0; i < room.settings.questionCount; i++) {
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

      questions.push({ id: i, a, b, op, answer });
    }

    room.questions = questions;
    return questions;
  }

  // Mark player as finished and record their answers
  finishPlayerGame(roomId: string, socketId: string, answers: PlayerAnswer[]): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find(p => p.socketId === socketId);
    if (player) {
      player.finished = true;
      player.answers = answers;
      player.score = answers.filter(a => a.correct).length * 10;
    }

    return room;
  }

  // Check if all players have finished
  areAllPlayersFinished(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length < 2) return false;
    return room.players.every(p => p.finished);
  }

  // Update room settings (before game starts)
  updateRoomSettings(roomId: string, settings: Partial<GameSettings>): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'waiting') return null;

    room.settings = { ...room.settings, ...settings };
    room.maxRounds = room.settings.questionCount;
    return room;
  }
}
