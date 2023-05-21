import { Scene, SceneEnter, Command, Hears, Start, On, Ctx, Message } from 'nestjs-telegraf';
import { Markup } from 'telegraf';

import { ADMIN_AREAS_SCENE, ADMIN_CHANNELS_SCENE, ADMIN_STARTED_SCENE } from '../../app.constants';

import { adminStartedKeyboard } from '../keyboards/keyboard';
import { Context } from '../../common/interfaces/context.interface';

@Scene(ADMIN_STARTED_SCENE)
export class AdminStartedScene {
   @Start()
   async onStart(ctx: Context) {
      ctx.session['channel'] = null
      ctx.session['area'] = null
      await this.started(ctx)
   }
   @SceneEnter()
   async onSceneEnter(ctx) {
      console.log('Admin started scene ENTER');
      await this.started(ctx)
   }
   @Hears('Участки')
   async areas(ctx) {
      ctx['scene'].enter(ADMIN_AREAS_SCENE)
   }
   @Hears('Каналы')
   async channels(ctx) {
      ctx['scene'].enter(ADMIN_CHANNELS_SCENE)
   }
   @Hears('✉️ Тест рассылки')
   async test(ctx) {
      await fetch('http://localhost:4444/channels/test')
   }
   async started(ctx) {
      await ctx.reply('⚙️ ВЫБЕРИТЕ РАЗДЕЛ ДЛЯ РЕДАКТИРОВАНИЯ:',
         Markup.keyboard(adminStartedKeyboard, { columns: 2 }).resize()
      )
   }
   // @SceneLeave()
   // onSceneLeave() {
   //    console.log('admin scene leave');
   //    return 'Bye Bye 👋';
   // }
   // @Command(['rng', 'random'])
   // onRandomCommand(): number {
   //    console.log('Use "random" command');
   //    return Math.floor(Math.random() * 11);
   // }
   // @Command('leave')
   // async onLeaveCommand(ctx: Context): Promise<void> {
   //    await ctx.scene.leave();
   // }
}
