import { resolve } from 'node:path'
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ProductsService } from './products.service'
import { UsersService } from './users.service'
import { Users, Products, Orders } from './models'

@Module({
	imports: [
		SequelizeModule.forRoot({
			dialect: 'sqlite',
			storage: resolve('shustov.db.sqlite'),
			models: [Users, Products, Orders],
			autoLoadModels: true,
			logging: false,
		}),
      SequelizeModule.forFeature([Users, Products, Orders]),
	],
   providers: [
      UsersService, ProductsService
   ],
   exports: [
      UsersService, ProductsService
   ]
})
export class DatabaseModule {}
