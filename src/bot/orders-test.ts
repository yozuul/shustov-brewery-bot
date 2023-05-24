export class OrdersTest {
   private usersRepo: any
   private ordersRepo: any
   private productsRepo: any
   constructor(
      usersRepo: any, ordersRepo: any, productsRepo: any
   ) {
      this.usersRepo = usersRepo
      this.ordersRepo = ordersRepo
      this.productsRepo = productsRepo
   }

   async addOrder(cart) {
      const phoneNum = '+79015009458'
      const user = await this.usersRepo.findByPhone(phoneNum)
      try {
         const newOrder = await this.ordersRepo.createOrder({
            userId: user.id,
            container: cart.container_id == 'container_1' ? '1,5' : 'Кега',
            date: cart.time,
            tomorrow: cart.day === 'day_tomorrow' ? true : false,
            orderNum: this.generateOrderToUser()
         })
         const ordersList = []
         for (let cartProduct of cart.products) {
            const databaseProduct = await this.productsRepo.findByCartId(cartProduct.id)
            ordersList.push({
               orderId: newOrder.id,
               productId: databaseProduct.id,
               quantity: cartProduct.col,
            })
         }
         await this.ordersRepo.addOrdersPositions(ordersList)
      } catch (error) {
         console.log(error)
      }
   }

   async prepareOrder() {
      await this.usersRepo.addUser(this.testUser)
      const cart = this.cartData
      const currentDate = new Date()
      // currentDate.setDate(currentDate.getDate() + 1)
      currentDate.setHours(currentDate.getHours() + 4)
      const updatedTime = new Date(currentDate)
      cart.time = updatedTime.toString()
      // await this.addOrder(cart)
   }

   generateOrderToUser() {
      return Math.floor(Math.random() * 900) + 100
   }
   get cartData() {
      return {
        "products": [
          {
            "id": "product_1",
            "col": 1
          },
          {
            "id": "product_3",
            "col": 2.5
          },
          {
            "id": "product_5",
            "col": 1.5
          },
          {
            "id": "product_4",
            "col": 1
          }
        ],
        "container_id": "container_2",
        "day": "day_today",
      //   "day": "day_tomorrow",
        "time": "2023-05-24T11:03:08.533Z"
      }
   }
   get testUser() {
      return {
         role: 'user', name: 'ТЕСТ! НЕ НАЛИВАТЬ!', phone: '+79015009458', tgId: 1884297416,
      }
   }
}