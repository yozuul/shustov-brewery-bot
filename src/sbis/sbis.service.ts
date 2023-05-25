import { Injectable, OnModuleInit } from '@nestjs/common'

@Injectable()
export class SbisService implements OnModuleInit {

   async getSellsPointList() {
      const accessData = await this.auth()
      const url = 'https://api.sbis.ru/retail/point/list'
      const queryParams = new URLSearchParams({
         withPhones: 'true',
         withPrices: 'true'
      })
      const fullUrl = `${url}?${queryParams.toString()}`
      const headers = {
         'Content-Type': 'application/json; charset=utf-8',
         'X-SBISAccessToken': accessData.access_token,
         'X-SBISSessionId': accessData.sid,
       }
       try {
         const response = await fetch(fullUrl, { headers });
         const data = await response.text();
         console.log(JSON.parse(data));
       } catch (error) {
         console.error('Something went wrong!', error);
       }
   }

   async getBonuses(uuid) {
      const salesPointId = '211'
      const accessData = await this.auth()
      const url = `https://api.sbis.ru/retail/customer/${uuid}/bonus-balance?pointId=${salesPointId}`
      try {
         const response = await fetch(url, {
            headers: {
               'Content-Type': 'application/json; charset=utf-8',
               'X-SBISAccessToken': accessData.access_token,
               'X-SBISSessionId': accessData.sid,
            }
         })
         const data = await response.json()
         return data
      } catch (error) {
         console.log(error)
         return null
      }
   }

   async findUser(userPhone) {
      const url = 'https://online.sbis.ru/service/?x_version=22.3100-709&x_version=22.2134-244'
      const accessData = await this.auth()
      const requestData = {
         jsonrpc: '2.0', protocol: 6,
         method: 'CRMClients.GetCustomerByParams',
         params: {
           client_data: {
             d: [
               {
                 d: [[userPhone, 'mobile_phone', null]],
                 s: [
                   { t: 'Строка', n: 'Value' },
                   { t: 'Строка', n: 'Type' },
                   { t: 'Строка', n: 'Priority' },
                 ],
                 _type: 'recordset',
               },
             ],
             s: [{ n: 'ContactData', t: 'Выборка' }], _type: 'record',
           },
           options: null,
         }
       }

      const headers = {
         'Content-Type': 'application/json; charset=utf-8',
         'X-SBISAccessToken': accessData.access_token,
         'X-SBISSessionId': accessData.sid,
      }

      try {
         const response = await fetch(url, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify(requestData)
         })
         const { result } = await response.json()
         if(!result || (Array.isArray(result.d) && result.d.length == 0)) {
            return false
         } else {
            return result.d
         }
       } catch (error) {
         console.error('Something went wrong!', error)
         return false
       }
   }

   async auth() {
      const authData = {
         app_client_id: process.env.SBIS_CLIENT_ID,
         app_secret: process.env.SBIS_CLIENT_SECRET,
         secret_key: process.env.SBIS_SECRET_KEY
      }
      const authUrl = 'https://online.sbis.ru/oauth/service/'
      try {
         const response = await fetch(authUrl, {
            headers: {
               'Content-Type': 'application/json; charset=utf-8'
            },
            method: 'POST',
            body: JSON.stringify(authData)
         });
         const data = await response.json()
         return data
       } catch (error) {
         console.error('Something went wrong!', error)
       }
   }

   async onModuleInit() {
      // this.findUser()
      // this.getSellsPointList()
   }
}
