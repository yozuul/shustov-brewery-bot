import { Scene, SceneEnter, Hears, On, Message, Ctx, Start, Sender } from 'nestjs-telegraf';
import { Telegraf, Markup } from 'telegraf';
import { UpdateType as TelegrafUpdateType } from 'telegraf/typings/telegram-types';

import { SessionContext } from '@app/common/interfaces';
import { USERS_BUTTON, USERS_SCENE } from '@app/common/constants';
import { SceneContext } from '@app/common/interfaces';
import {UpdateType} from '@app/common/update-type.decorator';
import {NavigationKeyboard} from '../keyboards/navigation';

@Scene(USERS_SCENE.ORDERS)
export class UsersOrdersScene {
   constructor(
      private readonly navigationKeyboard: NavigationKeyboard
      // private readonly bot: Telegraf<SessionContext>,
      // private areaService: AreasService,
      // private fileService: FilesService
   ) {}
   @On('callback_query')
   async submitOrdersHandler(@Ctx() ctx: SceneContext) {
      const query = ctx.update['callback_query']
      if(query.data === 'submit')
      ctx.scene.enter(USERS_SCENE.CART)
   }
   @SceneEnter()
   async onSceneEnter1(@Ctx() ctx: SceneContext, @Sender('id') senderId: number ) {
      await ctx.reply('🍻',
         this.navigationKeyboard.backSubmitButton()
      )
      const control1 = [
         {
            text: '-', callback_data: `channel_1`
         },
         {
            text: '+', callback_data: `channel_1`
         }
      ]
      const control2 = [
         {
            text: '-', callback_data: `channel_1`
         },
         {
            text: '0', callback_data: `channel_1`
         },
         {
            text: '+', callback_data: `channel_1`
         }
      ]
      const currentChannelsMenu = await ctx.reply(`Заказ на сумму 0 руб.`, {
         reply_markup: {
            inline_keyboard: [
               [
                  {
                     text: 'Чешское нефильтрованное (2)', callback_data: `channel_1`
                  },
               ],
               control1,
               [
                  {
                     text: 'Чешское фильтрованное (0)', callback_data: `channel_1`
                  },
               ],
               control1,
               [
                  {
                     text: 'Немецкое фильтрованное (3)', callback_data: `channel_1`
                  },
               ],
               control1,
               [
                  {
                     text: 'Немецкое нефильтрованное (0)', callback_data: `channel_1`
                  },
               ],
               control1,
               [
                  {
                     text: 'Тёмное (0)', callback_data: `channel_1`
                  },
               ],
               control1,
               [
                  {
                     text: 'Вишневое (0)', callback_data: `channel_1`
                  },
               ],
               control1,
               [
                  {
                     text: 'ПОДТВЕРДИТЬ ЗАКАЗ 🍺', callback_data: `submit`
                  }
               ],
            ]
         }
      })
      await ctx.reply('Вариант 2')
      await ctx.reply('🍻')
      const currentChannelsMenu2 = await ctx.reply(`Заказ на сумму 0 руб.`, {
         reply_markup: {
            inline_keyboard: [
               [
                  {
                     text: 'Чешское нефильтрованное', callback_data: `channel_1`
                  },
               ],
               control2,
               [
                  {
                     text: 'Чешское фильтрованное', callback_data: `channel_1`
                  },
               ],
               control2,
               [
                  {
                     text: 'Немецкое фильтрованное', callback_data: `channel_1`
                  },
               ],
               control2,
               [
                  {
                     text: 'Немецкое нефильтрованное', callback_data: `channel_1`
                  },
               ],
               control2,
               [
                  {
                     text: 'Тёмное', callback_data: `channel_1`
                  },
               ],
               control2,
               [
                  {
                     text: 'Вишневое', callback_data: `channel_1`
                  },
               ],
               control2,
               [
                  {
                     text: 'ПОДТВЕРДИТЬ ЗАКАЗ 🍺', callback_data: `submit`
                  }
               ],
            ]
         }
      })
   }
   @Start()
   async onStart(ctx: SceneContext) {
      ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @Hears(USERS_BUTTON.BACK.TEXT)
   leaveSceneHandler(@Ctx() ctx: SceneContext) {
      ctx.scene.enter(USERS_SCENE.STARTED)
   }

   @On('message')
   async msgHandler(ctx: SessionContext) {
   }
}