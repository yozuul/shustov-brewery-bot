import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { Users } from './models'

@Injectable()
export class UserService {
   constructor(
      @InjectModel(Users)
      private readonly usersRepo: typeof Users
   ) {}

   async findByPhone(phone) {
      return this.usersRepo.findOne({
         where: { phone: phone },
      })
   }
   async addUser(data) {
      await this.usersRepo.findOrCreate({
         where: {
            phone: data.phone
         }, defaults: data
      })
   }
   async isUserAuth(tgId) {
      return this.usersRepo.findOne({
         where: { tgId: tgId }
      })
   }
   async deleteUser(phone) {
      try {
         return this.usersRepo.destroy({
            where: { phone: phone }
         })
      } catch (error) {
         return false
      }
   }
   async updateBonuse(tgId, bonusNum) {
      const user = await this.usersRepo.findOne({
         where: { tgId: tgId }
      })
      if(user) {
         user.bonus = bonusNum
         await user.save()
      }
   }
   async findById(tgId) {
      return this.usersRepo.findOne({
         where: { tgId: tgId }
      })
   }
}
