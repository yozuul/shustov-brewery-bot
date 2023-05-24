import { resolve } from 'node:path'
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ProductService } from './products.service'
import { UserService } from './users.service'
import { OrsderService } from './orders.service'
import { Users, Products, Orders, OrdersList } from './models'

@Module({
	imports: [
		SequelizeModule.forRoot({
			dialect: 'sqlite',
			storage: resolve('shustov.db.sqlite'),
			models: [Users, Products, Orders, OrdersList],
			autoLoadModels: true,
			logging: false,
		}),
      SequelizeModule.forFeature([Users, Products, Orders, OrdersList]),
	],
   providers: [
      UserService, ProductService, OrsderService
   ],
   exports: [
      UserService, ProductService, OrsderService
   ]
})

export class DatabaseModule {}
