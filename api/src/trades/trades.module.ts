import { Module } from '@nestjs/common';
import { TradesController } from './controllers/trades.controller';
import { GroupsController } from './controllers/groups.controller';
import { TradesService } from './services/trades.service';
import { GroupsService } from './services/groups.service';

@Module({
  controllers: [TradesController, GroupsController],
  providers: [TradesService, GroupsService],
})
export class TradesModule {}
