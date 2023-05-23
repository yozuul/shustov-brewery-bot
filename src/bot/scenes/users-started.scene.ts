import { Scene, SceneEnter, Hears, On, Ctx, Start, Sender } from 'nestjs-telegraf'

import { USERS_BUTTON, USERS_SCENE } from '@app/common/constants'
import { SessionContext } from '@app/common/interfaces'
import { AuthGuard } from '@app/common/guard'

import { NavigationKeyboard } from '@bot/keyboards'
import { trashCleaner}  from '@app/common/utils'

@Scene(USERS_SCENE.STARTED)
export class UserStartedScene {
   constructor(
      private readonly navigationKeyboard: NavigationKeyboard
   ) {}
   @Start()
   async onStart(@Ctx() ctx: SessionContext) {
      await ctx.reply(
         'Добро пожаловать в наш Телеграм бот!\nТут можно узнать о нашей пивоварне, познакомиться с производимыми сортами, а также сделать предварительный заказ на нашу продукцию к нужному времени.',
         this.navigationKeyboard.startedUsers()
      )
      await ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @SceneEnter()
   async onSceneEnter(@Ctx() ctx: SessionContext) {
      await trashCleaner(ctx)
      console.log('Enter Scene ::', USERS_SCENE.STARTED)
      await ctx.reply('Выберите интересующий раздел:',
         this.navigationKeyboard.startedUsers()
      )
   }
   // О пивоварне
   @Hears(USERS_BUTTON.STARTED.ABOUT.TEXT)
   async aboutSceneHandler(@Ctx() ctx: SessionContext) {
      await ctx.scene.enter(USERS_SCENE.ABOUT)
   }
   // Сорта
   @Hears(USERS_BUTTON.STARTED.PRODUCTS.TEXT)
   async productsSceneHandler(@Ctx() ctx: SessionContext) {
      await ctx.scene.enter(USERS_SCENE.PRODUCTS)
   }
   // Бонусы
   @Hears(USERS_BUTTON.STARTED.BONUS.TEXT)
   async bonusSceneHandler(@Ctx() ctx: SessionContext) {
      await ctx.scene.enter(USERS_SCENE.BONUS)
   }
   // Заказ
   @Hears(USERS_BUTTON.STARTED.ORDERS.TEXT)
   async ordersSceneHandler(@Ctx() ctx: SessionContext) {
      ctx.session.cart = {
         products: [], container_id: 'container_1', day: 'day_near', time: { h: null, m: null }
      }
      await ctx.scene.enter(USERS_SCENE.ORDERS)
      // menu_id: null, menu_title_id: null,
   }
   @On('message')
   async msgHandler(@Ctx() ctx: SessionContext) {
      await ctx.reply('Выберите интересующий раздел:',
         this.navigationKeyboard.startedUsers()
      )
      // await ctx_session.reply('Выберите интересующий раздел:',
      //    this.navigationKeyboard.startedUsers()
      // )
   }
}