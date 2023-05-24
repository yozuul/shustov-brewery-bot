import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { Orders, OrdersList, Products, Users } from './models'
import {Op} from 'sequelize'

@Injectable()
export class OrsderService {
   constructor(
      @InjectModel(Orders)
      private readonly ordersRepo: typeof Orders,
      @InjectModel(OrdersList)
      private readonly ordersListRepo: typeof OrdersList,
   ) {}

   async updateOrderNotifyStatus(orderId) {
      const order = await this.ordersRepo.findOne({
         where: { id: orderId },
      })
      order.notified = true
      await order.save()
      return true
   }

   async getOrderList(orderId) {
      return this.ordersListRepo.findAll({
         where: { orderId: orderId },
         include: Products,
         raw: true
      })
   }

   async getTodayOrders() {
      const ordersData = []
      const activeOrders = await this.ordersRepo.findAll({
         where: {
            [Op.and]: [
               { tomorrow: false },
               { notified: false }
            ]
         },
         include: Users
      })
      if(activeOrders.length > 0) {
         for (let order of activeOrders) {
            const ordersList = await this.getOrderList(order.id)
            ordersData.push({
               orderId: order.id,
               orderNum: order.orderNum,
               container: order.container,
               date: order.date,
               // summ: order.summ,
               userName: order.user.name,
               userPhone: order.user.phone,
               orderList: ordersList
            })
         }
      }
      return ordersData
   }
   async getTommorowOrders() {
      return this.ordersRepo.findAll({
         where: {
            [Op.and]: [
               { tomorrow: true },
               { notified: false }
            ]
         }
      })
   }

   async createOrder(data) {
      return this.ordersRepo.create(data)
   }

   addOrdersPositions(ordersList) {
      return this.ordersListRepo.bulkCreate(ordersList)
   }
}
