import { Injectable } from '@nestjs/common';
import { ProductService } from '@app/database';

@Injectable()
export class OrdersKeyboard {
   constructor(
      private productsRepo: ProductService
   ) {}
   // Инициируем меню
   async pushOrdersMenu(ctx) {
      ctx.session.cart.db_products = await this.productsRepo.getAllForCart()
      const summ = this.calc(ctx)
      const menu = await ctx.reply(
         `Заказ на сумму ${summ} руб.`, {
            reply_markup: {
               inline_keyboard: await this.productsButton(ctx.session.cart)
            }
         }
      )
      return menu
   }
   // Обновляем меню
   async updateMenu(userId, keyboardId, ctx) {
      const summ = await this.calc(ctx)
      await ctx.telegram.editMessageText(
         userId, keyboardId, null,
         `Заказ на сумму ${summ} руб.`, {
         reply_markup: {
            inline_keyboard: await this.productsButton(ctx.session.cart)
         }
      })
   }

   async productsButton(cart) {
      const buttons = []
      for (let dbProduct of cart.db_products) {
         // Ищем в сессии корзины уже добавленные товары, и добавляем количество, если есть
         const callbackBtnName = dbProduct.callback_data
         const addedToCart = cart.added_products.find((cartProduct) => {
            return cartProduct.callback_data === callbackBtnName
         })
         const btnData = {
            product: [{ text: dbProduct.name, callback_data: callbackBtnName }],
            control: this.controlButtons(callbackBtnName, addedToCart)
         }
         buttons.push(btnData.product, btnData.control)
      }
      buttons.push(
         [{
            text: 'Выберите тару:', callback_data: `select_containers`
         }],
         this.containersButtons(cart.container_id),
         [{
            text: 'ПОДТВЕРДИТЬ ЗАКАЗ 🍺', callback_data: `submit_order`
         }]
     )
     return buttons
   }

   controlButtons(callbackBtnName, addedToCart) {
      let col = 0
      if(addedToCart) col = addedToCart.col
      return [
         { text: '-', callback_data: `minus__${callbackBtnName}` },
         { text: col, callback_data: `total__${callbackBtnName}` },
         { text: '+', callback_data: `plus__${callbackBtnName}` }
      ]
   }

   containersButtons(containerId) {
      const existContainers = [
         { id: 'container_1', name: '1,5 литра' },
         { id: 'container_2', name: 'Кега' },
      ]
      return existContainers.map((container) => {
         return {
            text: container.id === containerId ? '🟢 ' + container.name : '🔘 ' + container.name,
            callback_data: container.id,
         }
      })
   }

   calc(ctx) {
      const container = ctx.session.cart.container_id
      const containerPrice = {
         container_1: 15, container_2: 3100
      }
      ctx.session.cart.summ = 0
      const { db_products, added_products } = ctx.session.cart
      if(added_products.length > 0) {
         for (let addedProduct of added_products) {
            const callbackName = addedProduct.callback_data
            const { price } = db_products.find((product) => {
               return product.callback_data == callbackName
            })
            if(container === 'container_1') {
               const containerSumm = containerPrice.container_1 * addedProduct.col
               ctx.session.cart.summ += (price * (addedProduct.col * 1.5)) + containerSumm
            }
            if(container === 'container_2') {
               const containerSumm = containerPrice.container_2 * addedProduct.col
               ctx.session.cart.summ += (price * (addedProduct.col * 25)) + containerSumm
            }
         }
      }
      return ctx.session.cart.summ
   }
}