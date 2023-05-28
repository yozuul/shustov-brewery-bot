import { Injectable } from '@nestjs/common'
import { ProductService } from '@app/database'

@Injectable()
export class CartKeyboard {
   private isUdate = false
   constructor(
      private productsRepo: ProductService
   ) {}
   // Инициализируем меню при входе в сценарий
   async pushCartMenu(ctx) {
      ctx.session.cart.orderText = await this.totalOrderTextCalc(ctx)
      this.setDefaultTime(ctx)

      const submitMenu = await ctx.reply(
         ctx.session.cart.orderText, {
         parse_mode: 'HTML',
         reply_markup: {
            inline_keyboard: this.buttonsData(ctx)
         }
      })
      ctx.session.trash.push(submitMenu.message_id)
   }
   // Обновляем меню
   async updateMenu(userId, keyboardId, ctx) {
      try {
         await ctx.telegram.editMessageReplyMarkup(
            userId, keyboardId, null, {
               inline_keyboard: this.buttonsData(ctx)
            }
         )
      } catch (error) {
         console.log(error)
         console.log('Меню не обновлено')
      }
   }
   // Время работы
   get openingHours() {
      return {
         from: this.formatterHoursMinutes(12, 0),
         to: this.formatterHoursMinutes(23, 0),
      }
   }
   // ПРОВЕРКА УСЛОВИЙ ПРИ ИЗМЕНЕНИИ ВРЕМЕНИ
   // Проверка времени открытия
   async checkTimeCorrect(updatedTime, ctx) {
      const updateDate = new Date(updatedTime)
      // Проверяем, что выбранное время не больше времени закрытия
      const openTo = this.openingHours.to
      const openToMinus = new Date(openTo.setMinutes(openTo.getMinutes() - 10))
      if(updateDate > openToMinus) {
         await ctx.answerCbQuery('Мы работаем до 23:00')
         return false
      }
      // Проверяем, что выбранное время не меньше времени открытия
      const openFrom = this.openingHours.from
      const openFromMinus = new Date(openFrom.setMinutes(openFrom.getMinutes() + 10))
      if(updateDate < openFromMinus) {
         await ctx.answerCbQuery('Мы работаем c 12:00')
         return false
      }
      // Проверяем что выбранное время не меньше текущего + 10 мин
      if(ctx.session.cart.day !== 'day_tomorrow') { // Если заказ не на завтра
         const currentTimePlus = new Date()
         currentTimePlus.setMinutes(currentTimePlus.getMinutes() + 10)
         if(updateDate < currentTimePlus) {
            await ctx.answerCbQuery('Нельзя указать время меньше текущего')
            return false
         }
      }
      return true
   }
   // При изменении времени, убеждаемся что время в меню актуально
   checkMenuLifeTime(ctx): boolean {
      this.isUdate = false
      const currentTime = new Date()
      if(ctx.session.cart.day !== 'day_tomorrow') {
         const currentTimePlus = new Date(currentTime.setMinutes(currentTime.getMinutes() + 20))
         if(currentTimePlus > new Date(ctx.session.cart.time)) {
            ctx.session.cart.time = currentTimePlus
         }
      }
      const updatedCartTime = new Date(ctx.session.cart.time)
      // Если время корзины получилось больше время закрытия
      if(updatedCartTime > this.openingHours.to) {
         console.log('updatedCartTime > this.openingHours.to')
         // Выставляем время открытия и завтрашний день
         ctx.session.cart.time = this.openingHours.from
         ctx.session.cart.day = 'day_tomorrow'
         this.isUdate = true
         ctx.answerCbQuery('Онлайн заказ будет возможен только на завтра')
      }
      if(updatedCartTime < this.openingHours.from) {
         console.log('uupdatedCartTime < this.openingHours.from')
         // Выставляем время открытия и завтрашний день
         ctx.session.cart.time = this.openingHours.from
         ctx.session.cart.day = 'day_today'
         this.isUdate = true
         ctx.answerCbQuery('Мы работаем с 12:00')
      }
      return this.isUdate
   }
   // ОБРАБОТКА НАЖАТИЙ [+] / [-]
   // Проверка всех условий и обновление времени в меню
   async updateTime(timeUnit, operator, ctx): Promise<boolean> {
      console.log(timeUnit, operator)
      // Проверяем что пока пользователь думал, магазин уже не закрылся
      await this.checkMenuLifeTime(ctx)
      console.log(this.isUdate)
      if(this.isUdate) return this.isUdate
      // Выполняем операцию по расчёту времени в зависимости от нажатых пользователем кнопок
      const updatedTime = this.changeTime(ctx.session.cart.time, timeUnit, operator)
      // Проверяем, что значение попадает в период времени работы и не меньше текущего времени
      const isUpdate = await this.checkTimeCorrect(updatedTime, ctx)
      if(isUpdate) {
         // Если всё норм, обновляем время в сессии, и ставим флаг, что надо обновить меню
         ctx.session.cart.time = new Date(updatedTime)
         if(operator === 'plus' && ctx.session.cart.day === 'day_near') {
            ctx.session.cart.day = 'day_today'
         }
         this.isUdate = true
      }
      if(!isUpdate) {
         ctx.answerCbQuery()
      }
      return this.isUdate
   }

