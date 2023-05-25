import { Scene, SceneEnter, Hears, On, Ctx, Start, Sender } from 'nestjs-telegraf'
import { UseGuards } from '@nestjs/common'

import { ADMINS_SCENE, ADMIN_BUTTON, USERS_BUTTON, USERS_SCENE } from '@app/common/constants'
import { SessionContext } from '@app/common/interfaces'

import { NavigationKeyboard } from '@bot/keyboards'
import { AuthGuard } from '@app/common/guard'
import { trashCleaner}  from '@app/common/utils'
import { UserService, SettingsService, ProductService } from '@app/database'

@Scene(USERS_SCENE.STARTED)
export class UserStartedScene {
   constructor(
      private readonly navigationKeyboard: NavigationKeyboard,
      private readonly userRepo: UserService,
      private readonly settingsRepo: SettingsService,
      private readonly productsRepo: ProductService
   ) {}
   @Start()
   async onStart(@Ctx() ctx: SessionContext, @Sender('id') tgId) {
      await ctx.reply(
         'Добро пожаловать в наш Телеграм бот!\nТут можно узнать о нашей пивоварне, познакомиться с производимыми сортами, а также сделать предварительный заказ на нашу продукцию к нужному времени.'
      )
      await ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @SceneEnter()
   async onSceneEnter(@Ctx() ctx: SessionContext, @Sender('id') tgId) {
      const authUser = await this.userRepo.isUserAuth(tgId)
      // await this.addAdmin(tgId)
      this.cleanSession(ctx)
      await trashCleaner(ctx)
      console.log('Enter Scene ::', USERS_SCENE.STARTED)
      await ctx.reply(
         'Выберите интересующий раздел:',
         this.navigationKeyboard.startedUsers(authUser)
      )
   }
   // О пивоварне
   @Hears(USERS_BUTTON.STARTED.ABOUT.TEXT)
   async aboutSceneHandler(@Ctx() ctx: SessionContext) {
      await ctx.scene.enter(USERS_SCENE.ABOUT)
   }
   // Сорта
   @Hears(USERS_BUTTON.STARTED.PRODUCTS.TEXT)
   async productSceneHandler(@Ctx() ctx: SessionContext) {
      await ctx.scene.enter(USERS_SCENE.PRODUCTS)
   }
   // Бонусы
   @Hears(/Бонусы \(\d+\)/)
   async bonusSceneHandler(@Ctx() ctx: SessionContext) {
      await ctx.scene.enter(USERS_SCENE.BONUS)
   }
   // Заказ
   @Hears(USERS_BUTTON.STARTED.ORDERS.TEXT)
   async orderSceneHandler(@Ctx() ctx: SessionContext) {
      const products = await this.productsRepo.getAllForCart()
      let settings = await this.settingsRepo.getSettings()
      if(!settings) {
         settings = await this.settingsRepo.addDefault()
      }
      if(settings.closed || products.length === 0) {
         await ctx.scene.enter(USERS_SCENE.CLOSED)
      } else {
         this.cleanSession(ctx)
         await ctx.scene.enter(USERS_SCENE.ORDERS)
      }
   }
   // Настроки
   // @UseGuards(AuthGuard)
   @Hears(ADMIN_BUTTON.SETTINGS.TEXT)
   async settingSceneHandler(@Ctx() ctx: SessionContext, @Sender('id') tgId) {
      const user = await this.userRepo.isUserAuth(tgId)
      if(!user || user.role !== 'admin') {
         await ctx.scene.enter(USERS_SCENE.STARTED)
      }
      if(user?.role === 'admin') {
         await ctx.scene.enter(ADMINS_SCENE.SETTINGS)
      }
   }
   @On('new_chat_members')
   async msgChantMemeber(@Ctx() ctx: SessionContext) {
      console.log(ctx)
   }
   @On('my_chat_member')
   async myChantMemeber(@Ctx() ctx: SessionContext) {
      console.log(ctx)
   }
   cleanSession(ctx) {
      ctx.session.cart = {
         db_products: [],
         added_products: [], summ: 0, orderText: null,
         container_id: 'container_1',
         day: 'day_near', time: null
      }
   }
   async addAdmin(tgId) {
      await this.userRepo.addUser({
         role: 'admin',
         name: 'Ден',
         tgId: tgId,
         phone: '89272113330',
         bonus: 0
      })
   }
}