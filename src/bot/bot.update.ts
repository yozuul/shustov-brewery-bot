import { Injectable, UseGuards } from '@nestjs/common'
import { Ctx, Hears, InjectBot, Message, On, Start, Update, Command, Sender } from 'nestjs-telegraf'
import { Telegraf, Markup } from 'telegraf'

import { SceneContext, SessionContext } from '@app/common/interfaces'
import { NavigationKeyboard } from '@bot/keyboards'
import { AuthGuard } from '@app/common/guard'
import { ADMINS_SCENE, USERS_BUTTON, USERS_SCENE } from '@app/common/constants'

@Injectable()
@Update()
export class BotUpdate {
   constructor(
      @InjectBot()
      private readonly bot: Telegraf<SessionContext>,
      private readonly navigationKeyboard: NavigationKeyboard
   ) {}

   @Start()
   @UseGuards(AuthGuard)
   async startCommand(ctx: SceneContext) {
      await ctx.reply(
         'Добро пожаловать в наш Телеграм бот!\nТут можно узнать о нашей пивоварне, познакомиться с производимыми сортами, а также сделать предварительный заказ на нашу продукцию к нужному времени.',
         this.navigationKeyboard.startedUsers()
      )
      ctx.scene.enter(USERS_SCENE.STARTED)
   }


   @On('message')
   async msgeHandler(ctx: SessionContext) {
      console.log('No Scene Msg')
      // ctx.session.path = 'home'
      // const bot = await this.bot.telegram.getMe();
      // console.log('Msg at home path >', ctx.message['text'])
      // console.log('From >', ctx.message.from)
   }
}