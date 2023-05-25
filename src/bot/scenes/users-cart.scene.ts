import { Scene, SceneEnter, Hears, On,Ctx, Start, Sender, SceneLeave } from 'nestjs-telegraf'

import { USERS_BUTTON, USERS_SCENE } from '@app/common/constants'
import { BotService } from '../bot.service'
import { SbisService } from 'src/sbis/sbis.service'
import { OrderService, UserService } from '@app/database'

import { NavigationKeyboard, CartKeyboard } from '@bot/keyboards'
import { trashCleaner } from '@app/common/utils'
import { SessionContext } from '@app/common/interfaces'

@Scene(USERS_SCENE.CART)
export class UsersCartScene {
   constructor(
      private readonly botService: BotService,
      private readonly navigationKeyboard: NavigationKeyboard,
      private readonly cartKeyboard: CartKeyboard,
      private readonly sbisService: SbisService,
      private readonly usersRepo: UserService,
      private readonly orderRepo: OrderService,
   ) {}

   @SceneEnter()
   async onSceneEnter(@Ctx() ctx: SessionContext, @Sender('id') senderId: number ) {
      console.log('Enter Scene ::', USERS_SCENE.CART)
      let navButton = null
      const isAuthUser = await this.usersRepo.findById(senderId)
      if(isAuthUser) {
         navButton = this.navigationKeyboard.backButton()
      } else {
         navButton = this.navigationKeyboard.backAuthButton()
      }
      const menuTitle = await ctx.reply(
         'Проверьте свой заказ,\nи укажите время к которому его подготовить:',
         navButton
      )
      await this.cartKeyboard.pushCartMenu(ctx)
      ctx.session.trash.push(menuTitle.message_id)
   }

