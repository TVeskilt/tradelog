import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, ArrayMinSize, IsUUID } from 'class-validator';
import { StrategyType } from '@prisma/client';

export class CreateTradeGroupDto {
  @ApiProperty({ example: 'Calendar Spread Feb-15-2026', description: 'Trade group name' })
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @ApiProperty({
    enum: StrategyType,
    example: StrategyType.CALENDAR_SPREAD,
    description: 'Strategy type for the trade group',
  })
  @IsEnum(StrategyType)
  readonly strategyType!: StrategyType;

  @ApiProperty({
    example: ['a3bb189e-8bf9-3888-9912-ace4e6543001', 'a3bb189e-8bf9-3888-9912-ace4e6543002'],
    description: 'Array of trade UUIDs to include in the trade group (minimum 2 required)',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'A trade group must have at least 2 trades' })
  @IsUUID('4', { each: true })
  readonly tradeUuids!: string[];

  @ApiProperty({
    example: 'Selling Feb-15 $150 call, buying Mar-15 $150 call',
    description: 'Optional notes about the trade group',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly notes?: string;
}
