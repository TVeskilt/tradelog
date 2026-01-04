import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { TradesModule } from './trades/trades.module';

@Module({
  imports: [ConfigModule, PrismaModule, TradesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
