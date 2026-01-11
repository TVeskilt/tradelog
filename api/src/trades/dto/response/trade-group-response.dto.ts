import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { StrategyType, TradeStatus } from '@prisma/client';
import { TradeResponseDto } from './trade-response.dto';

export class TradeGroupResponseDto {
  @ApiProperty({ example: 'b4cc290f-9cf0-4999-0023-bdf5f7654003' })
  @Expose()
  readonly uuid!: string;

  @ApiProperty({ example: 'Calendar Spread Feb-15-2026' })
  @Expose()
  readonly name!: string;

  @ApiProperty({ enum: StrategyType, example: StrategyType.CALENDAR_SPREAD })
  @Expose()
  readonly strategyType!: StrategyType;

  @ApiProperty({
    type: String,
    example: 'Selling Feb-15 $150 call, buying Mar-15 $150 call',
    required: false,
    nullable: true
  })
  @Expose()
  readonly notes!: string | null;

  @ApiProperty({ example: '2026-02-15T00:00:00.000Z', description: 'Earliest expiry date among child trades' })
  @Expose()
  readonly closingExpiry!: Date;

  @ApiProperty({ example: 41, description: 'Days until closingExpiry' })
  @Expose()
  readonly daysUntilClosingExpiry!: number;

  @ApiProperty({ enum: TradeStatus, example: TradeStatus.OPEN, description: 'Derived from closingExpiry' })
  @Expose()
  readonly status!: TradeStatus;

  @ApiProperty({ example: 1500.0, description: 'Sum of all child trade costBasis values' })
  @Expose()
  readonly totalCostBasis!: number;

  @ApiProperty({ example: 1750.0, description: 'Sum of all child trade currentValue values' })
  @Expose()
  readonly totalCurrentValue!: number;

  @ApiProperty({ example: 250.0, description: 'Calculated P&L (totalCurrentValue - totalCostBasis)' })
  @Expose()
  readonly profitLoss!: number;

  @ApiProperty({ type: [TradeResponseDto], description: 'Child trades in this group' })
  @Expose()
  @Type(() => TradeResponseDto)
  readonly trades!: TradeResponseDto[];
}
