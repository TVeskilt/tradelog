import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, IsDate, IsOptional, IsUUID } from 'class-validator';
import { TradeType, OptionType } from '@prisma/client';

export class CreateTradeDto {
  @ApiProperty({ example: 'AAPL', description: 'Stock symbol' })
  @IsString()
  @IsNotEmpty()
  readonly symbol!: string;

  @ApiProperty({ example: 150.0, description: 'Strike price of the option' })
  @IsNumber()
  @Min(0)
  readonly strikePrice!: number;

  @ApiProperty({ example: '2026-02-15T00:00:00.000Z', description: 'Expiry date (ISO 8601 DateTime format)' })
  @Type(() => Date)
  @IsDate()
  readonly expiryDate!: Date;

  @ApiProperty({ enum: TradeType, example: TradeType.BUY, description: 'Trade type (BUY or SELL)' })
  @IsEnum(TradeType)
  readonly tradeType!: TradeType;

  @ApiProperty({ enum: OptionType, example: OptionType.CALL, description: 'Option type (CALL or PUT)' })
  @IsEnum(OptionType)
  readonly optionType!: OptionType;

  @ApiProperty({ example: 10, description: 'Number of contracts' })
  @IsNumber()
  @Min(1)
  readonly quantity!: number;

  @ApiProperty({ example: 1500.0, description: 'Total cost basis' })
  @IsNumber()
  @Min(0)
  readonly costBasis!: number;

  @ApiProperty({ example: 1750.0, description: 'Current value of the position' })
  @IsNumber()
  @Min(0)
  readonly currentValue!: number;

  @ApiProperty({ example: 'Long call position on AAPL', description: 'Optional notes', required: false })
  @IsOptional()
  @IsString()
  readonly notes?: string;

  @ApiProperty({
    example: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
    description: 'Optional trade group UUID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  readonly tradeGroupUuid?: string;
}
