import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from "sequelize-typescript"

import { Orders } from './orders.model'
import { Products } from './products.model'

const { INTEGER } = DataType

interface OrdersListCreationAttrs {
   orderId: number
   productId: number
   quantity: string
}

@Table({ tableName: 'orders_list', timestamps: false })
export class OrdersList extends Model<OrdersList, OrdersListCreationAttrs> {
   @Column({
      type: INTEGER,
      unique: true, autoIncrement: true, primaryKey: true
   }) id: number

   @ForeignKey(() => Orders)
   @Column({
      type: INTEGER, allowNull: false
   }) orderId: number

   @BelongsTo(() => Orders)
   order: Orders

   @ForeignKey(() => Products)
   @Column({
      type: INTEGER, allowNull: false
   }) productId: number

   @BelongsTo(() => Products)
   product: Products

   @Column({
      type: INTEGER, allowNull: false
   }) quantity: number
}