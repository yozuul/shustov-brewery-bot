import { Injectable, UseGuards } from '@nestjs/common';
import { Scene, SceneEnter, SceneLeave, Command, Hears, On, Ctx, Message, Start } from 'nestjs-telegraf';
import { Markup } from 'telegraf';

import { ADMIN_AREAS_SCENE, ADMIN_CHANNELS_SCENE, ADMIN_STARTED_SCENE } from '../../app.constants';
import { Context } from '../../common/interfaces/context.interface';
import { AreasService } from 'src/areas/areas.service';
import { UsersService } from 'src/users/users.service';

import {
   adminStartedKeyboard,
   areaEditKeyboard,
   areasListKeyboard,
   addNewAreaKeyboard,
   backKeyboard,
} from '../keyboards/keyboard';
import { AuthGuard } from 'src/common/guard';

@UseGuards(AuthGuard)
@Scene(ADMIN_AREAS_SCENE)
export class AdminAreasScene {
   constructor(
      private areaService: AreasService,
      private userService: UsersService,
      // private parserService: ParserService
   ) {}
   @Start()
   async onStart(ctx: Context) {
      ctx['scene'].leave()
   }
   @SceneEnter()
   async onSceneEnter(ctx) {
      console.log('Admin areas scene ENTER');
      await this.areaSettingsStarted(ctx)
   }
   @On('callback_query')
   async deleteProduct(@Ctx() ctx: Context) {
      const query = ctx.update['callback_query'].data
      const areaId = parseInt(query.split('area_')[1])
      if(areaId) {
         console.log(areaId)
         ctx.session['area'] = areaId
         const selectedArea = await this.areaService.findById(areaId)
         await ctx.reply(selectedArea.name.toUpperCase())
         await ctx.reply(`Чтобы переименовать участок, отправьте его название:`,
            Markup.keyboard(areaEditKeyboard, { columns: 2 }).resize()
         )
      }
   }
   @Hears('👈 Назад')
   async back(ctx) {
      // ctx['scene'].enter(ADMIN_AREAS_SCENE)
      ctx['scene'].enter(ADMIN_STARTED_SCENE)
      return
   }
   @Hears('❌ Удалить участок')
   async deleteArea(ctx) {
      const areaId = ctx.session['area']
      // console.log(areaId)
      if(areaId) {
         await this.areaService.deleteArea(areaId)
         ctx.session['area'] = null
         await this.areaSettingsStarted(ctx)
         await this.sendNotify(ctx)
      }
   }
   @Hears('➕ Новый участок')
   async addArea(ctx) {
      await ctx.reply('Отправьте название участка в чат', backKeyboard)
      ctx.session.path = 'newArea'
   }
   @Hears('📞 Изменить телефон')
   async editPhone(ctx) {
      ctx.session.path = 'editPhone'
      const user = await this.userService.getUser()
      if(!user) {
         await ctx.reply('Телефон операторов участков не задан')
      } else {
         await ctx.reply(`Текущий привязанный телефон ${user.phone}`)
      }
      await ctx.reply(`Для изменения телефона, отправьте его в чат в формате \n+7xxxxxxxxxx`)
   }

   @On('message')
   async testMessage(@Message('text') text: string, @Ctx() ctx: Context) {
      if(ctx.session['path'] === 'editPhone') {
         const phone = text.split('+')[1]
         if(parseInt(phone).toString().length !== 11) {
            await ctx.reply('Проверьте правильность указанного телефона')
            return
         } else {
            await this.userService.adduserPhone(text)
            ctx.session['path'] = 'home'
            await this.areaSettingsStarted(ctx)
            return
         }
      }
      if(ctx.session['path'] === 'newArea') {
         await this.areaService.addArea({ name: text })
         ctx.session['path'] = 'home'
         await this.areaSettingsStarted(ctx)
         await this.sendNotify(ctx)
         return
      }
      const areaId = ctx.session['area']
      if(areaId) {
         await this.areaService.renameArea(areaId, text)
         ctx.session['area'] = null
         await this.areaSettingsStarted(ctx)
         await this.sendNotify(ctx)
         return
      }
   }
   async areaSettingsStarted(ctx) {
      console.log('areas settings')
      await ctx.reply('УПРАВЛЕНИЕ УЧАСТКАМИ',
         Markup.keyboard(addNewAreaKeyboard, { columns: 2 }).resize()
      )
      const currentAreas = await this.areaService.getAllAreas()
      // console.log(areasListKeyboard(currentAreas))
      await ctx.reply(`Выберите участок для редактирования:`, {
         reply_markup: areasListKeyboard(currentAreas)
      })
   }

   async sendNotify(ctx) {
      console.log('send notify')
      const user = await this.userService.getUser()
      const admin = await this.userService.getAllAdmin()
      if(user) {
         try {
            await ctx.telegram.sendMessage(user.tgId, 'Данные по участкам были изменены.\nВыполните команду /start')
         } catch (error) {
            admin.map(async (admin) => {
               await ctx.telegram.sendMessage(admin.tgId, 'Пользователь отписался от бота')
            })
         }
      }
   }
   async startedKeyboard(ctx) {
      console.log('started')
      const areas = await this.areaService.getAllAreas()
      const user = await this.userService.getUser()
      if(areas.length === 0) {
         await ctx.reply('Участки не заданы администратором')
      } else {
         await ctx.reply('Данные по участкам были изменены',
            Markup.keyboard(
            areas.map((area) => Markup.button.callback(area.name, area.name)),
            { columns: 2 }).resize()
         )
      }
   }
}
