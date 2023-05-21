import { Injectable, UseGuards } from '@nestjs/common'
import { Scene, SceneEnter, Hears, On, Message, Ctx, Start } from 'nestjs-telegraf'
import { USERS_BUTTON, USERS_SCENE } from '@app/common/constants'
import { SceneContext, SessionContext } from '@app/common/interfaces'
import { AuthGuard } from 'src/common/guard'
import { Telegraf, Markup } from 'telegraf'
import { NavigationKeyboard } from '@bot/keyboards'

@Scene(USERS_SCENE.STARTED)
export class UserStartedScene {
   constructor(
      // private readonly bot: Telegraf<SessionContext>,
      private readonly navigationKeyboard: NavigationKeyboard
      // private areaService: AreasService,
      // private fileService: FilesService
   ) {}
   @Start()
   async onStart(ctx: SceneContext) {
      await ctx.reply(
         'Добро пожаловать в наш Телеграм бот!\nТут можно узнать о нашей пивоварне, познакомиться с производимыми сортами, а также сделать предварительный заказ на нашу продукцию к нужному времени.',
         this.navigationKeyboard.startedUsers()
      )
      ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @SceneEnter()
   async onSceneEnter(ctx_session: SessionContext) {
      console.log('Enter Scene ::', USERS_SCENE.STARTED)
      await ctx_session.reply('Выберите интересующий раздел:',
         this.navigationKeyboard.startedUsers()
      )
   }
   // О пивоварне
   @Hears(USERS_BUTTON.STARTED.ABOUT.TEXT)
   aboutSceneHandler(ctx: SceneContext) {
      ctx.scene.enter(USERS_SCENE.ABOUT)
   }
   // Сорта
   @Hears(USERS_BUTTON.STARTED.PRODUCTS.TEXT)
   productsSceneHandler(ctx: SceneContext) {
      ctx.scene.enter(USERS_SCENE.PRODUCTS)
   }
   // Бонусы
   @Hears(USERS_BUTTON.STARTED.BONUS.TEXT)
   bonusSceneHandler(ctx: SceneContext) {
      ctx.scene.enter(USERS_SCENE.BONUS)
   }
   // Заказ
   @Hears(USERS_BUTTON.STARTED.ORDERS.TEXT)
   ordersSceneHandler(ctx: SceneContext) {
      ctx.scene.enter(USERS_SCENE.ORDERS)
   }
   @On('message')
   async msgHandler(ctx: SessionContext) {
      await ctx.reply('Выберите интересующий раздел:',
         this.navigationKeyboard.startedUsers()
      )
      // await ctx_session.reply('Выберите интересующий раздел:',
      //    this.navigationKeyboard.startedUsers()
      // )
   }
}