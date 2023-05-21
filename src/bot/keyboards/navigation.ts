import {USERS_BUTTON} from '@app/common/constants';
import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf'

@Injectable()
export class NavigationKeyboard {

   startedUsers() {
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
            USERS_BUTTON.STARTED.BONUS.TEXT,
            USERS_BUTTON.STARTED.BONUS.ACTION
         ),
         Markup.button.callback(
            USERS_BUTTON.STARTED.ORDERS.TEXT,
            USERS_BUTTON.STARTED.ORDERS.ACTION
         ),
      ]
      return Markup.keyboard(buttons, {
         columns: 2
      }).resize()
   }
   backButton() {
      return Markup.keyboard([
         Markup.button.callback(
            USERS_BUTTON.BACK.TEXT, USERS_BUTTON.BACK.ACTION
         )], {
         columns: 1
      }).resize()
   }
   backAuthButton() {
      return {
         reply_markup: {
         keyboard: [
            [
               { text: '📞 ПОДТВЕРДИТЬ ТЕЛЕФОН',
                  request_contact: true },
               { text: USERS_BUTTON.BACK.TEXT }
            ]
         ], columns: 2, resize_keyboard: true }
      }
      return Markup.keyboard([
         Markup.button.callback(
            '📞 ПОДТВЕРДИТЬ ТЕЛЕФОН', USERS_BUTTON.BACK.ACTION
         ),
         Markup.button.callback(
            USERS_BUTTON.BACK.TEXT, USERS_BUTTON.BACK.ACTION
         )], {
         columns: 2
      }).resize()
   }
   backSubmitButton() {
      return Markup.keyboard([
         Markup.button.callback(
            USERS_BUTTON.BACK.TEXT, USERS_BUTTON.BACK.ACTION
         )], {
         columns: 1
      }).resize()
   }
}