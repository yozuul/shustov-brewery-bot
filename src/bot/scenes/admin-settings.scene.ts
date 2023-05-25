import { UseGuards } from '@nestjs/common'
import { Scene, SceneEnter, Hears, On, Ctx, Start, Sender, Message } from 'nestjs-telegraf';

import { AuthGuard } from '@app/common/guard'
import { ADMINS_SCENE, USERS_BUTTON, USERS_SCENE } from '@app/common/constants';
import { SessionContext } from '@app/common/interfaces';
import { NavigationKeyboard } from '@bot/keyboards';
import { SettingsService } from '@app/database';

@Scene(ADMINS_SCENE.SETTINGS)
export class AdminSettingsScene {
   private waitClosedReasonText = false
   constructor(
      private readonly navigationKeyboard: NavigationKeyboard,
      private readonly settingsRepo: SettingsService,
   ) {}
   @UseGuards(AuthGuard)
   @SceneEnter()
   async onSceneEnter(@Ctx() ctx: SessionContext, @Sender('id') senderId: number ) {
      await ctx.reply('Управление настройками', this.navigationKeyboard.backButton())
      const settings = await this.settingsRepo.getSettings()
      let action = settings.closed ? 'close' : 'open'
      const openCloseButtons = await this.openCloseBtn(action)
      const closeMenu = await ctx.reply(
         'Работа магазина', {
         parse_mode: 'HTML',
         reply_markup: {
            inline_keyboard: openCloseButtons
         }
      })
      ctx.session.trash.push(closeMenu.message_id)
   }

   @On('callback_query')
   async settingsChangeHandler(@Ctx() ctx: SessionContext, @Sender('id') userId: number) {
      const query = ctx.callbackQuery
      const queryData = query['data']
      const keyboardId = query.message.message_id
      if(queryData === 'open' || queryData === 'close') {
         await this.editCloseOpenMenu(userId, keyboardId, queryData, ctx)
      }
      if(queryData === 'open') {
         this.waitClosedReasonText = false
         await this.settingsRepo.updateSettings({
            isClose: false
         })
         await ctx.answerCbQuery('Настройки изменены')
      }
      if(queryData === 'close') {
         this.waitClosedReasonText = true
         await ctx.reply('Укажите причину')
      }
   }

   @Start()
   async onStart(ctx: SessionContext) {
      await ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @Hears(USERS_BUTTON.BACK.TEXT)
   leaveSceneHandler(@Ctx() ctx: SessionContext) {
      ctx.scene.enter(USERS_SCENE.STARTED)
   }

   @On('text')
   async onMessage(@Ctx() ctx: SessionContext, @Message('text') text: string) {
      if(this.waitClosedReasonText) {
         await this.settingsRepo.updateSettings({
            isClose: true, closeReason: text
         })
         await ctx.reply('Бот больше не будет принимать заказы')
         await ctx.scene.enter(USERS_SCENE.STARTED)
      }
   }

   async editCloseOpenMenu(userId, keyboardId, action, ctx) {
      const openCloseButtons = this.openCloseBtn(action)
      try {
         await ctx.telegram.editMessageReplyMarkup(
            userId, keyboardId, null, {
               inline_keyboard: openCloseButtons
            }
         )
      } catch (error) {
         console.log(error)
         console.log('Меню не обновлено')
      }
   }

   openCloseBtn(action) {
      return [[
         {
            text: action === 'open' ? '🟢 Открыто' : '🔘 Открыто',
            callback_data: 'open'
         },
         {
            text: action === 'close' ? '🟢 Закрыто' : '🔘 Закрыто',
            callback_data: 'close'
         },
      ]]
   }
}