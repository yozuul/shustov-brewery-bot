import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript'

import { Orders } from './orders.model'

const { INTEGER, STRING } = DataType

interface UserCreationAttrs {
   tgId: string
   phone: string
   role: string
}

@Table({ tableName: 'users' })
export class Users extends Model<Users, UserCreationAttrs> {
   @Column({
      type: INTEGER,
      unique: true, autoIncrement: true, primaryKey: true
   }) id: number

   @Column({
      type: STRING, allowNull: false
   }) role: string

   @Column({
      type: STRING, allowNull: true
   }) tgId: string

   @Column({
      type: STRING, allowNull: true
   }) phone: string

   @HasMany(() => Orders)
   orders: Orders[]
}