   async updateDay(selectedDay, ctx) {
      this.isUdate = false
      const dayId = `day_${selectedDay}`
      if(selectedDay == 'tomorrow') {
         ctx.session.cart.day = dayId
         this.isUdate = true
      }
      if((selectedDay == 'near') || (selectedDay == 'today')) {
         const currentTime = new Date()
         const currentPlus = currentTime.setMinutes(currentTime.getMinutes() + 20)
         const isUpdate = this.checkTimeCorrect(currentPlus, ctx)
         if(isUpdate) {
            ctx.session.cart.time = new Date(currentPlus)
            ctx.session.cart.day = dayId
            this.isUdate = true
         }
      }
      return this.isUdate
   }
   // Операции со временем при нажатии на кнопки
   changeTime(current, timeUnit, operator) {
      current = new Date(current)
      if(timeUnit === 'hours') {
         if(operator === 'plus') {
            return current.setHours(current.getHours() + 1)
         }
         if(operator === 'minus') {
            return current.setHours(current.getHours() - 1)
         }
      }
      if(timeUnit === 'minutes') {
         if(operator === 'plus') {
            return current.setMinutes(current.getMinutes() + 10)
         }
         if(operator === 'minus') {
            return current.setMinutes(current.getMinutes() - 10)
         }
      }
   }
   // ФОРМИРОВАНИЕ КНОПОК МЕНЮ
   // Форматирование перед выводом в меню
   getFormatedTime(ctx) {
      const cartTime = new Date(ctx.session.cart.time)
      return {
         hours: cartTime.getHours().toString().padStart(2, '0'),
         minutes: cartTime.getMinutes().toString().padStart(2, '0')
      }
   }
   // На какой день
   dayViewButton(ctx) {
      const { day } = ctx.session.cart
      const btnData = []
      const variants = [
         { name: 'Ближайшее', id: `day_near` },
         { name: 'Позже', id: `day_today` },
         { name: 'Завтра', id: `day_tomorrow` }
      ]
      for (let toDay of variants) {
         btnData.push({
            text: day === toDay.id ? `🟢 ${toDay.name}` : `🔘 ${toDay.name}`,
            callback_data: toDay.id
         })
      }
      return btnData
   }
   // На какое время
   timeViewButton(ctx) {
      const { hours, minutes } = this.getFormatedTime(ctx)
      const { hourEmoji, minuteEmoji } = this.emojiDigit(hours, minutes)
      return [
         {
            text: `${hourEmoji} : ${minuteEmoji}`, callback_data: `time`
         }
      ]
   }
   // Управление часами
   buttonsData(ctx) {
      return [
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
   // ОБЩЕЕ
   // Установка текущего времени в сессию
   async setDefaultTime(ctx) {
      const serverTime = new Date();
      const currentTimePlus = new Date(serverTime.getTime() + 20 * 60000)
      if(currentTimePlus > this.openingHours.to) {
         ctx.session.cart.time = this.openingHours.from
         ctx.session.cart.day = 'day_tomorrow'
         return
      }
      if(currentTimePlus < this.openingHours.from) {
         ctx.session.cart.time = new Date(this.openingHours.from.getTime() + 20 * 60000)
         ctx.session.cart.day = 'day_today'
         return
      }
      ctx.session.cart.time = currentTimePlus
      ctx.session.cart.day = 'day_near'
   }
   // Форматирование времени работы
   formatterHoursMinutes(h, m) {
      const currentTime = new Date()
      currentTime.setHours(h)
      currentTime.setMinutes(m)
      return currentTime
   }
   // Формирование текста всего заказа
   async totalOrderTextCalc(ctx) {
      const containerPrice = {
         container_1: 15, container_2: 3000
      }
      const containerId = ctx.session.cart.container_id
      let orderText = ''
      const { db_products, added_products } = ctx.session.cart
      for (let addedProduct of added_products) {
         const callbackName = addedProduct.callback_data
         const { price, name } = db_products.find((product) => {
            return product.callback_data == callbackName
         })
         let sumPerProduct = 0
         let totalLittre = 0
         let containerSumm = ''
         if(containerId === 'container_1') {
            totalLittre = addedProduct.col * 1.5
            sumPerProduct = price * totalLittre
            containerSumm = (addedProduct.col * containerPrice.container_1) + 'руб./тара'
         }
         if(containerId === 'container_2') {
            totalLittre = addedProduct.col * 25
            sumPerProduct = price * totalLittre
            containerSumm += (addedProduct.col * 100) + ' руб./аренда в сутки + '
            containerSumm += 'залог ' + (addedProduct.col * containerPrice.container_2)
            containerSumm += ' руб. за тару'
         }
         orderText += `<b>${name}: ${totalLittre} л.</b>\n`
         orderText += `Сумма: ${sumPerProduct} руб. — ${price} руб./литр \n+ ${containerSumm}\n`
         orderText += `---\n`
      }
      orderText += `💳 К ОПЛАТЕ: ${ctx.session.cart.summ} руб.`
      return orderText
   }

   get cbAnswer() {
      const onlyAuthUsers = 'Оформление онлайн заказа доступно только участникам бонусной программы.\nДля проверки статуса, нажмите на кнопку "ПОДТВЕРДИТЬ ТЕЛЕФОН"'
      const stopTapAround = 'Для установки времени воспользуйтесь кнопками [+] [-]'
      return { onlyAuthUsers, stopTapAround }
   }

   emojiDigit(hours, minutes) {
      const emoji = {
         '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣', '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣'
      }
      const h = hours.split('').map((dig) => emoji[dig])
      const m = minutes.split('').map((dig) => emoji[dig])
      return {
         hourEmoji: h.join(''), minuteEmoji: m.join('')
      }
   }
}