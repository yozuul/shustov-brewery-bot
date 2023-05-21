import { resolve } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { UsersModule } from './users/users.module';
import { User } from './users/models/users.model';

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
     ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
     }),
     SequelizeModule.forRoot({
        dialect: 'sqlite',
        storage: resolve('shustov.db.sqlite'),
        models: [User],
        autoLoadModels: true,
        logging: false
     }),
     TelegrafModule.forRoot({
        middlewares: [sessions.middleware()],
        token: process.env.BOT_TOKEN,
     }),
    BotModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
