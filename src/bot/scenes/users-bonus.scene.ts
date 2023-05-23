import { Scene, SceneEnter, Hears, On, Ctx, Start, Sender } from 'nestjs-telegraf';

import { USERS_BUTTON, USERS_SCENE } from '@app/common/constants';
import { SessionContext } from '@app/common/interfaces';
import { NavigationKeyboard } from '@bot/keyboards';

@Scene(USERS_SCENE.BONUS)
export class UsersBonusScene {
   constructor(
      private readonly navigationKeyboard: NavigationKeyboard
   ) {}
   @SceneEnter()
   async onSceneEnter1(@Ctx() ctx: SessionContext) {
      await ctx.reply(
         'Наша бонусная программа позволяет копить баллы и тратить их на любимые пенные напитки.\nТакже, участникам бонусной программы доступная возможность делать предзаказы к нужному времени через нашего бота.\nЧтобы принять участие в программе, необходимо обратиться к продавцу на торговую точку.\nЕсли вы уже являетесь участником бонусной программы, нажмите кнопку "ПОДТВЕРДИТЬ ТЕЛЕФОН"',
         this.navigationKeyboard.backAuthButton()
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
   @On('message')
      async onSceneEnter(@Sender('id') senderId: number, ctx: SessionContext ) {
   }
}