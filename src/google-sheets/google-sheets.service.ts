import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { GoogleSpreadsheet } from 'google-spreadsheet'

@Injectable()
export class GoogleSheetsService implements OnModuleInit {
   private readonly doc: GoogleSpreadsheet

   constructor() {
     this.doc = new GoogleSpreadsheet('1tpNJnfP2CU2JpN89lJuO7AyNEWjWcMCm9zvptmsVGpU')
   }

   async useServiceAccountAuth() {
      const config = await this.getConfig()
      await this.doc.useServiceAccountAuth({
         client_email: config.client_email,
         private_key: config.private_key,
      })
   }

   async getDoc(): Promise<GoogleSpreadsheet> {
      const doc = this.doc
      await doc.loadInfo(); // loads document properties and worksheets
      console.log(doc.title);
      // await doc.updateProperties({ title: 'Шустов' });

      const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
      console.log(sheet.title);
      console.log(sheet.rowCount);

      // adding / removing sheets
      // const newSheet = await doc.addSheet({ title: 'Шустов' });
      // await newSheet.delete();

   }

   async onModuleInit() {
      // await this.useServiceAccountAuth()
      // await this.getDoc()
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
