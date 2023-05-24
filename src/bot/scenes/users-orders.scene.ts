import { Scene, SceneEnter, Hears, On, Ctx, Start, Sender, SceneLeave } from 'nestjs-telegraf';

import { USERS_BUTTON, USERS_SCENE } from '@app/common/constants'
import { SessionContext } from '@app/common/interfaces'
import { CartKeyboard, NavigationKeyboard, OrdersKeyboard } from '@bot/keyboards'
import { menuCleaner, trashCleaner } from '@app/common/utils'

@Scene(USERS_SCENE.ORDERS)
export class UsersOrdersScene {
   private isUdate = false
   private menu = null
   constructor(
      private readonly navigationKeyboard: NavigationKeyboard,
      private cartKeyboard: CartKeyboard,
      private readonly ordersKeyboard: OrdersKeyboard
   ) {}

   async checkTime(ctx) {
      const serverTime = new Date();
      const currentTimePlus = new Date(serverTime.getTime() + 20 * 60000)
      if(currentTimePlus > this.cartKeyboard.openingHours.to) {
         await ctx.answerCbQuery('Доставка будет возможна только на завтра', {
            show_alert: true
         })
      }
   }
   @On('callback_query')
   async submitOrdersHandler(@Ctx() ctx: SessionContext, @Sender('id') id: number) {
      const query = ctx.callbackQuery
      const queryData = query['data']
      const keyboardId = query.message.message_id
      const userCart = ctx.session.cart
      // Нажата кнопки "Подтвердить заказ"
      if(queryData === 'submit_order') {
         let isOrder = false
         // Проверяем, что пользователь что-то выбрал
         if(userCart.products.length > 0) {
            for (let cartProduct of userCart.products) {
               if(cartProduct.col > 0) isOrder = true
            }
         }
         if(!isOrder) {
            await ctx.answerCbQuery('Вы не отметили ни одной позиции')
            return
         }
         await this.checkTime(ctx)
         // Удаляем меню и заголовок
         await menuCleaner(ctx, query.message.message_id)
         await ctx.scene.enter(USERS_SCENE.CART)
         await ctx.answerCbQuery()
         return
      }
      // Проверяем, нажата ли кнопка +-
      const [prefix, producId] = queryData.split('__')
      if(prefix === 'minus' || prefix === 'plus') {
         const checkProduct = userCart.products.find((cartdProduct) => cartdProduct?.id === producId)
         if(!checkProduct) {
            ctx.session.cart.products.push({
               id: producId, col: 0
            })
         }
         for (let cartProduct of userCart.products) {
            if(cartProduct.id === producId) {
               if(cartProduct.col > 0 && prefix === 'minus') {
                  cartProduct.col -= .5
                  this.isUdate = true
               }
               if(prefix === 'plus') {
                  this.isUdate = true
                  cartProduct.col += .5
               }
            }
         }
      }
      // Проверяем, нажата ли кнопка тары
      if(queryData.includes('container')) {
         if(queryData !== ctx.session.cart.container_id) {
            ctx.session.cart.container_id = queryData
            this.isUdate = true
         }
      }
      if(this.isUdate) {
         try {
            await this.ordersKeyboard.updateMenu(query.from.id, keyboardId, ctx)
         } catch (error) {
            console.log(error)
         }
      }
      await ctx.answerCbQuery()
   }

   @SceneEnter()
   async onSceneEnter(@Ctx() ctx: SessionContext, @Sender('id') senderId: number) {
      // Добавляем кнопку "Назад"
      const menuTitle = await ctx.reply('🍺',
         this.navigationKeyboard.backSubmitButton()
      )
      // Добавляем основное меню с выбором пива
      const ordersMenu = await this.ordersKeyboard.pushOrdersMenu(ctx)
      // Добавляем в ID сообщений в мусорку для очистки после выхода из сцены
      ctx.session.trash.push(menuTitle.message_id, ordersMenu.message_id)
   }
   @SceneLeave()
   async onSceneLeave(@Ctx() ctx: SessionContext) {
      await trashCleaner(ctx) // Удаляем сообщения
   }
   @Hears(USERS_BUTTON.BACK.TEXT)
   async leaveSceneHandler(@Ctx() ctx: SessionContext) {
      await ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @Start()
   async onStart(ctx: SessionContext) {
      await ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @On('message')
   async msgHandler(ctx: SessionContext) {
      console.log(this.menu)
   }
}