import { Module } from '@nestjs/common';
import { TradesController } from './controllers/trades.controller';
import { TradeGroupsController } from './controllers/trade-groups.controller';
import { StrategiesController } from './controllers/strategies.controller';
import { TradesService } from './services/trades.service';
import { TradeGroupsService } from './services/trade-groups.service';

@Module({
  controllers: [TradesController, TradeGroupsController, StrategiesController],
  providers: [TradesService, TradeGroupsService],
})
export class TradesModule {}
