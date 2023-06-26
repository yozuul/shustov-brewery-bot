import { Scene, SceneEnter, Hears, On, Ctx, Start, Sender } from 'nestjs-telegraf';

import { USERS_BUTTON, USERS_SCENE } from '@app/common/constants';
import { UserService } from '@app/database';
import { SessionContext } from '@app/common/interfaces';
import { NavigationKeyboard } from '@bot/keyboards';
import { SbisService } from 'src/sbis/sbis.service';

@Scene(USERS_SCENE.BONUS)
export class UsersBonusScene {
   constructor(
      private readonly navigationKeyboard: NavigationKeyboard,
      private readonly sbisService: SbisService,
      private readonly userRepo: UserService
   ) {}
   @SceneEnter()
   async onSceneEnter(@Ctx() ctx: SessionContext, @Sender('id') tgId) {
      let navButton = null
      let msgText = ''
      const isAuthUser = await this.userRepo.isUserAuth(tgId)
      if(isAuthUser) {
         msgText += `Участник бонусной программы: ${isAuthUser.name}\n`
         msgText = `Ваш телефон: ${isAuthUser.phone}`
         navButton = this.navigationKeyboard.backButton()
      } else {
         msgText = 'Наша бонусная программа позволяет копить баллы и тратить их на любимые пенные напитки.\nТакже, участникам бонусной программы доступная возможность делать предзаказы к нужному времени через нашего бота.\nЧтобы принять участие в программе, необходимо обратиться к продавцу на торговую точку.\nЕсли вы уже являетесь участником бонусной программы, нажмите кнопку "ПОДТВЕРДИТЬ ТЕЛЕФОН"'
         navButton = this.navigationKeyboard.backAuthButton()
      }
      await ctx.reply(msgText, navButton)
      if(isAuthUser) {
         await ctx.reply('Обновлям данные о ваших бонусах.')
         const isSbisUser = await this.sbisService.findUser(isAuthUser.phone)
         if(isSbisUser) {
            await ctx.reply('✅ Номер телефона проверен')
            const bonuses = await this.sbisService.getBonuses(isSbisUser)
            if(bonuses.error) {
               await ctx.reply(`❌ Не удалось получить баланс бонусов.\nОтвет сервера: ${bonuses.error.message}`)
            }
            if(!bonuses.error) {
               await ctx.reply(`✅ Баланс ваших бонусов: ${bonuses.message}`)
               await this.userRepo.updateBonuse(tgId, bonuses.message)
            }
         }
         if(!isSbisUser) {
            await ctx.reply(
               `❌ Номер телефона ${isAuthUser.phone} не найден в нашей системе.\nПожалуйста, подтвердите свой номер, нажав кнопку ниже`,
               this.navigationKeyboard.backAuthButton()
            )
         }
      }
   }

   @On('contact')
   async handlerContacts(@Ctx() ctx: SessionContext) {
      const message = ctx.update['message']
      const userPhone = parseInt(message?.contact?.phone_number)
      try {
         await ctx.deleteMessage()
      } catch (error) {
         console.log(error)
      }
      if(!userPhone) {
         ctx.reply('Не смогли проверить ваш телефон')
         return false
      }
      let userPhoneStr =  userPhone.toString()
      if(userPhoneStr.startsWith('7')) {
         userPhoneStr = '8' + userPhoneStr.slice(1)
      }
      const sbisUser = await this.sbisService.findUser(userPhoneStr)
      if(!sbisUser) {
         ctx.reply(`❌ Номер ${userPhoneStr} не зарегистрирован в качестве участника бонусной программы\nПожалуйста, обратитесь к нашему продавцу`)
         return false
      }
      const arr = sbisUser
      const userName = sbisUser[6] && arr[7] ? `${arr[6]} ${arr[7]}` : arr[6]
      const bonusBalanse = await this.sbisService.getBonuses(arr[0])
      let reply = ''
      reply += `${userName}, мы рады что вы с нами!\n`
      if(bonusBalanse) {
         reply += `Баланс ваших бонусов составляет ${parseInt(bonusBalanse)}\n`
      }
      await ctx.reply(reply, this.navigationKeyboard.backButton())
   }
   @Start()
   async onStart(ctx: SessionContext) {
      ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @Hears(USERS_BUTTON.BACK.TEXT)
   leaveSceneHandler(@Ctx() ctx: SessionContext) {
      ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @On('message')
   async onSceneMsg(@Sender('id') senderId: number, ctx: SessionContext ) {

   }
}