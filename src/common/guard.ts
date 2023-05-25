import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from '@app/database';

@Injectable()
export class AuthGuard implements CanActivate {
   constructor(
      private userService: UserService
   ) {}
   canActivate(
      context: ExecutionContext,
   ): boolean | Promise<boolean> | Observable<boolean> {
      const request = context.switchToHttp().getRequest()
      const senderId = request.update['message'].from.id
      if(!senderId) {
         return false
      }
      if(!this.checkUser(senderId)) {
         return false
      }
      console.log(`Пользователь ${senderId} зашёл в настройки`)
      return true
   }

   async checkUser(tgId) {
      const user = await this.userService.isUserAuth(tgId)
      if(user?.role !== 'admin') {
         return false
      }
   }
   throwError() {
      // console.log('error')
      // throw new UnauthorizedException('Пользователь не имеет доступа к настройкам')
   }
}