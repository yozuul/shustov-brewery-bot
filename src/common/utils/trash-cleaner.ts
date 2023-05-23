export async function trashCleaner(ctx) {
   if(!ctx.session.trash) {
      ctx.session.trash = []
      return
   }
   if(ctx.session.trash.length > 0) {
      for (let id of ctx.session.trash) {
         try {
            await ctx.deleteMessage(id)
         } catch (error) {
            ctx.session.trash = []
         }
      }
   }
   ctx.session.trash = []
}
export async function menuCleaner(ctx, messageId) {
   const isAtTrash = ctx.session.trash.find(id => id === messageId)
   if(!isAtTrash) {
      try {
         await ctx.deleteMessage(messageId)
      } catch (error) {
         console.log(error)
         console.log('Ошибка удаления меню', messageId)
      }
   }
}