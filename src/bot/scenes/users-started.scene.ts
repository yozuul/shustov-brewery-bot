import { Injectable, UseGuards } from '@nestjs/common';
import { Scene, SceneEnter, Hears, On, Message, Ctx, Start } from 'nestjs-telegraf';
import { USERS_SCENE } from '@app/common/constants';
import { SceneContext } from '@app/common/interfaces';
import { AuthGuard } from 'src/common/guard';

@Scene(USERS_SCENE.ORDERS)
export class UserStartedScene {
   constructor(
      // private areaService: AreasService,
      // private fileService: FilesService
   ) {}
   @Start()
   async onStart(ctx: SceneContext) {
      ctx['scene'].leave()
   }
   @SceneEnter()
   async onSceneEnter(ctx: SceneContext) {
      // await this.startedKeyboard(ctx)
      // ctx.session['uploadAreaId'] = null
   }
}