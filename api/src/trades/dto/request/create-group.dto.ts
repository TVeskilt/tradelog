import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, ArrayMinSize, IsUUID } from 'class-validator';
import { StrategyType } from '@prisma/client';

export class CreateGroupDto {
  @ApiProperty({ example: 'Calendar Spread Feb-15-2026', description: 'Group name' })
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @ApiProperty({
    enum: StrategyType,
    example: StrategyType.CALENDAR_SPREAD,
    description: 'Strategy type for the group',
  })
  @IsEnum(StrategyType)
  readonly strategyType!: StrategyType;

  @ApiProperty({
    example: ['a3bb189e-8bf9-3888-9912-ace4e6543001', 'a3bb189e-8bf9-3888-9912-ace4e6543002'],
    description: 'Array of trade UUIDs to include in the group (minimum 2 required)',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'A group must have at least 2 trades' })
  @IsUUID('4', { each: true })
  readonly tradeUuids!: string[];

  @ApiProperty({
    example: 'Selling Feb-15 $150 call, buying Mar-15 $150 call',
    description: 'Optional notes about the group',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly notes?: string;
}
