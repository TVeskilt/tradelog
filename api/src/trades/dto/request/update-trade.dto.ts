import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { TradeStatus } from '@prisma/client';
import { CreateTradeDto } from './create-trade.dto';

export class UpdateTradeDto extends PartialType(CreateTradeDto) {
  @ApiProperty({ enum: TradeStatus, example: TradeStatus.CLOSING_SOON, description: 'Trade status', required: false })
  @IsOptional()
  @IsEnum(TradeStatus)
  readonly status?: TradeStatus;
}
