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
   async findByCartId(productCallbackId) {
      return this.productsRepo.findOne({
         where: { id: productCallbackId.split('_')[1] },
         attributes: ['id', 'price', 'name'],
         raw: true
      })
   }
   async getAll() {
      return this.productsRepo.findAll()
   }
}
