import { Injectable, UseGuards } from '@nestjs/common';
import { Markup } from 'telegraf';
import { Scene, SceneEnter, Hears, On, Message, Ctx, Start } from 'nestjs-telegraf';
import { USER_ORDERS_SCENE } from '../../app.constants';
import { Context } from '../../common/interfaces/context.interface';
import { AreasService } from 'src/areas/areas.service';
import { backKeyboard } from '../keyboards/keyboard';
import { FilesService } from 'src/files/files.service';
import { AuthGuard } from 'src/common/guard';

@Scene(USER_ORDERS_SCENE)
export class UserStartedScene {
   constructor(
      private areaService: AreasService,
      private fileService: FilesService
   ) {}
   @Start()
   async onStart(ctx: Context) {
      ctx['scene'].leave()
   }
   @SceneEnter()
   async onSceneEnter(ctx: Context) {
      await this.startedKeyboard(ctx)
      ctx.session['uploadAreaId'] = null
   }
   @UseGuards(AuthGuard)
   @Hears('👈 Назад')
   async back(ctx) {
      ctx['scene'].enter(USER_STARTED_SCENE)
   }
   @UseGuards(AuthGuard)
   @On('document')
   async uploadDocument(ctx: Context) {
      if(ctx.session['uploadAreaId']) {
         const doc = ctx.update['message']?.document
         if(doc.file_name) {
            let isExces = false
            const extenion = {
               xls: doc.file_name.split('.xls'), xlsx: doc.file_name.split('.xlsx')
            }
            if(extenion.xls.length === 2 || extenion.xlsx.length === 2) {
               if((extenion.xls[1].length === 0) || extenion.xlsx[1].length === 0) {
                  isExces = true
                  const { name } = await this.areaService.findById(ctx.session['uploadAreaId'])
                  await this.fileService.addFile(
                     doc.file_name, doc.file_id, ctx.session['uploadAreaId']
                  )
                  await ctx.reply(`✅`)
                  const msg = await ctx.reply(`Отчёт участка "${name}" успешно загружен!`)
                  await ctx.telegram.deleteMessage(msg.chat.id, ctx.update['message'].message_id)
                  await this.startedKeyboard(ctx)
               }
            }
            if(!isExces) {
               await ctx.reply('Допустимые форматы к загрузке: *.xls или *.xlsx')
               return
            }
         }
      } else {
         await ctx.reply('Участок не выбран')
      }
   }
   @UseGuards(AuthGuard)
   @On('message')
   async testMessage(@Message('text') text: string, @Ctx() ctx: Context) {
      const isAreaExist = await this.areaService.findByName(text)
      if(isAreaExist) {
         await ctx.reply('📊')
         await ctx.reply(isAreaExist.name.toUpperCase())
         await ctx.reply('Загрузите отчёт', backKeyboard)
         ctx.session['uploadAreaId'] = isAreaExist.id
      } else {
         return
      }
   }

   async startedKeyboard(ctx) {
      const areas = await this.areaService.getAllAreas()
      const keyaboard = []
      if(areas.length === 0) {
         await ctx.reply('Участки не заданы администратором')
      } else {
         await ctx.reply('Для отправки отчёта, выберите свой участок:',
            Markup.keyboard(
            areas.map((area) => Markup.button.callback(area.name, area.name)),
            { columns: 2 }).resize()
         )
      }
   }
}
