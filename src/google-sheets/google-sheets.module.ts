import { Module } from '@nestjs/common';
import { GoogleSheetsService } from './google-sheets.service';

@Module({
  providers: [GoogleSheetsService]
})
export class GoogleSheetsModule {}
