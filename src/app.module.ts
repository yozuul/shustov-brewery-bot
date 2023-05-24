import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TelegrafModule } from 'nestjs-telegraf'
import * as LocalSession from 'telegraf-session-local'
import { ScheduleModule } from '@nestjs/schedule'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BotModule } from './bot/bot.module'
import { DatabaseModule } from '@app/database'
import { GoogleSheetsModule } from './google-sheets/google-sheets.module'
import { CheckersModule } from './checkers/checkers.module'
import { SbisModule } from './sbis/sbis.module';

const sessions = new LocalSession({ database: 'session_db.json' })

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
		}),
		TelegrafModule.forRoot({
			middlewares: [sessions.middleware()],
			token: process.env.BOT_TOKEN,
		}),
		ScheduleModule.forRoot(),
		BotModule,
		DatabaseModule,
		GoogleSheetsModule,
		CheckersModule,
		SbisModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
