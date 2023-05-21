import { Scene, SceneEnter, Hears, On, Message, Ctx, Start, Sender } from 'nestjs-telegraf';
import { Telegraf, Markup } from 'telegraf';
import { UpdateType as TelegrafUpdateType } from 'telegraf/typings/telegram-types';

import { SessionContext } from '@app/common/interfaces';
import { USERS_BUTTON, USERS_SCENE } from '@app/common/constants';
import { SceneContext } from '@app/common/interfaces';
import {UpdateType} from '@app/common/update-type.decorator';
import {NavigationKeyboard} from '../keyboards/navigation';

@Scene(USERS_SCENE.ABOUT)
export class UsersAboutScene {
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
      ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @SceneEnter()
   async onSceneEnter1(@Ctx() ctx: SceneContext, @Sender('id') senderId: number ) {
      await ctx.reply(
         'Пивоварня Шустова\nКто в нашей пивовране не бывал, тот Иркутска не видал!\nНайти нас можно по адресу: бульвар Гагарина, 38А\nТЦ СмайлМолл​Баумана, 233Б​3.7 помещение; 1 этаж​\nГрафик работы с 12:00 до 23:00. Тел. 8-927-221-66-88',
         await this.navigationKeyboard.backButton()
      )
      await ctx.telegram.sendLocation(senderId, 52.279577, 104.275836, {
         horizontal_accuracy: 5, proximity_alert_radius: 10
      })
   }
   @On('message')
   async onSceneEnter(@Sender('id') senderId: number, ctx: SceneContext ) {
   }
}