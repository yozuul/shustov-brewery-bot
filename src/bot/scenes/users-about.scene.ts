import { readFile } from 'node:fs/promises'
import { Scene, SceneEnter, Hears, On, Ctx, Start, Sender } from 'nestjs-telegraf';

import { USERS_BUTTON, USERS_SCENE } from '@app/common/constants';
import { SessionContext } from '@app/common/interfaces';
import { NavigationKeyboard } from '@bot/keyboards';
import {buffer} from 'stream/consumers';
import {resolve} from 'node:path';

@Scene(USERS_SCENE.ABOUT)
export class UsersAboutScene {
   constructor(
      private readonly navigationKeyboard: NavigationKeyboard
   ) {}
   @SceneEnter()
   async onSceneEnter1(@Ctx() ctx: SessionContext, @Sender('id') senderId: number ) {
      try {
         await ctx.replyWithPhoto({ source: resolve('./about.jpg') })
         await ctx.reply(
            `Пивоварня “Шустов”\nНайти нас можно по адресу: ТЦ СмайлМолл, ул. Баумана, 233Б\nГрафик работы с 11:00 до 23:00.\nВход со стороны Баумана.`,
            this.navigationKeyboard.backButton()
         )
         await ctx.reply(
            `Как проехать: https://go.2gis.com/14xt4o`, {
               disable_web_page_preview: true
            }
         )
      } catch (error) {
         console.log(error, 'USERS_SCENE.ABOUT, ctx.reply')
      }
      try {
         await ctx.telegram.sendLocation(senderId, 52.351488, 104.150153, {
            horizontal_accuracy: 5, proximity_alert_radius: 10
         })
      } catch (error) {
         console.log(error, 'USERS_SCENE.ABOUT, ctx.telegram.sendLocation')
      }
   }
   @Start()
   async onStart(ctx: SessionContext) {
      await ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @Hears(USERS_BUTTON.BACK.TEXT)
   async leaveSceneHandler(@Ctx() ctx: SessionContext) {
      await ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @On('message')
   async onSceneEnter(@Sender('id') senderId: number, @Ctx() ctx: SessionContext ) {
      await ctx.scene.enter(USERS_SCENE.STARTED)
   }
}