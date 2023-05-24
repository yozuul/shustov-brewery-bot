import { Injectable } from '@nestjs/common'

import { ProductService } from '@app/database'

@Injectable()
export class CartKeyboard {
   private totalOrderText = null
   private isUdate = false
   constructor(
      private productsRepo: ProductService
   ) {}
   // Инициализируем меню при входе в сценарий
   async pushCartMenu(ctx) {
      this.totalOrderText = await this.totalOrderTextCalc(ctx)
      this.setDefaultTime(ctx)

      const submitMenu = await ctx.reply(
         this.totalOrderText, {
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
   // ПРОВЕРКА УСЛОВИЙ ПРИ ИЗМЕНЕНИИ ВРЕМЕНИ
   // Проверка времени открытия
   checkOpeningTime(updatedTime, ctx) {
      const updateDate = new Date(updatedTime)
      // Вероверяем что выбранное время не меньше текущего + 20 мин, и не выбрано "Завтра"
      if(ctx.session.cart.day !== 'day_tomorrow') {
         const currentTime = new Date()
         const currentTimePlus = new Date()
         currentTime.setMinutes(currentTime.getMinutes() + 10)
         if(updateDate < currentTimePlus) {
            ctx.session.cart.time = currentTimePlus
            ctx.answerCbQuery('Нельзя указать время меньше текущего')
            return false
         }
      }
      // Проверяем, что выбранное время не больше времени закрытия
      if(updateDate > this.openingHours.to) {
         ctx.answerCbQuery('Мы работаем до 23:00', ctx)
         return false
      }
      // Проверяем что выбранное время не меньше времени открытия + 20 мин
      const openFrom = this.openingHours.from
      const minPlus = new Date(openFrom.setMinutes(openFrom.getMinutes() + 20))
      if(updateDate < minPlus) {
         ctx.answerCbQuery('Мы работаем c 12:00', ctx)
         return false
      }
      return true
   }
   // При изменении времени, убеждаемся что меню уже не висит более 20 минут
   checkMenuLifeTime(ctx): Date {
      const currentTime = new Date()
      // Время работы + 20 минут
      const maxOrderTime = new Date(currentTime.getTime() + 20 * 60000)
      const cartTime = new Date(ctx.session.cart.time)
      if(maxOrderTime > this.openingHours.to) {
         ctx.session.cart.time = this.openingHours.from
         ctx.session.cart.day = 'day_tomorrow'
         this.isUdate = true
         ctx.answerCbQuery('Онлайн заказ можно сделать минимум за 20 минут до закрытия')
         return
      }
      // Если текущее время больше времени корзина на 20 мин, обновляем корзину
      if(currentTime > cartTime) {
         ctx.session.cart.time = new Date(maxOrderTime)
         this.isUdate = true
      }
      return new Date(ctx.session.cart.time)
   }
   // ОБРАБОТКА НАЖАТИЙ [+] / [-]
   // Проверка всех условий и обновление времени в меню
   async updateTime(timeUnit, operator, ctx): Promise<boolean> {
      console.log(timeUnit, operator)
      this.isUdate = false
      // Сверяем время показа меню и время нажатия кнопок. Если разница более 20 мин, синхронизируем
      const cartTime = await this.checkMenuLifeTime(ctx)
      // Если ничего не вернули, значит уже закрыто
      if(!cartTime) return this.isUdate
      // Выполняем операцию по расчёту времени в зависимости от нажатых пользователем кнопок
      const updatedTime = this.changeTime(cartTime, timeUnit, operator)
      // Проверяем, что значение попадает в период времени работы
      const isUpdate = this.checkOpeningTime(updatedTime, ctx)
      if(isUpdate) {
         // Если всё норм, обновляем время в сессии, и ставим флаг, что надо обновить меню
         ctx.session.cart.time = new Date(updatedTime)
         if(operator === 'plus' && ctx.session.cart.day === 'day_near') {
            ctx.session.cart.day = 'day_today'
         }
         this.isUdate = true
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
         const isUpdate = this.checkOpeningTime(currentPlus, ctx)
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
      return [
         {
            text: `${hours} : ${minutes}`, callback_data: `time`
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
   // Время работы
   get openingHours() {
      return {
         from: this.formatterHoursMinutes(12, 0),
         to: this.formatterHoursMinutes(23, 0),
      }
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
      let orderText = ''
      let totalSumm = null
      const { products } = ctx.session.cart
      for (let cartProduct of products) {
         const { price, name } = await this.productsRepo.findByCartId(cartProduct.id)
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