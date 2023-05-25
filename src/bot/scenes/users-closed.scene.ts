import { Scene, SceneEnter, Hears, On, Ctx, Start, Sender } from 'nestjs-telegraf';

import { USERS_BUTTON, USERS_SCENE } from '@app/common/constants';
import { SessionContext } from '@app/common/interfaces';
import { NavigationKeyboard } from '@bot/keyboards';
import { SettingsService } from '@app/database';

@Scene(USERS_SCENE.CLOSED)
export class UsersClosedScene {
   constructor(
      private readonly navigationKeyboard: NavigationKeyboard,
      private readonly settingsRepo: SettingsService,
   ) {}
   @SceneEnter()
   async onSceneEnter1(@Ctx() ctx: SessionContext, @Sender('id') senderId: number ) {
      let settings = await this.settingsRepo.getSettings()
      let replyMsg = settings.reason ? settings.reason : 'Магазин временно не работает'
      await ctx.reply('⛔️')
      await ctx.reply(replyMsg,
         this.navigationKeyboard.backButton()
      )
   }
   @Start()
   async onStart(ctx: SessionContext) {
      ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @Hears(USERS_BUTTON.BACK.TEXT)
   leaveSceneHandler(@Ctx() ctx: SessionContext) {
      ctx.scene.enter(USERS_SCENE.STARTED)
   }
}