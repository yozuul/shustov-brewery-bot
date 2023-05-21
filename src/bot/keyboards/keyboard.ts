import { Markup } from 'telegraf';
export const backKeyboard = Markup.keyboard([
   Markup.button.callback('👈 Назад', 'back')
]).resize()
// ADMIN STARTED
export const adminStartedKeyboard = [
   Markup.button.callback('Редактировать сорта', 'editsorts')
]
// USER STARTED
export const userStartedKeyboard = [
   Markup.button.callback('О пивоварне', 'about'),
   Markup.button.callback('Сорта', 'sorts'),
   Markup.button.callback('Онлайн заказ', 'orders'),
]
export const areasListKeyboard = (data) => {
   const keyboardData = { inline_keyboard: [] }
   for (let item of data) {
      keyboardData.inline_keyboard.push([{
            text: item.name, callback_data: `area_${item.id}`
         },
      ])
   }
   return keyboardData
}
// CHANNELS
export const addNewCHannelKeyboard = [
   // Markup.button.callback('➕ Новый канал', 'newArea'),
   Markup.button.callback('👈 Назад', 'back'),
]
export const channelEditKeyboard = [
   // Markup.button.callback('📝 Изменить права', 'editChannel'),
   Markup.button.callback('❌ Удалить канал', 'deleteChannel'),
   Markup.button.callback('👈 Назад', 'back'),
]
export const channelsListKeyboard = (data) => {
   const keyboardData = { inline_keyboard: [] }
   for (let item of data) {
      keyboardData.inline_keyboard.push([{
            text: item.name, callback_data: `channel_${item.id}`
         },
      ])
   }
   return keyboardData
}