import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf'

@Injectable()
export class SceneControlKeyboard {

   startedUsers() {
      const buttons = [
         Markup.button.callback('О пивоварне', 'about'),
         Markup.button.callback('Сорта', 'sorts'),
         Markup.button.callback('Онлайн заказ', 'orders'),
      ]
      return Markup.keyboard(buttons, {
         columns: 2
      }).resize()
   }
}