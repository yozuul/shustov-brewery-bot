import { Injectable, OnModuleInit } from '@nestjs/common'
import { Products } from './models'

import { InjectModel } from '@nestjs/sequelize'

@Injectable()
export class ProductsService implements OnModuleInit {
   constructor(
      @InjectModel(Products)
      private readonly productsRepo: typeof Products
   ) {}
   async getPrice(productCallbackId) {
      return this.productsRepo.findOne({
         where: { id: productCallbackId.split('_')[1] },
         attributes: ['price', 'name'],
         raw: true
      })
   }
   async getAll() {
      return this.productsRepo.findAll()
   }
   async onModuleInit() {
      const existProducts = await this.productsRepo.findAll()
      if(existProducts.length === 0) {
         await this.productsRepo.bulkCreate([
            { name: 'Чешское фильтрованное', price: 99, alc: 4.5 },
            { name: 'Чешское нефильтрованное', price: 199, alc: 5 },
            { name: 'Немецкое фильтрованное', price: 88, alc: 5.5 },
            { name: 'Немецкое нефильтрованное', price: 188, alc: 6 },
            { name: 'Тёмное', price: 111, alc: 6.5 },
            { name: 'Вишневое', price: 122, alc: 7 },
         ])
      }
   }
}
