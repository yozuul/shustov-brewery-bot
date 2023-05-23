import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript'

import { Orders } from './orders.model'

const { INTEGER, STRING } = DataType

interface ProductsCreationAttrs {
   name: string
   alc: number
   price: number
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
      type: INTEGER, allowNull: false
   }) alc: number

   @Column({
      type: INTEGER, allowNull: false
   }) price: number

   @HasMany(() => Orders)
   order: Orders
}