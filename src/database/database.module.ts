import { resolve } from 'node:path'
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ProductService } from './products.service'
import { UserService } from './users.service'
import { OrderService } from './orders.service'
import { SettingsService } from './settings.service'
import { Users, Products, Orders, OrdersList, Settings } from './models'

const models = [ Users, Products, Orders, OrdersList, Settings ]
const providers = [ UserService, ProductService, OrderService, SettingsService ]

@Module({
	imports: [
		SequelizeModule.forRoot({
			dialect: 'sqlite',
			storage: resolve('shustov.db.sqlite'),
			models: models,
			autoLoadModels: true,
			logging: false,
		}),
      SequelizeModule.forFeature(models),
	],
   providers: providers,
   exports: providers
})

export class DatabaseModule {}
