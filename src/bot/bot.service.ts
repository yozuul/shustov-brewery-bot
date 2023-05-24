import { Injectable, OnModuleInit } from '@nestjs/common'
import { Telegraf } from 'telegraf'
import { InjectBot } from 'nestjs-telegraf'

import { SessionContext } from '@app/common/interfaces'
import { dateFormatter, phoneFormatter } from '@app/common/utils'

@Injectable()
export class BotService implements OnModuleInit {
   constructor(
      @InjectBot()
      private bot: Telegraf<SessionContext>
   ) {}

   async sendOrdersNotify(activeOrder) {
      const ordersChannelId = parseInt(-100 + process.env.ORDERS_CHANNEL)
      const orderText = this.prepareOrdersText(activeOrder)
      await this.bot.telegram.sendMessage(ordersChannelId, orderText, {
         parse_mode: 'HTML'
      })
   }

   prepareOrdersText(order) {
      const { phoneDig, formattedPhone } = phoneFormatter(order.userPhone)
      const date = dateFormatter(order.date)
      let text = ``
      text += `<b>Заказ # ${order.orderNum} | ${phoneDig}</b>\n`
      text += `${date}\n`
      text += `Покупатель: ${order.userName}\n`
      text += `Телефон: ${formattedPhone}\n`
      text += `\n`
      for (let product of order.orderList) {
         text += `▫️ ${product['product.name']} - ${product.quantity} л.\n`
      }
      text += `\n`
      text += `Тара: ${order.container}\n`
      text += `Сумма заказа: 560 руб.\n`
      return text
   }

   async onModuleInit() {
   }
}
