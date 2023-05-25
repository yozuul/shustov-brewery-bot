import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript'

import { OrdersList } from './orders-list.model'

const { INTEGER, STRING } = DataType

interface ProductsCreationAttrs {
   name: string
   alc: string
   price: number
   callback_data: string
}

@Table({ tableName: 'products' })
export class Products extends Model<Products, ProductsCreationAttrs> {
   @Column({
      type: INTEGER,
      unique: true, autoIncrement: true, primaryKey: true
   }) id: number

   @Column({
      type: STRING, allowNull: false
   }) name: string

   @Column({
      type: STRING, allowNull: false
   }) alc: string

   @Column({
      type: INTEGER, allowNull: false
   }) price: number

   @Column({
      type: STRING, allowNull: false
   }) callback_data: string

   @HasMany(() => OrdersList)
   ordersList: OrdersList
}
