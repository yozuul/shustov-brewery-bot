import { Scene, SceneEnter, Command, Hears, Start, On, Ctx, Message, InjectBot } from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';

import { ADMIN_AREAS_SCENE, ADMIN_CHANNELS_SCENE, ADMIN_STARTED_SCENE } from '../../app.constants';

import { Context } from '../../common/interfaces/context.interface';
import { ChannelService } from 'src/channels/channels.service';
import { SubscribesService } from 'src/subscribes/subscribes.service';
import { AreasService } from 'src/areas/areas.service';

import {
   addNewCHannelKeyboard,
   adminStartedKeyboard,
   backKeyboard,
   channelEditKeyboard,
   channelsListKeyboard
} from '../keyboards/keyboard';

@Scene(ADMIN_CHANNELS_SCENE)
export class AdminChannelScene {
   constructor(
      private readonly channelService: ChannelService,
      private readonly subscribeService: SubscribesService,
      private readonly areasService: AreasService,
      @InjectBot()
      private readonly bot: Telegraf<Context>,
   ) {}
   @Start()
   async onStart(ctx: Context) {
      ctx['scene'].leave()
   }
   @SceneEnter()
   async onSceneEnter(ctx) {
      console.log('Admin channel scene ENTER');
      await this.channelSettingsStarted(ctx)
   }
   @On('callback_query')
   async onCb(@Ctx() ctx: Context) {
      const query = ctx.update['callback_query']
      const subscribe = query.data.split('subscribe_')[1]
      if(subscribe) {
         const areaId = parseInt(subscribe.split('_area_')[1])
         const activate = (query.data.includes('false') ? false : true)
         if(activate) {
            await this.subscribeService.deleteAreaFromChannel(ctx.session['channel'], areaId)
         } else {
            await this.subscribeService.addSubscribe({
               channelId: ctx.session['channel'], areaId: areaId
            })
         }
         await this.generateKeyboard(ctx.session['channel'], ctx)
         this.bot.telegram.editMessageReplyMarkup(
            query.message.chat.id, ctx.session['writeMessageId'], null, ctx.session['keyboard']
         )
         await await ctx.answerCbQuery(`Изменения сохранены`);
         return
      }
      const channelId = parseInt(query.data.split('channel_')[1])
      if(channelId) {
         ctx.session['channel'] = channelId
         const selectedChannel = await this.channelService.findById(channelId)
         await ctx.reply(selectedChannel.name.toUpperCase())
         await this.editWrites(ctx)
         await ctx.reply(`Для удаление канала, нажмите кнопку ниже:`,
            Markup.keyboard(channelEditKeyboard, { columns: 2 }).resize()
         )
         await ctx.answerCbQuery(`Редактирование канала ${selectedChannel.name}`);
         await this.bot.telegram.deleteMessage(
            query.message.chat.id, ctx.session['currentChannelsMenu']
         )
      }
      return
   }

   async editWrites(ctx) {
      const channelId = ctx.session['channel']
      if(channelId) {
         if(ctx.session['writeMessageId']) {
            try {
               await this.bot.telegram.deleteMessage(
                  ctx['update'].message.from.id, ctx.session['writeMessageId']
               )
            } catch (error) {
               console.log('Сообщения не существует')
            }
         }
         ctx.session['writeMessageId'] = null
         await this.generateKeyboard(channelId, ctx)
         const channelName = await this.channelService.findById(channelId)
         const writeMessage = await ctx.reply(
            `${channelName.name} \nОтметьте участки для получения отчётов:`, {
               reply_markup: ctx.session['keyboard']
            }
         )
         ctx.session['writeMessageId'] = writeMessage.message_id
         return
      }
   }

   async generateKeyboard(channelId, @Ctx() ctx: Context) {
      const keyboardData = []
      const keyboardData1 = { inline_keyboard: [] }
      const allAreas = await this.areasService.getAllAreas()
      const allSubscribes = await this.subscribeService.findByChannel(channelId)
      allAreas.map((area, areaIndex) => {
         keyboardData.push({
            name: area.name, id: area.id, subscribe: false
         })
         allSubscribes.map((subscribe) => {
            if(area.id === subscribe.areaId) {
               keyboardData[areaIndex].subscribe = true
            }
         })
      })
      for (let btn of keyboardData) {
         keyboardData1.inline_keyboard.push([{
            text: btn.subscribe ? '🟢 ' + btn.name : '⚪️ ' +  btn.name,
            callback_data: `subscribe_${btn.subscribe}_area_${btn.id}`
         }])
      }
      ctx.session['keyboard'] = keyboardData1
   }

   @Hears('❌ Удалить канал')
   async deleteChannel(ctx) {
      const channelId = ctx.session['channel']
      if(channelId) {
         const { tgId } = await this.channelService.deleteChannel(channelId)
         try {
            await ctx.telegram.leaveChat(tgId)
         } catch (error) {
            console.log('error leve chat after delete')
         }
         ctx.session['channel'] = null
         await this.channelSettingsStarted(ctx)
      }
   }
   @Hears('👈 Назад')
   async back(ctx) {
      if(ctx.session['writeMessageId']) {
         try {
            await this.bot.telegram.deleteMessage(
               ctx['update'].message.from.id, ctx.session['writeMessageId']
            )
         } catch (error) {
            console.log('Сообщения не существует')
         }
      }
      ctx.session['writeMessageId'] = null
      ctx.session['channel'] = null
      ctx['scene'].enter(ADMIN_STARTED_SCENE)
      return
   }

   @On('message')
   async testMessage(@Message('text') text: string, @Ctx() ctx: Context) {
      if(ctx.session['path'] === 'newChannel') {
         const channelId = await this.channelService.addChannel({ name: text })
         ctx.session['path'] = 'subscribe'
         console.log('channel added', channelId)
         await this.channelSettingsStarted(ctx)
         return
      }
      const channelId = ctx.session['channel']
      if(channelId) {
         await this.channelService.renameChannel(channelId, text)
         ctx.session['channel'] = null
         await this.channelSettingsStarted(ctx)
         return
      }
   }
   async channelSettingsStarted(ctx) {
      console.log('areas settings')
      const currentChannels = await this.channelService.getAllChannels()
      if(currentChannels.length === 0) {
         await ctx.reply('Каналы не добавлены', backKeyboard)
         return
      }
      await ctx.reply('УПРАВЛЕНИЕ КАНАЛАМИ',
         Markup.keyboard(addNewCHannelKeyboard, { columns: 2 }).resize()
      )
      const currentChannelsMenu = await ctx.reply(`Выберите канал для редактирования:`, {
         reply_markup: channelsListKeyboard(currentChannels)
      })
      ctx.session['currentChannelsMenu'] = currentChannelsMenu.message_id
   }
}
