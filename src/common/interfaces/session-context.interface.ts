import { Context as ContextTelegraf } from 'telegraf';

export interface SessionContext extends ContextTelegraf {
   session: {
      path?: 'home' | 'cart'
   };
}