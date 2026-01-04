import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { TradeType, OptionType, TradeStatus } from '@prisma/client';

export class TradeResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  uuid!: string;

  @ApiProperty({ example: 'AAPL' })
  @Expose()
  symbol!: string;

  @ApiProperty({ example: 150.0 })
  @Expose()
  strikePrice!: number;

  @ApiProperty({ example: '2026-02-15' })
  @Expose()
  expiryDate!: string;

  @ApiProperty({ enum: TradeType, example: TradeType.BUY })
  @Expose()
  tradeType!: TradeType;

  @ApiProperty({ enum: OptionType, example: OptionType.CALL })
  @Expose()
  optionType!: OptionType;

  @ApiProperty({ example: 10 })
  @Expose()
  quantity!: number;

  @ApiProperty({ example: 1500.0 })
  @Expose()
  costBasis!: number;

  @ApiProperty({ example: 1750.0 })
  @Expose()
  currentValue!: number;

  @ApiProperty({ enum: TradeStatus, example: TradeStatus.OPEN })
  @Expose()
  status!: TradeStatus;

  @ApiProperty({ example: 'Long call position on AAPL', required: false })
  @Expose()
  notes!: string | null;

  @ApiProperty({ example: 'a3bb189e-8bf9-3888-9912-ace4e6543002', required: false })
  @Expose()
  groupUuid!: string | null;

  @ApiProperty({ example: 250.0, description: 'Calculated P&L (currentValue - costBasis)' })
  @Expose()
  pnl!: number;

  @ApiProperty({ example: 42, description: 'Days until expiry' })
  @Expose()
  daysToExpiry!: number;
}
