import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GamesService } from '../games/games.service';
import { GameType } from '../games/schemas/game-score.schema';
import { UsersService } from '../users/users.service';
import { MultiplayerService } from './multiplayer.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class MultiplayerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private socketUserMap: Map<string, { odId: string; username: string }> = new Map();

  constructor(
    private multiplayerService: MultiplayerService,
    private usersService: UsersService,
    private gamesService: GamesService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const user = this.socketUserMap.get(client.id);
    if (user) {
      await this.usersService.setOnlineStatus(user.odId, false);
      this.socketUserMap.delete(client.id);
    }

    this.multiplayerService.removeFromMatchmaking(client.id);
  }

  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; username: string }
  ) {
    this.socketUserMap.set(client.id, { odId: data.userId, username: data.username });
    await this.usersService.setOnlineStatus(data.userId, true);
    client.emit('authenticated', { success: true });
  }

  @SubscribeMessage('findMatch')
  async handleFindMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameType: GameType }
  ) {
    const user = this.socketUserMap.get(client.id);
    if (!user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    this.multiplayerService.addToMatchmaking(data.gameType, {
      userId: user.odId,
      username: user.username,
      socketId: client.id,
    });

    client.emit('matchmaking', { status: 'searching' });

    const match = this.multiplayerService.findMatch(data.gameType);
    if (match) {
      const room = this.multiplayerService.createRoom(data.gameType, match.player1);
      this.multiplayerService.joinRoom(room.id, match.player2);

      // Auto-ready both players for public matches
      this.multiplayerService.setPlayerReady(room.id, match.player1.socketId);
      this.multiplayerService.setPlayerReady(room.id, match.player2.socketId);

      const updatedRoom = this.multiplayerService.getRoom(room.id)!;

      // Join socket rooms
      const socket1 = this.server.sockets.sockets.get(match.player1.socketId);
      const socket2 = this.server.sockets.sockets.get(match.player2.socketId);
      socket1?.join(room.id);
      socket2?.join(room.id);

      // Auto-start the game for public matches
      const startedRoom = this.multiplayerService.startGame(room.id);

      this.server.to(match.player1.socketId).emit('matchFound', { room: startedRoom });
      this.server.to(match.player2.socketId).emit('matchFound', { room: startedRoom });
      this.server.to(room.id).emit('gameStart', { room: startedRoom });
    }
  }

  @SubscribeMessage('cancelMatchmaking')
  handleCancelMatchmaking(@ConnectedSocket() client: Socket) {
    this.multiplayerService.removeFromMatchmaking(client.id);
    client.emit('matchmaking', { status: 'cancelled' });
  }

  @SubscribeMessage('createPrivateRoom')
  handleCreatePrivateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameType: GameType }
  ) {
    const user = this.socketUserMap.get(client.id);
    if (!user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    const room = this.multiplayerService.createRoom(data.gameType, {
      userId: user.odId,
      username: user.username,
      socketId: client.id,
    }, true);

    client.join(room.id);
    client.emit('roomCreated', { room, inviteCode: room.inviteCode });
  }

  @SubscribeMessage('joinWithCode')
  handleJoinWithCode(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { code: string }
  ) {
    const user = this.socketUserMap.get(client.id);
    if (!user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    const room = this.multiplayerService.findRoomByInviteCode(data.code);
    if (!room) {
      client.emit('error', { message: 'Invalid invite code' });
      return;
    }

    const updatedRoom = this.multiplayerService.joinRoom(room.id, {
      userId: user.odId,
      username: user.username,
      socketId: client.id,
    });

    if (!updatedRoom) {
      client.emit('error', { message: 'Cannot join room' });
      return;
    }

    client.join(room.id);
    this.server.to(room.id).emit('playerJoined', { room: updatedRoom });
  }

  @SubscribeMessage('ready')
  handleReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    const room = this.multiplayerService.setPlayerReady(data.roomId, client.id);
    if (!room) return;

    this.server.to(data.roomId).emit('playerReady', { room });

    if (this.multiplayerService.areAllPlayersReady(data.roomId)) {
      const startedRoom = this.multiplayerService.startGame(data.roomId);
      this.server.to(data.roomId).emit('gameStart', { room: startedRoom });
    }
  }

  @SubscribeMessage('submitAnswer')
  handleSubmitAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; answer: any; correct: boolean; points: number }
  ) {
    if (data.correct) {
      this.multiplayerService.updateScore(data.roomId, client.id, data.points);
    }

    const room = this.multiplayerService.getRoom(data.roomId);
    this.server.to(data.roomId).emit('answerSubmitted', {
      playerId: client.id,
      correct: data.correct,
      room,
    });
  }

  @SubscribeMessage('nextRound')
  handleNextRound(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    const room = this.multiplayerService.nextRound(data.roomId);
    if (!room) return;

    if (room.status === 'finished') {
      const winner = this.multiplayerService.getWinner(data.roomId);
      this.server.to(data.roomId).emit('gameEnd', { room, winner });

      // Save scores for all players
      room.players.forEach(async (player) => {
        await this.gamesService.submitScore(player.id, {
          gameType: room.gameType,
          score: player.score,
          isMultiplayer: true,
          isWinner: winner?.id === player.id,
        });
      });

      setTimeout(() => {
        this.multiplayerService.removeRoom(data.roomId);
      }, 5000);
    } else {
      this.server.to(data.roomId).emit('newRound', { room });
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    const room = this.multiplayerService.leaveRoom(data.roomId, client.id);
    client.leave(data.roomId);

    if (room) {
      this.server.to(data.roomId).emit('playerLeft', { room });
    }
  }
}
