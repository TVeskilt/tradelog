import { Module } from '@nestjs/common';
import { TradesController } from './controllers/trades.controller';
import { TradesService } from './services/trades.service';

@Module({
  controllers: [TradesController],
  providers: [TradesService],
})
export class TradesModule {}
