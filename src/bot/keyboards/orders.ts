import { USERS_BUTTON } from '@app/common/constants';
import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf'

@Injectable()
export class OrdersKeyboard {
   startedOrders() {
      const buttons = [
         Markup.button.callback(
            USERS_BUTTON.STARTED.ABOUT.TEXT,
            USERS_BUTTON.STARTED.ABOUT.ACTION
         ),
         Markup.button.callback(
            USERS_BUTTON.STARTED.PRODUCTS.TEXT,
            USERS_BUTTON.STARTED.PRODUCTS.ACTION
         ),
         Markup.button.callback(
            USERS_BUTTON.STARTED.ORDERS.TEXT,
            USERS_BUTTON.STARTED.ORDERS.ACTION
         ),
      ]
      return Markup.keyboard(buttons, { columns: 2 }).resize()
   }
}