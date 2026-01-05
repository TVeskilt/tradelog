import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { StrategyType } from '@prisma/client';

export class UpdateGroupDto {
  @ApiProperty({ example: 'Calendar Spread Feb-15-2026 (UPDATED)', description: 'Group name', required: false })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiProperty({
    enum: StrategyType,
    example: StrategyType.CUSTOM,
    description: 'Strategy type for the group',
    required: false,
  })
  @IsOptional()
  @IsEnum(StrategyType)
  readonly strategyType?: StrategyType;

  @ApiProperty({
    example: 'Updated notes for this group',
    description: 'Optional notes about the group',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly notes?: string;
}
