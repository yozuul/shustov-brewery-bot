import { USERS_BUTTON } from '@app/common/constants';
import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf'

import { ProductsService } from '@app/database';

@Injectable()
export class OrdersKeyboard {
   constructor(
      private productsRepo: ProductsService
   ) {}
   async pushOrdersMenu(ctx) {
      const { products, container_id } = ctx.session.cart
      const buttons = await this.productsButton(products, container_id)
      const summ = await this.calc(products)
      const menu = await ctx.reply(
         `Заказ на сумму ${summ} руб.`, {
            reply_markup: {
               inline_keyboard: buttons
            }
         }
      )
      return menu
   }

   async updateMenu(ctx, userId, keyboardId) {
      const { products, container_id } = ctx.session.cart
      const buttons = await this.productsButton(products, container_id)
      const summ = await this.calc(products)
      await ctx.telegram.editMessageText(
         userId, keyboardId, null,
         `Заказ на сумму ${summ} руб.`, {
         reply_markup: {
            inline_keyboard: buttons
         }
      })
      // await ctx.telegram.editMessageReplyMarkup(
      //    userId, keyboardId, null, {
      //    inline_keyboard: buttons
      // })
   }

   async productsButton(cartProducts, containerId) {
      const existProducts = await this.productsRepo.getAll()
      const buttons = []
      for (let product of existProducts) {
         // Ищем в сессии корзины уже добавленные товары, и добавляем количество, если есть
         const callbackBtnId = `product_${product.id}`
         const cartProduct = cartProducts.find((cartProduct => cartProduct.id === callbackBtnId))
         const btnData = {
            product: [{ text: product.name, callback_data: callbackBtnId }],
            control: this.controlButtons(callbackBtnId, cartProduct)
         }
         buttons.push(btnData.product, btnData.control)
      }
      buttons.push(
         [{
            text: 'Выберите тару:', callback_data: `select_containers`
         }],
         this.containersButtons(containerId),
         [{
            text: 'ПОДТВЕРДИТЬ ЗАКАЗ 🍺', callback_data: `submit_order`
         }]
     )
     return buttons
   }

   controlButtons(productId, cartProduct) {
      let col = 0
      if(cartProduct) col = cartProduct.col
      return [
         { text: '-', callback_data: `minus__${productId}` },
         { text: col, callback_data: `total__${productId}` },
         { text: '+', callback_data: `plus__${productId}` }
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
            const { price } = await this.productsRepo.getPrice(cartProduct.id)
            summ += (price * cartProduct.col)
         }
      }
      return summ
   }
}