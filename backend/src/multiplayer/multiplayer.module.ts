import { Module } from '@nestjs/common';
import { GamesModule } from '../games/games.module';
import { UsersModule } from '../users/users.module';
import { MultiplayerGateway } from './multiplayer.gateway';
import { MultiplayerService } from './multiplayer.service';

@Module({
  imports: [UsersModule, GamesModule],
  providers: [MultiplayerGateway, MultiplayerService],
  exports: [MultiplayerService],
})
export class MultiplayerModule {}
