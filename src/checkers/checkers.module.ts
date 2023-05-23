import { Module } from '@nestjs/common';
import { CheckersService } from './checkers.service';

@Module({
  providers: [CheckersService]
})
export class CheckersModule {}
