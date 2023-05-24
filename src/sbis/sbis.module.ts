import { Module } from '@nestjs/common';

import { SbisService } from './sbis.service';

@Module({
  providers: [SbisService],
  exports: [SbisService]
})
export class SbisModule {}
