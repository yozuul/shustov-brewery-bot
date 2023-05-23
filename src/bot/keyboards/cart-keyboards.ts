import { Markup } from 'telegraf'
import { Injectable } from '@nestjs/common';

import { USERS_BUTTON } from '@app/common/constants';
import { ProductsService } from '@app/database';

@Injectable()
export class CartKeyboard {
   constructor(
      private productsRepo: ProductsService
   ) {}
   async pushCartMenu(ctx) {
      const totalOrderText = await this.totalOrderText(ctx)
      this.setDefaultTime(ctx)
      const submitMenu = await ctx.reply(totalOrderText, {
         parse_mode: 'HTML',
         reply_markup: this.buttonsData(ctx)
      })
      ctx.session.trash.push(submitMenu.message_id)
   }

   async updateMenu(ctx) {
      console.log(ctx)
   }

   // При изменении времени, убеждаемся что меню уже не висит более 20 минут
   async checkMenuLifeTime(ctx) {
      let { h, m } = ctx.session.cart.time
      const cartTimeFormat = this.dateFormatter(h, m)
      const currentTime = new Date()
      // При создании меню, мы добавляли + 20 минут. Сверяем его с текущим временем
      if(currentTime > cartTimeFormat) {
         // Текущее время уже больше, значит обновляем время корзины
         this.setDefaultTime(ctx)
         // await ctx.answerCbQuery('Время корзины было синхронизировано')
         return currentTime
      }
      return cartTimeFormat
   }

   dateFormatter(h, m) {
      const currentTime = new Date()
      currentTime.setHours(h)
      currentTime.setMinutes(m)
      return currentTime
   }

   async updateTime(timeUnit, operation, ctx) {
      console.log('TimeUnit ::', timeUnit)
      console.log('Operation ::', operation)
      // Если меню висит менее 20 минут, оперируем временем сессии, которое было задано при переходе в сцену, иначе обновляем время, и работаем с текущим + 20
      const currentCartTime = await this.checkMenuLifeTime(ctx)

      if (timeUnit === 'hours') {
         if(operation === 'plus') {
            const updatedTime = new Date(currentCartTime.setHours(currentCartTime.getHours() + 1))
            ctx.session.cart.time.h = updatedTime.getHours()
            if(!(this.openingHours.to > updatedTime)) {
               ctx.session.cart.time.h = updatedTime.getHours().toString().padStart(2, '0')
            } else {
               await ctx.answerCbQuery('Мы работаем до 23:00')
               return
            }
         }
//          if (operation === 'plus' && currentHours < openingHours.to.hours) {
//             updatedHours++;
//          }
//          if (operation === 'minus' && currentHours > openingHours.from.hours) {
//             updatedHours--;
//          }
      }
//
//       if (timeUnit === 'minutes') {
//          if (operation === 'plus' && currentMinutes < 50) {
//             updatedMinutes += 10;
//          }
//          if (operation === 'minus' && currentMinutes >= 10) {
//             updatedMinutes -= 10;
//          }
//       }
//       currentHours = updatedHours;
//       currentMinutes = updatedMinutes;
//       console.log('currentHours', currentHours)
//       console.log('currentMinutes', currentMinutes)
//       ctx.session.cart.time.h = currentHours
//       ctx.session.cart.time.m = currentMinutes
   }

   dayViewButton(ctx) {
      const { day } = ctx.session.cart
      const btnData = []
      const variants = [
         { name: 'Ближайшее', id: `day_near` },
         { name: 'Позже', id: `day_today` },
         { name: 'Завтра', id: `day_tomorrow` }
      ]
      for (let toDay of variants) {
         btnData.push(
            { text: day === toDay.id ? `🟢 ${toDay.name}` : `🔘 ${toDay.name}`, callback_data: toDay.id }
         )
      }
      return btnData
   }
   timeViewButton(ctx) {
      const { h, m } = ctx.session.cart.time
      return [
         {
            text: `${h} : ${m}`, callback_data: `time`
         }
      ]
   }
   buttonsData(ctx) {
      return {
         inline_keyboard: [
            [
               {
                  text: '-', callback_data: `h_minus`
               },
               {
                  text: '+', callback_data: `h_plus`
               },
               {
                  text: 'ВРЕМЯ', callback_data: `time`
               },
               {
                  text: '-', callback_data: `m_minus`
               },
               {
                  text: '+', callback_data: `m_plus`
               },
            ],
            this. timeViewButton(ctx),
            this.dayViewButton(ctx),
            [
               {
                  text: 'ЗАКАЗ ПОДТВЕРЖДАЮ 👍', callback_data: `place_order`,
               }
            ],
         ]
      }
   }

   setDefaultTime(ctx) {
      const serverTime = new Date();
      const saerverTimePlus = new Date(serverTime.getTime() - 200 * 60000)
      const hoursPlus = saerverTimePlus.getHours().toString().padStart(2, '0')
      const minutesPlus = saerverTimePlus.getMinutes().toString().padStart(2, '0')
      ctx.session.cart.time.h = hoursPlus
      ctx.session.cart.time.m = minutesPlus
      return saerverTimePlus
   }

   get openingHours() {
      return {
         from: this.dateFormatter(12, 0),
         to: this.dateFormatter(23, 0),
      }
   }

   async totalOrderText(ctx) {
      let orderText = ''
      let totalSumm = null
      const { products } = ctx.session.cart
      for (let cartProduct of products) {
         const { price, name } = await this.productsRepo.getPrice(cartProduct.id)
         const sumBerProduct = cartProduct.col * price
         totalSumm += sumBerProduct
         orderText += `<b>${name}: ${cartProduct.col} л.</b>\nСумма: ${sumBerProduct} руб. (${price} руб./литр)\n---\n`
      }
      orderText += `💳 К ОПЛАТЕ: ${totalSumm} руб.`
      return orderText
   }

   get cbAnswer() {
      const onlyAuthUsers = 'Оформление онлайн заказа доступно только участникам бонусной программы.\nДля проверки статуса, нажмите на кнопку "ПОДТВЕРДИТЬ ТЕЛЕФОН"'
      const stopTapAround = 'Для установки времени воспользуйтесь кнопками [+] [-]'
      return { onlyAuthUsers }
   }
}