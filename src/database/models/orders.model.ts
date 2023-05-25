import { Column, DataType, Model, Table, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript"

import { Users } from './users.model'
import { OrdersList } from './orders-list.model'

const { INTEGER, FLOAT, DATE, BOOLEAN, STRING } = DataType

interface OrderCreationAttrs {
   userId: number
   container: string
   orderNum: string
   date: Date
   symm: number
   tomorrow: boolean
   notified: boolean
}

@Table({ tableName: 'orders' })
export class Orders extends Model<Orders, OrderCreationAttrs> {
   @Column({
      type: INTEGER,
      unique: true, autoIncrement: true, primaryKey: true
   }) id: number

   @ForeignKey(() => Users)
   @Column({
      type: INTEGER, allowNull: false
   }) userId: number

   @BelongsTo(() => Users)
   user: Users

   @Column({
      type: STRING, allowNull: false
   }) container: string

   @Column({
      type: STRING, allowNull: false
   }) orderNum: string

   @Column({
      type: DATE, allowNull: false
   }) date: Date

   @Column({
      type: FLOAT, allowNull: false
   }) summ: number

   @Column({
      type: BOOLEAN, allowNull: false, defaultValue: false
   }) tomorrow: boolean

   @Column({
      type: BOOLEAN, allowNull: false, defaultValue: false
   }) notified: boolean

   @HasMany(() => OrdersList)
   ordersList: OrdersList[]
}