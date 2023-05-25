import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'

import { Injectable, OnModuleInit } from '@nestjs/common'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import {dateFormatter} from '@app/common/utils'

@Injectable()
export class GoogleSheetsService implements OnModuleInit {
   private readonly doc: GoogleSpreadsheet
   constructor() {
      this.doc = new GoogleSpreadsheet(process.env.GOOGLE_TABLE)
   }

   async getProducts() {
      await this.useServiceAccountAuth()
      await this.doc.loadInfo()
      const sheet = this.doc.sheetsByIndex[1]
      return sheet.getRows()
   }

   async pushOrder(orderData) {
      await this.useServiceAccountAuth()
      await this.doc.loadInfo()
      const sheet = this.doc.sheetsByIndex[0]
      const rowData: any = {
         userPhone: orderData.userPhone,
         orderNum: orderData.orderNum,
         orderId: orderData.orderId,
         date: dateFormatter(orderData.date, true),
         summ: orderData.summ
      }
      for (let orderItem of orderData.orderList) {
         const productId = orderItem['product.callback_data']
         rowData[productId] = orderItem.quantity
      }
      const isAdded = await sheet.addRow(rowData)
   }

   async useServiceAccountAuth() {
      const config = await this.getConfig()
      await this.doc.useServiceAccountAuth({
         client_email: config.client_email,
         private_key: config.private_key,
      })
   }
   async getConfig() {
      try {
         const filePath = resolve('./google-service-account.json')
         const contents = await readFile(filePath, { encoding: 'utf8' });
         return JSON.parse(contents)
      } catch (err) {
         console.error(err.message);
      }
   }

   async getDoc(): Promise<GoogleSpreadsheet> {
      // adding / removing sheets
      // const newSheet = await doc.addSheet({ title: 'Шустов' });
      // await newSheet.delete();
   }

   async onModuleInit() {
      // await this.useServiceAccountAuth()
      // await this.getDoc()
   }
}
