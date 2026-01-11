import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { StrategyType } from '@prisma/client';
import { CreateTradeDto } from './create-trade.dto';

class GroupDataDto {
  @ApiProperty({ example: 'AAPL Calendar Spread Feb-15', description: 'Strategy group name' })
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @ApiProperty({
    enum: StrategyType,
    example: StrategyType.CALENDAR_SPREAD,
    description: 'Strategy type',
  })
  @IsEnum(StrategyType)
  readonly strategyType!: StrategyType;

  @ApiProperty({
    example: 'Selling Feb-15 $150 call, buying Mar-15 $150 call',
    description: 'Optional notes about the strategy',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly notes?: string;
}

export class CreateStrategyDto {
  @ApiProperty({ type: GroupDataDto, description: 'Strategy group metadata' })
  @ValidateNested()
  @Type(() => GroupDataDto)
  readonly group!: GroupDataDto;

  @ApiProperty({
    type: [CreateTradeDto],
    description: 'Array of trades to include in the strategy (minimum 2 required)',
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'A strategy must have at least 2 trades' })
  @ValidateNested({ each: true })
  @Type(() => CreateTradeDto)
  readonly trades!: CreateTradeDto[];
}
