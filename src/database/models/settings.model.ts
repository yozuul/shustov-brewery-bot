import { Column, DataType, Model, Table } from 'sequelize-typescript'

const { INTEGER, BOOLEAN, TEXT } = DataType

interface SettingsCreationAttrs {
   closed: boolean
   reason: string
}

@Table({ tableName: 'settings', timestamps: false })
export class Settings extends Model<Settings, SettingsCreationAttrs> {
   @Column({
      type: INTEGER,
      unique: true, autoIncrement: true, primaryKey: true
   }) id: number

   @Column({
      type: BOOLEAN, allowNull: false
   }) closed: boolean

   @Column({
      type: TEXT, allowNull: true
   }) reason: string
}
