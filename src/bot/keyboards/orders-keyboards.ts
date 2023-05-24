import { Injectable } from '@nestjs/common';
import { ProductService } from '@app/database';

@Injectable()
export class OrdersKeyboard {
   constructor(
      private productsRepo: ProductService
   ) {}
   // Инициируем меню
   async pushOrdersMenu(ctx) {
      ctx.session.cart.db_products = await this.productsRepo.getAll()
      const summ = await this.calc(ctx.session.cart.added_products)
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
      const summ = await this.calc(ctx.session.cart.added_products)
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

   async calc(cartProducts) {
      let summ = 0
      if(cartProducts.length > 0) {
         for (let cartProduct of cartProducts) {
            // ID в корзине хранится в виде product_1
            const { price } = await this.productsRepo.findByCartId(cartProduct.id)
            summ += (price * cartProduct.col)
         }
      }
      return summ
   }
}