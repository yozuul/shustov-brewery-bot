import { Scene, SceneEnter, Hears, On, Message, Ctx, Start, Sender } from 'nestjs-telegraf';
import { Telegraf, Markup } from 'telegraf';
import { UpdateType as TelegrafUpdateType } from 'telegraf/typings/telegram-types';

import { SessionContext } from '@app/common/interfaces';
import { USERS_BUTTON, USERS_SCENE } from '@app/common/constants';
import { SceneContext } from '@app/common/interfaces';
import {UpdateType} from '@app/common/update-type.decorator';
import {NavigationKeyboard} from '../keyboards/navigation';

@Scene(USERS_SCENE.CART)
export class UsersCartScene {
   constructor(
      private readonly navigationKeyboard: NavigationKeyboard
      // private readonly bot: Telegraf<SessionContext>,
      // private areaService: AreasService,
      // private fileService: FilesService
   ) {}
   @Start()
   async onStart(ctx: SceneContext) {
      ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @Hears(USERS_BUTTON.BACK.TEXT)
   leaveSceneHandler(@Ctx() ctx: SceneContext) {
      ctx.scene.enter(USERS_SCENE.ORDERS)
   }
   @On('callback_query')
   async submitOrdersHandler(@Ctx() ctx: SceneContext) {
      const query = ctx.update['callback_query']
      console.log(query.data)
      if(query.data === 'place_order') {
         ctx.answerCbQuery('Оформление онлайн заказа доступно только участникам бонусной программы.\nДля проверки статуса, нажмите на кнопку "ПОДТВЕРДИТЬ ТЕЛЕФОН" [или оплатить онлайн?]', {
            show_alert: true
         });
      }
   }
   @SceneEnter()
   async onSceneEnter1(@Ctx() ctx: SceneContext, @Sender('id') senderId: number ) {
      const text = '<b>Чешское нефильтрованное: 3 литра</b>\nСумма: 150 руб (75 руб./литр)\n---\n<b>Немецкое фильтрованное: 2 литра</b>​\nСумма: 160 руб (80 руб./литр)\n---\n<b>Темное: 4 литра</b>​\nСумма: 440 руб (110 руб./литр)\n---\n<b>💳 СУММА К ОПЛАТЕ: 750 руб.</b>'
      await ctx.reply('Проверьте свой заказ, укажите время к которому его подготовить, и необходимую тару​:', this.navigationKeyboard.backAuthButton())
      await ctx.reply(text, {
            parse_mode: 'HTML',
            reply_markup: {
               inline_keyboard: [
                  [
                     {
                        text: '✅ Тара 1.5 литра', callback_data: `channel_1`
                     },
                     {
                        text: 'Тара 1 литр', callback_data: `channel_1`
                     },
                  ],
                  [
                     {
                        text: '🕗', callback_data: `channel_1`
                     }
                  ],
                  [
                     {
                        text: '-', callback_data: `channel_1`
                     },
                     {
                        text: '+', callback_data: `channel_1`
                     },
                     {
                        text: ' 18:20 ', callback_data: `channel_1`
                     },
                     {
                        text: '+', callback_data: `channel_1`
                     },
                     {
                        text: '-', callback_data: `channel_1`
                     },
                  ],
                  [
                     {
                        text: '✅ Сегодня', callback_data: `channel_1`
                     },
                     {
                        text: 'Завтра', callback_data: `channel_1`
                     },
                     {
                        text: 'Послезавтра', callback_data: `channel_1`
                     }
                  ],
                  [
                     {
                        text: 'ОФОРМЛЕНИЕ ЗАКАЗ', callback_data: `place_order`,
                     }
                  ],
               ]
            }
         }
      )

      await ctx.reply('Вариант 2. С большими цифрами.\nВ одну линию с кнопками они не умещаются')
      await ctx.reply(text, {
            parse_mode: 'HTML',
            reply_markup: {
               inline_keyboard: [
                  [
                     {
                        text: '✅ Тара 1.5 литра', callback_data: `channel_1`
                     },
                     {
                        text: 'Тара 1 литр', callback_data: `channel_1`
                     },
                  ],
                  [
                     {
                        text: '-', callback_data: `channel_1`
                     },
                     {
                        text: '+', callback_data: `channel_1`
                     },
                     {
                        text: 'ВРЕМЯ', callback_data: `channel_1`
                     },
                     {
                        text: '+', callback_data: `channel_1`
                     },
                     {
                        text: '-', callback_data: `channel_1`
                     },
                  ],
                  [
                     {
                        text: '1️⃣8️⃣:2️⃣0️⃣', callback_data: `channel_1`
                     }
                  ],
                  [
                     {
                        text: '✅ Сегодня', callback_data: `channel_1`
                     },
                     {
                        text: 'Завтра', callback_data: `channel_1`
                     },
                     {
                        text: 'Послезавтра', callback_data: `channel_1`
                     }
                  ],
                  [
                     {
                        text: 'ОФОРМЛЕНИЕ ЗАКАЗ', callback_data: `place_order`,
                     }
                  ],
               ]
            }
         }
      )
      // await ctx.reply('Авторизация по номеру телефона', {
      //    reply_markup: {
      //       keyboard: [[
      //          { text: 'Вход',
      //             request_contact: true },
      //          { text: 'Отмена' }
      //       ]], one_time_keyboard: true, force_reply: true }
      //    })
      // const time = await ctx.reply('Время', {
      //    reply_markup: {
      //       inline_keyboard: [
      //          [
      //             {
      //                text: 'КО ВРЕМЕНИ', callback_data: `channel_1`
      //             }
      //          ],
      //          [
      //             {
      //                text: '-', callback_data: `channel_1`
      //             },
      //             {
      //                text: '+', callback_data: `channel_1`
      //             },
      //             {
      //                text: '18:20', callback_data: `channel_1`
      //             },
      //             {
      //                text: '+', callback_data: `channel_1`
      //             },
      //             {
      //                text: '-', callback_data: `channel_1`
      //             },
      //          ],
      //          [
      //             {
      //                text: 'ПОДТВЕРДИТЬ ЗАКАЗ', callback_data: `channel_1`
      //             }
      //          ],
      //       ]
      //    }
      // })
   }
   @On('message')
   async onSceneEnter(@Sender('id') senderId: number, ctx: SceneContext ) {
   }
}