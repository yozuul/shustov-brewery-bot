import { Scene, SceneEnter, Hears, On, Ctx, Start, Sender } from 'nestjs-telegraf';

import { USERS_BUTTON, USERS_SCENE } from '@app/common/constants';
import { SessionContext } from '@app/common/interfaces';
import { NavigationKeyboard } from '@bot/keyboards';

@Scene(USERS_SCENE.ABOUT)
export class UsersAboutScene {
   constructor(
      private readonly navigationKeyboard: NavigationKeyboard
   ) {}
   @SceneEnter()
   async onSceneEnter1(@Ctx() ctx: SessionContext, @Sender('id') senderId: number ) {
      try {
         await ctx.reply(
            'Пивоварня Шустова\nКто в нашей пивовране не бывал, тот Иркутска не видал!\nНайти нас можно по адресу: ул. Баумана, стр. 233б, пом. 3/7​\nГрафик работы с 12:00 до 23:00. Тел. 8-927-221-66-88',
            this.navigationKeyboard.backButton()
         )
      } catch (error) {
         console.log(error, 'USERS_SCENE.ABOUT, ctx.reply')
      }
      try {
         await ctx.telegram.sendLocation(senderId, 52.3382560914137, 104.185234172527, {
            horizontal_accuracy: 5, proximity_alert_radius: 10
         })
      } catch (error) {
         console.log(error, 'USERS_SCENE.ABOUT, ctx.telegram.sendLocation')
      }
   }
   @Start()
   async onStart(ctx: SessionContext) {
      ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @Hears(USERS_BUTTON.BACK.TEXT)
   leaveSceneHandler(@Ctx() ctx: SessionContext) {
      ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @On('message')
      async onSceneEnter(@Sender('id') senderId: number, ctx: SessionContext ) {
   }
}