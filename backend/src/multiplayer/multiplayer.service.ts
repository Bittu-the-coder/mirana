import { Injectable } from '@nestjs/common';
import { GameType } from '../games/schemas/game-score.schema';

export interface GameRoom {
  id: string;
  gameType: GameType;
  players: { id: string; username: string; socketId: string; score: number; ready: boolean }[];
  status: 'waiting' | 'playing' | 'finished';
  currentRound: number;
  maxRounds: number;
  createdAt: Date;
  inviteCode?: string;
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

  createRoom(gameType: GameType, player: { userId: string; username: string; socketId: string }, isPrivate: boolean = false): GameRoom {
    const roomId = this.generateRoomId();
    const room: GameRoom = {
      id: roomId,
      gameType,
      players: [{ id: player.userId, username: player.username, socketId: player.socketId, score: 0, ready: false }],
      status: 'waiting',
      currentRound: 0,
      maxRounds: 5,
      createdAt: new Date(),
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

    room.players.push({ id: player.userId, username: player.username, socketId: player.socketId, score: 0, ready: false });
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

  getWinner(roomId: string): { id: string; username: string; score: number } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return room.players.reduce((winner, player) =>
      player.score > (winner?.score || 0) ? player : winner
    , room.players[0]);
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
}
