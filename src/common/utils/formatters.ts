export function dateFormatter(orderDate) {
   const day = orderDate.getDate()
   const month = orderDate.toLocaleString('default', { month: 'long' })
   const hours = orderDate.getHours()
   const minutes = orderDate.getMinutes().toString().padStart(2, '0')
   console.log(month)
   // console.log(new Date(month))
   return `<pre>Ко времени: ${hours}:${minutes} (${day} ${month})</pre>`
}

export function phoneFormatter(userPhone) {
   return {
      phoneDig: userPhone.slice(-4),
      formattedPhone: userPhone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5')
   }
}