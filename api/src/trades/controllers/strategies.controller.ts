import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { TradeGroupsService } from '../services/trade-groups.service';
import { CreateStrategyDto } from '../dto/request';
import { TradeGroupResponseDto } from '../dto/response';
import { DataResponseDto } from '../../common/dto';
import { ApiCreatedDataResponse } from '../../common/decorators';

@ApiTags('Strategies')
@Controller({ path: 'strategies', version: '1' })
export class StrategiesController {
  constructor(private readonly tradeGroupsService: TradeGroupsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a multi-leg strategy (group + trades atomically)' })
  @ApiCreatedDataResponse({ data: { type: TradeGroupResponseDto } })
  async createStrategy(@Body() createStrategyDto: CreateStrategyDto): Promise<DataResponseDto<TradeGroupResponseDto>> {
    const strategy = await this.tradeGroupsService.createStrategy(createStrategyDto);
    return new DataResponseDto(plainToInstance(TradeGroupResponseDto, strategy));
  }
}
