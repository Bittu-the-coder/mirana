import { Injectable } from '@nestjs/common';
import { GameType } from '../games/schemas/game-score.schema';
import { memoryMatchConfigs, riddleArenaLevels } from '../games/seed-levels';

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

  private shuffle<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

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
  generateQuestions(roomId: string): any[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    if (room.gameType === GameType.SPEED_MATH_DUEL) {
      const questionCount = Math.max(1, room.settings.questionCount);
      const questions: Question[] = [];

      for (let i = 0; i < questionCount; i++) {
        const progress = i / Math.max(1, questionCount - 1);
        const tier = progress < 0.3 ? 0 : progress < 0.6 ? 1 : progress < 0.85 ? 2 : 3;
        const opsByTier = [
          ['+', '-'],
          ['+', '-', '*'],
          ['+', '-', '*'],
          ['+', '-', '*', '/'],
        ] as const;
        const op = opsByTier[tier][Math.floor(Math.random() * opsByTier[tier].length)];

        const maxAByTier = [20, 40, 80, 120];
        const maxBByTier = [15, 20, 25, 30];
        let a = Math.floor(Math.random() * maxAByTier[tier]) + 1;
        let b = Math.floor(Math.random() * maxBByTier[tier]) + 1;
        let answer = 0;

        if (op === '+') {
          answer = a + b;
        } else if (op === '-') {
          if (b > a) [a, b] = [b, a];
          answer = a - b;
        } else if (op === '*') {
          const minFactor = tier >= 2 ? 4 : 2;
          const maxFactor = tier >= 2 ? 16 : 12;
          a = Math.floor(Math.random() * (maxFactor - minFactor + 1)) + minFactor;
          b = Math.floor(Math.random() * (maxFactor - minFactor + 1)) + minFactor;
          answer = a * b;
        } else {
          // Division with guaranteed integer answers
          b = Math.floor(Math.random() * 10) + 2;
          answer = Math.floor(Math.random() * (tier >= 3 ? 16 : 10)) + 2;
          a = answer * b;
        }

        questions.push({ id: i, a, b, op, answer });
      }
      room.questions = questions;
      return questions;
    } else if (room.gameType === GameType.RIDDLE_ARENA) {
        const shuffled = this.shuffle(riddleArenaLevels);
        const selected = shuffled.slice(0, room.settings.questionCount);
        room.questions = selected as any;
        return selected;
    } else if (room.gameType === GameType.MEMORY_MATCH_BATTLE) {
        const targetPairs = room.settings.questionCount >= 15 ? 12 : room.settings.questionCount >= 10 ? 8 : 6;
        const allIcons = Array.from(new Set(memoryMatchConfigs.flatMap(config => config.icons)));
        const selectedIcons = this.shuffle(allIcons).slice(0, targetPairs);
        const cards = this.shuffle([...selectedIcons, ...selectedIcons])
            .map((icon, idx) => ({ id: idx, icon, matched: false }));

        room.questions = cards as any;
        return cards;
    }

    return [];
  }

  // Mark player as finished and record their answers
  finishPlayerGame(roomId: string, socketId: string, answers: PlayerAnswer[]): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find(p => p.socketId === socketId);
    if (player) {
      player.finished = true;
      player.answers = answers;
      const correctAnswers = answers.filter(a => a.correct).length;

      if (room.gameType === GameType.MEMORY_MATCH_BATTLE) {
        if (answers.length === 0) {
          player.score = 0;
          return room;
        }

        const wrongAnswers = Math.max(0, answers.length - correctAnswers);
        const totalTimeMs = answers.reduce((sum, answer) => sum + answer.timeMs, 0);
        const timeBonus = Math.max(0, 120 - Math.floor(totalTimeMs / 1000));
        player.score = Math.max(0, correctAnswers * 20 - wrongAnswers * 5 + timeBonus);
      } else {
        player.score = correctAnswers * 10;
      }
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
