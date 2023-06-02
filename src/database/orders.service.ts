import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'

import { Orders, OrdersList, Products, Users } from './models'
import { ProductService } from './products.service'

@Injectable()
export class OrderService {
   constructor(
      @InjectModel(Orders)
      private readonly ordersRepo: typeof Orders,
      @InjectModel(OrdersList)
      private readonly ordersListRepo: typeof OrdersList,
      private readonly productsRepo: ProductService,
   ) {}

   async addOrder(userId, cart) {
      const orderNum = this.generateOrderToUser()
      const dayTomorrow = new Date(cart.time)
      dayTomorrow.setDate(dayTomorrow.getDate() + 1)
      try {
         const newOrder = await this.createOrder({
            userId: userId,
            container: cart.container_id == 'container_1' ? '1,5' : 'Кега',
            orderNum: orderNum,
            date: cart.day === 'day_tomorrow' ? dayTomorrow : cart.time,
            summ: cart.summ,
            tomorrow: cart.day === 'day_tomorrow' ? true : false,
         })
         const ordersList = []
         for (let addedProduct of cart.added_products) {
            const cbData = addedProduct.callback_data
            const databaseProduct = await this.productsRepo.findByCallbackData(cbData)
            ordersList.push({
               orderId: newOrder.id,
               productId: databaseProduct.id,
               quantity: addedProduct.col,
            })
         }
         await this.addOrdersPositions(ordersList)
         return orderNum
      } catch (error) {
         console.log(error)
         return false
      }
   }
   async updateOrderNotifyStatus(orderId) {
      const order = await this.ordersRepo.findOne({
         where: { id: orderId },
         include: OrdersList
      })
      console.log(order)
      order.notified = true
      await order.save()
      await order.reload({ include: [OrdersList] })
      return true
   }

   async getOrderList(orderId) {
      return this.ordersListRepo.findAll({
         where: { orderId: orderId },
         include: Products,
         raw: true
      })
   }

   async getOrders(day, notified) {
      const ordersData = []
      const activeOrders = await this.ordersRepo.findAll({
         where: {
            [Op.and]: [
               { tomorrow: day === 'tomorrow' ? true : false },
               { notified: false }
            ]
         },
         include: Users,
      })
      if(activeOrders.length > 0) {
         for (let order of activeOrders) {
            const ordersList = await this.getOrderList(order.id)
            ordersData.push({
               orderId: order.id,
               orderNum: order.orderNum,
               container: order.container,
               date: order.date,
               summ: order.summ,
               userName: order.user.name,
               userPhone: order.user.phone,
               orderList: ordersList
            })
         }
      }
      return ordersData
   }

   async createOrder(data) {
      return this.ordersRepo.create(data)
   }

   addOrdersPositions(ordersList) {
      return this.ordersListRepo.bulkCreate(ordersList)
   }
   generateOrderToUser() {
      return Math.floor(Math.random() * 900) + 100
   }

}
