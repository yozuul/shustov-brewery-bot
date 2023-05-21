import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
   constructor(
      private userService: UsersService
   ) {}
   canActivate(
      context: ExecutionContext,
   ): boolean | Promise<boolean> | Observable<boolean> {
      const request = context.switchToHttp().getRequest();
      if(request.update['message']?.from.id)
      this.checkUser(request, request.update['message'].from.id)
      // console.log(request)
      //  throw new UnauthorizedException('dfdf')
      return true;
   }

   async checkUser(request, tgId) {
      const user = await this.userService.findById(tgId)
      if(!user) {
         const sender = request.update.message.from.id
         const ctx = request.telegram
         request['scene'].leave()
         await ctx.sendMessage(sender, 'Авторизация по номеру телефона', {
         reply_markup: {
            keyboard: [[
               { text: 'Вход',
                  request_contact: true },
               { text: 'Отмена' }
            ]], one_time_keyboard: true, force_reply: true }
         })
         return false
      }
   }
}