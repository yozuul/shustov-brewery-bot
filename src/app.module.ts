import { resolve } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
     ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
     }),
    //  SequelizeModule.forRoot({
    //     dialect: 'sqlite',
    //     storage: resolve('factory.db'),
    //     models: [],
    //     autoLoadModels: true,
    //     logging: false
    //  }),
     TelegrafModule.forRoot({
        middlewares: [sessions.middleware()],
        token: process.env.BOT_TOKEN,
     }),
    BotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
