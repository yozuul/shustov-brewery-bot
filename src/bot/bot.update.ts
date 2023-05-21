import { Injectable, UseGuards } from '@nestjs/common';
import { Ctx, Hears, InjectBot, Message, On, Start, Update, Command, Sender } from 'nestjs-telegraf';
import { Telegraf, Markup } from 'telegraf';

import { Context } from './context.interface';
import {userStartedKeyboard} from './keyboards/keyboard';
// import { AuthGuard } from '../common/guard';
// import { ADMIN_STARTED_SCENE, USER_STARTED_SCENE } from 'src/app.constants';
// import { UsersService } from 'src/users/users.service';
// import { ChannelService } from 'src/channels/channels.service';

@Injectable()
@Update()
export class BotUpdate {
   constructor(
      @InjectBot()
      private readonly bot: Telegraf<Context>,
      // private readonly usersService: UsersService,
      // private readonly channelService: ChannelService,
   ) {}
   @Start()
   // @UseGuards(AuthGuard)
   async startCommand(ctx: Context) {
      ctx.session.path = 'home'
      await ctx.reply('Добро пожаловать!',
         Markup.keyboard(userStartedKeyboard, { columns: 2 }).resize()
      )
      // const userRole = await this.checkUser(ctx)
      // if(!userRole) return
      // if(userRole === 'admin') ctx['scene'].enter(ADMIN_STARTED_SCENE)
      // if(userRole === 'user') ctx['scene'].enter(USER_STARTED_SCENE)
   }
   @On('message')
   async msgeHandler(ctx: Context) {
      ctx.session.path = 'home'
      await ctx.reply('hello from Shustov Bot')
   }
   // @On('contact')
   // async contact(ctx: Context) {
   //    console.log(ctx.update['message'])
   //    let { phone_number, user_id } = ctx.update['message'].contact
   //    console.log(ctx.update['message'])
   //    console.log(phone_number)
   //    if(!phone_number.split('+')[1]) {
   //       phone_number = '+' + phone_number
   //    }
   //    const userExist = await this.usersService.authUser(phone_number, user_id.toString())
   //    if(userExist) {
   //       await ctx.reply('Вы успешно авторизованы 🔐')
   //       ctx['scene'].enter(USER_STARTED_SCENE)
   //    } else {
   //       await ctx.reply('⛔️ У вас нет доступа к боту')
   //    }
   // }
   // @On('my_chat_member')
   // async my_chat_member(@Ctx() ctx: Context) {
   //    const chatActivity = ctx.update['my_chat_member']
   //    if(chatActivity) {
   //       const chatOwner = chatActivity.from.id
   //       const chat = chatActivity.chat
   //       if(chatActivity.new_chat_member.status === 'administrator') {
   //          const user = await this.usersService.findById(chatOwner)
   //          if(user?.role === 'admin') {
   //             await this.channelService.addChannel({
   //                name: chat.title, tgId: chat.id.toString()
   //             })
   //             if(chatActivity.new_chat_member.status === 'left') {
   //                await this.channelService.deleteByTgId(chat.id.toString())
   //             }
   //          } else {
   //             try {
   //                await ctx.leaveChat()
   //             } catch (error) {
   //                console.log('err')
   //             }
   //          }
   //       }
   //       if(chatActivity.new_chat_member.status === 'left') {
   //          console.log(chat.id)
   //          this.channelService.deleteByTgId(chat.id)
   //       }
   //    }
   // }
   // async checkUser(ctx) {
   //    const sender = ctx.message.from
   //    const user = await this.usersService.findById(sender.id)
   //    console.log(sender.id)
   //    if(!user) {
   //       await ctx.reply('⛔️ У вас нет доступа к боту')
   //       await this.bot.telegram.sendMessage(sender.id, 'Авторизация по номеру телефона', {
   //       reply_markup: {
   //          keyboard: [[
   //             { text: 'Вход',
   //                request_contact: true },
   //             { text: 'Отмена' }
   //          ]], one_time_keyboard: true, force_reply: true }
   //       })
   //       return false
   //    }
   //    return user?.role
   // }
}