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

   async findById(tgId) {
      return true
   }
}
