import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'

import { Injectable, OnModuleInit } from '@nestjs/common'
import { GoogleSpreadsheet } from 'google-spreadsheet'

@Injectable()
export class GoogleSheetsService implements OnModuleInit {
   private readonly doc: GoogleSpreadsheet
   constructor() {
      this.doc = new GoogleSpreadsheet(process.env.GOOGLE_TABLE)
   }

   async getProducts() {
      await this.useServiceAccountAuth()
      const doc = this.doc
      await doc.loadInfo()
      const sheet = doc.sheetsByIndex[1]
      return sheet.getRows()
   }

   async pushOrder(orderData) {
      await this.useServiceAccountAuth()
      const doc = this.doc
      await doc.loadInfo()
      const sheet = doc.sheetsByIndex[0]

      const rowData: any = {
         userPhone: orderData.userPhone,
         orderNum: orderData.orderNum,
         orderId: orderData.orderId,
         date: orderData.date,
         summ: 1234
      }
      for (let orderItem of orderData.orderList) {
         const productId = `product_${orderItem.productId}`
         rowData[productId] = orderItem.quantity
      }
      await sheet.addRow(rowData)
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
}
