import { Module } from '@nestjs/common';
import { TradesController } from './controllers/trades.controller';
import { TradeGroupsController } from './controllers/trade-groups.controller';
import { TradesService } from './services/trades.service';
import { TradeGroupsService } from './services/trade-groups.service';

@Module({
  controllers: [TradesController, TradeGroupsController],
  providers: [TradesService, TradeGroupsService],
})
export class TradesModule {}
