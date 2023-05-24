import { Module } from '@nestjs/common'

import { CheckerService } from './checkers.service'
import { DatabaseModule } from '@app/database'
import { BotModule } from '@app/bot/bot.module'
import { GoogleSheetsModule } from 'src/google-sheets/google-sheets.module'

@Module({
   imports: [
      DatabaseModule, BotModule, GoogleSheetsModule
   ],
   providers: [CheckerService]
})
export class CheckersModule {}