   @Start()
   async onStart(ctx: SessionContext) {
      await ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @SceneLeave()
   async onSceneLeave(@Ctx() ctx: SessionContext) {
      await trashCleaner(ctx)
   }

   @On('callback_query')
   async submitOrdersHandler(@Ctx() ctx: SessionContext, @Sender('id') userId) {
      const query = ctx.callbackQuery
      const queryData = query['data']
      const keyboardId = query.message.message_id
      // Подтверждение заказа
      if(queryData === 'place_order') {
         const allert = {
            subscribe: '', bonus: ''
         }
         const message = {
            subscribe: '', bonus: ''
         }
         // Проверка подписки
         const isSubscribed = await this.botService.checkUsersSubscribe(userId)
         if(!isSubscribed) {
            allert.subscribe += 'Для онлайн заказа необходимо быть участником нашей группы'
            message.subscribe += 'Пожалуйста, подпишитесь на нашу группу\n'
            message.subscribe += 'https://t.me/asdadsasdadssa'
         }
         // Если пользователь уже подтверждал телефон, он будет в базе
         const isUserExist = await this.usersRepo.isUserAuth(userId)
         if(!isUserExist) {
            if(allert.subscribe) {
               allert.bonus += `\nТакже, необходимо быть участником бонусной программы`
            }
            if(!allert.subscribe) {
               allert.bonus += `Для онлайн заказа необходимо быть участником бонусной программы`
            }
            message.bonus += '\nЧтобы проверить, являетесь ли вы участником бонусной программы, нажмите кнопку 📞 внизу чата.\n'
            message.bonus += 'Чтобы принять участие в бонусной обратитесь к продавцу на точку продаж.'
         }
         const errorAllertText = allert.subscribe + allert.bonus
         // Если возникла одна из ошибок, выводим предупреждение
         if(errorAllertText) {
            await ctx.answerCbQuery(errorAllertText, {
               show_alert: true
            })
            await ctx.reply(message.subscribe + message.bonus)
         }
         // Если пользователь есть в нашей базе и подписан на канал, проверяем его ещё раз в СБИС
         if(!errorAllertText) {
            const checkSbisUser = await this.sbisService.findUser(isUserExist.phone)
            if(!checkSbisUser) {
               await this.usersRepo.deleteUser(isUserExist.phone)
               await ctx.reply(
                  `Номер ${isUserExist.phone} не зарегистрирован в качестве участника бонусной программы.\nПожалуйста, обратитесь к нашему продавцу.`,
                  this.navigationKeyboard.backAuthButton()
               )
            }
            if(checkSbisUser) {
               const order = await this.orderRepo.addOrder(isUserExist.id, ctx.session.cart)
               if(!order) {
                  await ctx.reply('При оформлении заказа возникла непредвиденна ошибка.')
                  await ctx.scene.enter(USERS_SCENE.STARTED)
               }
               let submitMsg = ''
               submitMsg += `<b>Заказ # ${order} принят</b> 🍺\n`
               submitMsg += `При обращении в магазин, пожалуйста, сообщите продавцу его номер, а также последние 4 цифры своего телефона\n---\n`
               submitMsg += ctx.session.cart.orderText
               submitMsg += `\nБлагодарим, что воспользоватлись нашим сервисом.`
               await ctx.reply(submitMsg, {
                  parse_mode: 'HTML'
               })
               await ctx.scene.enter(USERS_SCENE.STARTED)
            }
         }
      }
      // Управление временем
      const [time, operator] = queryData.split('_')
      let isUpdate = { h: null, m: null, d: null }
      if(time === 'h') {
         isUpdate.h = await this.cartKeyboard.updateTime('hours', operator, ctx)
      }
      if(time === 'm') {
         isUpdate.m = await this.cartKeyboard.updateTime('minutes', operator, ctx)
      }
      const [isDay, when] = queryData.split('_')
      if(isDay === 'day') {
         isUpdate.d = await this.cartKeyboard.updateDay(when, ctx)
      }
      if(isUpdate.h || isUpdate.m || isUpdate.d) {
         await this.cartKeyboard.updateMenu(query.from.id, keyboardId, ctx)
      }
      // Кнопка ВРЕМЯ (неактивна)
      if(queryData === 'time') {
         ctx.answerCbQuery(this.cartKeyboard.cbAnswer.stopTapAround);
      }

      try {
         // ctx.answerCbQuery()
      } catch (error) {
         return
      }
   }
   @On('contact')
   async handlerContacts(@Ctx() ctx: SessionContext) {
      const message = ctx.update['message']
      const userPhone = parseInt(message?.contact?.phone_number)
      await ctx.deleteMessage()
      if(!userPhone) {
         ctx.reply('Не смогли проверить ваш телефон')
         return false
      }
      let userPhoneStr =  userPhone.toString()
      if(userPhoneStr.startsWith('7')) {
         userPhoneStr = '8' + userPhoneStr.slice(1)
      }
      const sbisUser = await this.sbisService.findUser(userPhoneStr)
      if(!sbisUser) {
         ctx.reply(`❌ Номер ${userPhoneStr} не зарегистрирован в качестве участника бонусной программы\nПожалуйста, обратитесь к нашему продавцу`)
         return false
      }
      const arr = sbisUser
      const userName = sbisUser[6] && arr[7] ? `${arr[6]} ${arr[7]}` : arr[6]
      const bonusBalanse = await this.sbisService.getBonuses(arr[0])
      let reply = ''
      reply += `${userName}, мы рады что вы с нами!\n`
      if(bonusBalanse) {
         console.log(parseInt(bonusBalanse))
         reply += `Баланс ваших бонусов составляет ${parseInt(bonusBalanse)}\n`
      }
      const isSubscribed = await this.botService.checkUsersSubscribe(message.from.id)
      if(!isSubscribed) {
         reply += 'Осталось только подписаться на наш канал\n'
         reply += 'https://t.me/asdadsasdadssa\n'
         reply += 'После этого, нажмите кнопку подтверждения заказа ещё раз'
      }
      if(isSubscribed) {
         reply += 'Пожалуйста, нажмите кнопку подтверждения заказа ещё раз'
      }
      await ctx.reply(reply, this.navigationKeyboard.backButton())
      await this.usersRepo.addUser({
         role: 'user',
         name: userName,
         tgId: message.from.id,
         phone: userPhoneStr,
         bonus: parseInt(bonusBalanse)
      })
   }

   @Hears(USERS_BUTTON.BACK.TEXT)
   async leaveSceneHandler(@Ctx() ctx: SessionContext) {
      await ctx.scene.enter(USERS_SCENE.ORDERS)
   }
}