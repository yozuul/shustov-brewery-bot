import { Injectable, OnModuleInit } from '@nestjs/common'
import { Cron } from '@nestjs/schedule';

import { BotService } from '@app/bot/bot.service';
import { OrderService, ProductService } from '@app/database'
import { GoogleSheetsService } from 'src/google-sheets/google-sheets.service';


@Injectable()
export class CheckerService implements OnModuleInit {
   constructor(
      private botService: BotService,
      private tableService: GoogleSheetsService,
      private orderRepo: OrderService,
      private productsRepo: ProductService,
   ) {}

   @Cron('0 * * * * *')
   async handleOrdersCheck() {
      try {
         await this.checkOrders()
      } catch (error) {
         console.log(error)
      }
   }
   @Cron('0 */5 * * * *')
   async handleProductsCheck() {
      try {
         this.checkProducts()
      } catch (error) {
         console.log(error)
      }
   }

   // Проверка заказов
   async checkOrders() {
      let sended = false
      console.log('+CheckerService [checkOrders]')
      let todayOrders = await this.orderRepo.getOrders('today', false)
      console.log('Новых заказов на сегодня к рассылке:', todayOrders.length)
      let tomorrowOrders: any = await this.orderRepo.getOrders('tomorrow', false)
      const currentOrders = [...todayOrders, ...tomorrowOrders]
      if(currentOrders.length > 0) {
         for (let order of currentOrders) {
            if(order.orderId) {
               try {
                  await this.botService.sendOrdersNotify(order)
                  sended = true
               } catch (error) {
                  console.log(error)
                  sended = false
               }
               try {
                  await this.tableService.pushOrder(order)
                  sended = true
               } catch (error) {
                  console.log(error)
                  sended = false
               }
               if(sended) {
                  await this.orderRepo.updateOrderNotifyStatus(order.orderId)
               }
            }
         }
         console.log('Рассылка выполнена:', sended)
      }
   }
   // Проверка заказов сделанных на завтра
   dateChecker(tomorrowOrders) {
      console.log('Новых заказов на завтра всего:', tomorrowOrders.length)
      let ordersTimeToday = []
      if(tomorrowOrders.length > 0) {
         for (let order of tomorrowOrders) {
            const currentTimePlus = new Date()
            currentTimePlus.setHours(currentTimePlus.getHours() + 1)
            if(currentTimePlus > new Date(order.date)) {
               ordersTimeToday.push(order)
            }
         }
      }
      console.log('Вчерашних заказов к рассылке:', ordersTimeToday.length)
      return ordersTimeToday
   }
   // Проверка товаров
   async checkProducts() {
      let updated = true
      console.log('+CheckerService [checkProducts]')
      const products = []
      try {
         const newProducts = await this.tableService.getProducts()
         for (let product of newProducts) {
            products.push({
               name: product.name,
               alc: product.alc,
               price: parseInt(product.price),
               callback_data: product.callback_data,
            })
         }
         await this.productsRepo.updateProducts(products)
      } catch (error) {
         updated = false
         console.log(error)
      }
      console.log('Обновление товаров выполнено:', updated)
   }

   onModuleInit() {
      // this.checkProducts()
      // this.checkOrders()
   }
}