import { Injectable, UseGuards } from '@nestjs/common';
import { Ctx, Hears, InjectBot, Message, On, Start, Update, Command, Sender } from 'nestjs-telegraf';
import { Telegraf, Markup } from 'telegraf';

import { SessionContext } from '@app/common/interfaces';
import { SceneControlKeyboard } from './keyboards';
import { AuthGuard } from '@app/common/guard';

@Injectable()
@Update()
export class BotUpdate {
   constructor(
      @InjectBot()
      private readonly bot: Telegraf<SessionContext>,
      private readonly sceneControlKeyboard: SceneControlKeyboard
   ) {}
   @Start()
   @UseGuards(AuthGuard)
   async startCommand(ctx: SessionContext) {
      ctx.session.path = 'home'
      await ctx.reply('Добро пожаловать!',
         this.sceneControlKeyboard.startedUsers()
      )
   }
   @On('message')
   async msgeHandler(ctx: SessionContext) {
      ctx.session.path = 'home'
      await ctx.reply('hello from Shustov Bot')
   }
}