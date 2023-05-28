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
      const existProducts = await this.productsRepo.findAll()
      if(existProducts.length === 0) {
         await this.productsRepo.bulkCreate(newProducts)
      } else {
         for (let exitsProduct of existProducts) {
            const checked = newProducts.find((newProduct) => {
               return newProduct.callback_data === exitsProduct.callback_data
            })
            if(!checked) {
               await exitsProduct.destroy()
            }
         }
         for (let newProduct of newProducts) {
            const checked = existProducts.find((existProduct) => {
               return newProduct.callback_data === existProduct.callback_data
            })
            if(!checked) {
               await this.productsRepo.create(newProduct)
            }
         }
      }
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
