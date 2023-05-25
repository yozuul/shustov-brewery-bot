import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { Products } from './models'


@Injectable()
export class ProductService {
   constructor(
      @InjectModel(Products)
      private readonly productsRepo: typeof Products
   ) {}
   async updateProducts(newProducts) {
      await this.productsRepo.destroy({ where: {} })
      return this.productsRepo.bulkCreate(newProducts)
   }
   async findByCallbackData(productCallbackName) {
      return this.productsRepo.findOne({
         where: { callback_data: productCallbackName },
         attributes: ['id', 'price', 'name'],
         raw: true
      })
   }
   async getAllForCart() {
      return this.productsRepo.findAll({
         attributes: ['name', 'price', 'callback_data']
      })
   }
}
