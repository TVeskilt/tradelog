import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { TradeType, OptionType, TradeStatus } from '@prisma/client';

export class TradeResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  readonly uuid!: string;

  @ApiProperty({ example: 'AAPL' })
  @Expose()
  readonly symbol!: string;

  @ApiProperty({ example: 150.0 })
  @Expose()
  readonly strikePrice!: number;

  @ApiProperty({ example: '2026-02-15' })
  @Expose()
  readonly expiryDate!: string;

  @ApiProperty({ enum: TradeType, example: TradeType.BUY })
  @Expose()
  readonly tradeType!: TradeType;

  @ApiProperty({ enum: OptionType, example: OptionType.CALL })
  @Expose()
  readonly optionType!: OptionType;

  @ApiProperty({ example: 10 })
  @Expose()
  readonly quantity!: number;

  @ApiProperty({ example: 1500.0 })
  @Expose()
  readonly costBasis!: number;

  @ApiProperty({ example: 1750.0 })
  @Expose()
  readonly currentValue!: number;

  @ApiProperty({ enum: TradeStatus, example: TradeStatus.OPEN })
  @Expose()
  readonly status!: TradeStatus;

  @ApiProperty({
    type: String,
    example: 'Long call position on AAPL',
    required: false,
    nullable: true,
  })
  @Expose()
  readonly notes!: string | null;

  @ApiProperty({
    type: String,
    example: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
    required: false,
    nullable: true,
  })
  @Expose()
  readonly tradeGroupUuid!: string | null;

  @ApiProperty({ example: 250.0, description: 'Calculated P&L (currentValue - costBasis)' })
  @Expose()
  readonly pnl!: number;

  @ApiProperty({ example: 42, description: 'Days until expiry' })
  @Expose()
  readonly daysToExpiry!: number;
}
