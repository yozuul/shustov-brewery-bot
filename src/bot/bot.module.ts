import { Module } from '@nestjs/common'

import { BotService } from './bot.service'
import { BotUpdate } from './bot.update'
import { CartKeyboard, NavigationKeyboard, OrdersKeyboard } from './keyboards'
import { DatabaseModule } from '@app/database'
import {
   UserStartedScene, UsersAboutScene, UsersBonusScene, UsersOrdersScene, UsersCartScene, UsersProductsScene
} from './scenes'

@Module({
   imports: [DatabaseModule],
   providers: [
      BotService, BotUpdate,
      UserStartedScene, UsersAboutScene, UsersBonusScene, UsersProductsScene, UsersOrdersScene, UsersCartScene,
      NavigationKeyboard, OrdersKeyboard, CartKeyboard
   ],
   exports: [
      BotService
   ]
})
export class BotModule {}
