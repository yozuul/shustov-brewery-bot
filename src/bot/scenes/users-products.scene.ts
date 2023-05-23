import { Scene, SceneEnter, Hears, On, Ctx, Start, Sender } from 'nestjs-telegraf';

import { USERS_SCENE, USERS_BUTTON } from '@app/common/constants';
import { SessionContext } from '@app/common/interfaces';
import { NavigationKeyboard } from '@bot/keyboards';

@Scene(USERS_SCENE.PRODUCTS)
export class UsersProductsScene {
   constructor(
      private readonly navigationKeyboard: NavigationKeyboard
   ) {}
   @Start()
   async onStart(@Ctx() ctx: SessionContext) {
      ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @SceneEnter()
   async onSceneEnter1(@Ctx() ctx: SessionContext) {
      await ctx.reply('🍺​',
         await this.navigationKeyboard.backButton()
      )
      await ctx.reply(
         'Чешское нефильтрованное\nПиво имеет непрозрачный золотистый оттенок и легкий хмелевой аромат, отлично освежает. Вкусовые качества напитка раскрываются с первого глотка.\nКрепость 4,5% | Цена 75 руб./литр\n-\nЧешское фильтрованное\nСварено по технологии, привезенной пивоваром из Праги, из высококачественного чешского солода и хмеля. Пиво обладает солодовым вкусом с выраженной хмелевой горечью и ароматом.\nКрепость 5% | Цена 85 руб./литр\n-\nНемецкое нефильтрованное\nОбладает уникальным первозданным вкусом, который не корректируется во время брожения.\nКрепость 5% | Цена 90 руб./литр\n-\nНемецкое фильтрованное\nОно обладает невероятным ароматом и характерной горчинкой в послевкусии.\nКрепость 4% | Цена 88 руб./литр\n-\nТёмное\nПрисутствует фирменная терпкость, сладковатая бархатистость и довольно долгий солодовый привкус.\nКрепость 4% | Цена 66 руб./литр\n-\nВишнёвое\nВишневое пиво является достойным представителем фруктово-ягодных разновидностей этого пенного напитка.\nКрепость 6% | Цена 80 руб./литр\n​',
      )
   }
   @Hears(USERS_BUTTON.BACK.TEXT)
   leaveSceneHandler(@Ctx() ctx: SessionContext) {
      ctx.scene.enter(USERS_SCENE.STARTED)
   }
   @On('message')
   async onSceneEnter(@Sender('id') senderId: number, @Ctx() ctx: SessionContext ) {
   }
}