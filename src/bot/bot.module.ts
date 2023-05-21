import { Module } from '@nestjs/common'

import { BotService } from './bot.service'
import { BotUpdate } from './bot.update'
import { NavigationKeyboard } from './keyboards'
import { UsersModule } from 'src/users/users.module'
import {
   UserStartedScene, UsersAboutScene, UsersBonusScene, UsersOrdersScene, UsersCartScene, UsersProductsScene
} from './scenes'

@Module({
   imports: [UsersModule],
   providers: [
      UserStartedScene, UsersAboutScene, UsersBonusScene, UsersProductsScene, UsersOrdersScene, UsersCartScene,
      BotService, BotUpdate, NavigationKeyboard
   ]
})
export class BotModule {}
