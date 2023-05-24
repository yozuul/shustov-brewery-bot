import { Injectable, OnModuleInit } from '@nestjs/common'
import { Cron } from '@nestjs/schedule';

import { BotService } from '@app/bot/bot.service';
import { OrsderService, ProductService } from '@app/database'
import { GoogleSheetsService } from 'src/google-sheets/google-sheets.service';


@Injectable()
export class CheckerService implements OnModuleInit {
   constructor(
      private botService: BotService,
      private tableService: GoogleSheetsService,
      private orderRepo: OrsderService,
      private productsRepo: ProductService,
   ) {}

   // @Cron('0 * * * * *')
   // handleCron() {
   // }

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

   dateChecker(tomorrowOrders) {
      console.log('Новых заказов на завтра всего:', tomorrowOrders.length)
      let ordersTimeToday = []
      if(tomorrowOrders.length > 0) {

      }
      console.log('Вчерашних заказов к рассылке:', ordersTimeToday.length)
      return tomorrowOrders
   }

   async checkOrders() {
      let sended = true
      console.log('+CheckerService [checkOrders]')
      let todayOrders = await this.orderRepo.getTodayOrders()
      console.log('Новых заказов на сегодня к рассылке:', todayOrders.length)
      let tomorrowOrders: any = await this.orderRepo.getTommorowOrders()
      tomorrowOrders = this.dateChecker(tomorrowOrders)
      const currentOrders = [...todayOrders, ...tomorrowOrders]
      if(currentOrders.length > 0) {
         for (let order of currentOrders) {
            try {
               await this.botService.sendOrdersNotify(order)
            } catch (error) {
               console.log(error)
               sended = false
            }
            try {
               await this.tableService.pushOrder(order)
            } catch (error) {
               console.log(error)
               sended = false
            }
            if(sended) {
               this.orderRepo.updateOrderNotifyStatus(order.id)
            }
         }
         console.log('Рассылка выполнена:', sended)
      }
   }

   onModuleInit() {
      // this.checkProducts()
      // this.checkOrders()
   }
}