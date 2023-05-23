import { Scene, SceneEnter, Hears, On,Ctx, Start, Sender, SceneLeave } from 'nestjs-telegraf';

import { USERS_BUTTON, USERS_SCENE } from '@app/common/constants';
import { SessionContext } from '@app/common/interfaces';
import { NavigationKeyboard, CartKeyboard } from '@bot/keyboards';
import { trashCleaner } from '@app/common/utils';

@Scene(USERS_SCENE.CART)
export class UsersCartScene {
   constructor(
      private readonly navigationKeyboard: NavigationKeyboard,
      private readonly cartKeyboard: CartKeyboard
   ) {}
   @On('callback_query')
   async submitOrdersHandler(@Ctx() ctx: SessionContext) {
      const query = ctx.callbackQuery
      const queryData = query['data']
      const keyboardId = query.message.message_id
      if(queryData === 'place_order') {
         ctx.answerCbQuery(this.cartKeyboard.cbAnswer.onlyAuthUsers, {
            show_alert: true
         })
      }
      if(queryData === 'time') {
         ctx.answerCbQuery(this.cartKeyboard.cbAnswer.onlyAuthUsers);
      }
      const [time, action] = queryData.split('_')
      if(time === 'h') {
         this.cartKeyboard.updateTime('hours', action, ctx)
      }
      if(time === 'm') {
         this.cartKeyboard.updateTime('minutes', action, ctx)
      }
      ctx.answerCbQuery()
   }
   @SceneEnter()
   async onSceneEnter1(@Ctx() ctx: SessionContext, @Sender('id') senderId: number ) {
      const menuTitle = await ctx.reply(
         'Проверьте свой заказ, и укажите время к которому его подготовить',
         this.navigationKeyboard.backAuthButton()
      )
      const submitMenu = await this.cartKeyboard.pushCartMenu(ctx)
      // ctx.session.trash.push(menuTitle.message_id, submitMenu.message_id)
   }
   @Hears(USERS_BUTTON.BACK.TEXT)
   async leaveSceneHandler(@Ctx() ctx: SessionContext) {
      await ctx.scene.enter(USERS_SCENE.ORDERS)
   }
   @Start()
   async onStart(ctx: SessionContext) {
      await ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @SceneLeave()
   async onSceneLeave(@Ctx() ctx: SessionContext) {
      await trashCleaner(ctx)
   }
   @On('message')
   async onSceneEnter(@Ctx() ctx: SessionContext, @Sender('id') senderId: number) {
      const totalOrder = this.cartKeyboard.pushCartMenu(ctx)
   }
}