import { Scene, SceneEnter, Hears, On, Message, Ctx, Start, Sender } from 'nestjs-telegraf';
import { Telegraf, Markup } from 'telegraf';
import { UpdateType as TelegrafUpdateType } from 'telegraf/typings/telegram-types';

import { SessionContext } from '@app/common/interfaces';
import { USERS_BUTTON, USERS_SCENE } from '@app/common/constants';
import { SceneContext } from '@app/common/interfaces';
import {UpdateType} from '@app/common/update-type.decorator';
import {NavigationKeyboard} from '../keyboards/navigation';

@Scene(USERS_SCENE.BONUS)
export class UsersBonusScene {
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
         'Наша бонусная программа позволяет копить баллы и тратить их на любимые пенные напитки.\nТакже, участникам бонусной программы доступная возможность делать предзаказы к нужному времени через нашего бота.\nЧтобы принять участие в программе, необходимо обратиться к продавцу на торговую точку [зарегаться онлайн].\nЕсли вы уже являетесь участником бонусной программы, нажмите кнопку "ПОДТВЕРДИТЬ ТЕЛЕФОН"',
         await this.navigationKeyboard.backAuthButton()
      )
   }
   @On('message')
   async onSceneEnter(@Sender('id') senderId: number, ctx: SceneContext ) {
   }
}