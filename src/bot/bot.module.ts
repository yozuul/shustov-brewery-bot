import { Module } from '@nestjs/common'

import { BotService } from './bot.service'
import { BotUpdate } from './bot.update'
import { CartKeyboard, NavigationKeyboard, OrdersKeyboard } from './keyboards'
import { DatabaseModule } from '@app/database'
import { SbisModule } from 'src/sbis/sbis.module'
import {
   UserStartedScene, UsersAboutScene, UsersBonusScene, UsersOrdersScene, UsersCartScene, UsersProductsScene, UsersClosedScene, AdminSettingsScene
} from './scenes'

@Module({
   imports: [
      DatabaseModule, SbisModule
   ],
   providers: [
      BotService, BotUpdate,
      UserStartedScene, UsersAboutScene, UsersBonusScene, UsersProductsScene, UsersOrdersScene, UsersCartScene, UsersClosedScene, AdminSettingsScene,
      NavigationKeyboard, OrdersKeyboard, CartKeyboard
   ],
   exports: [
      BotService
   ]
})
export class BotModule {}
