import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { SceneControlKeyboard } from './keyboards';
import { UsersModule } from 'src/users/users.module';

@Module({
   imports: [UsersModule],
   providers: [BotService, BotUpdate, SceneControlKeyboard]
})
export class BotModule {}
