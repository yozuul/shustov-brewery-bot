import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { Settings } from './models'
interface update {
   isClose: boolean
   closeReason?: string
}
@Injectable()
export class SettingsService {
   constructor(
      @InjectModel(Settings)
      private readonly settingsRepo: typeof Settings
   ) {}

   async getSettings() {
      return this.settingsRepo.findOne({})
   }
   async updateSettings(action: update) {
      const settings = await this.settingsRepo.findOne({})
      settings.closed = action.isClose
      settings.reason = action.closeReason ? action.closeReason : null
      await settings.save()
   }
   async addDefault() {
      return this.settingsRepo.create({
         closed: false, reason: ''
      })
   }
}
