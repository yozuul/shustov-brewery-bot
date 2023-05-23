import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from "sequelize-typescript"

import { Users } from './users.model'
import { Products } from './products.model'

const { INTEGER, DATE, BOOLEAN } = DataType

interface OrderCreationAttrs {
   productId: number
   quantity: number
   userId: number
   date: Date
   notified: boolean
}

@Table({ tableName: 'orders' })
export class Orders extends Model<Orders, OrderCreationAttrs> {
   @Column({
      type: INTEGER,
      unique: true, autoIncrement: true, primaryKey: true
   }) id: number

   @ForeignKey(() => Products)
   @Column({
      type: INTEGER, allowNull: false
   }) productId: number

   @BelongsTo(() => Products)
   product: Users

   @Column({
      type: INTEGER, allowNull: false
   }) quantity: number

   @ForeignKey(() => Users)
   @Column({
      type: INTEGER, allowNull: false
   }) userId: number

   @BelongsTo(() => Users)
   user: Users

   @Column({
      type: DATE, allowNull: false
   }) date: Date

   @Column({
      type: BOOLEAN, allowNull: false
   }) notified: boolean
}