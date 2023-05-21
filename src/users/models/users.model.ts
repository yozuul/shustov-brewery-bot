import { Column, DataType, Model, Table } from "sequelize-typescript";

const { INTEGER, STRING } = DataType

interface UserCreationAttrs {
   tgId: string
   phone: string
   role: string
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs> {
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
}