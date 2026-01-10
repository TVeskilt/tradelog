import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { TradesService } from '../services/trades.service';
import { CreateTradeDto, UpdateTradeDto } from '../dto/request';
import { TradeResponseDto } from '../dto/response';
import { DataResponseDto } from '../../common/dto';
import { ApiCreatedDataResponse, ApiOkDataResponse } from '../../common/decorators';

@ApiTags('Trades')
@Controller({ path: 'trades', version: '1' })
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new trade' })
  @ApiCreatedDataResponse({ data: { type: TradeResponseDto } })
  async create(@Body() createTradeDto: CreateTradeDto): Promise<DataResponseDto<TradeResponseDto>> {
    const trade = await this.tradesService.create(createTradeDto);
    return new DataResponseDto(plainToInstance(TradeResponseDto, trade));
  }

  @Get()
  @ApiOperation({ summary: 'Get all trades' })
  @ApiOkDataResponse({ data: { type: TradeResponseDto, isArray: true } })
  async findMany(): Promise<DataResponseDto<TradeResponseDto[]>> {
    const trades = await this.tradesService.findMany();
    return new DataResponseDto(trades.map((trade) => plainToInstance(TradeResponseDto, trade)));
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get a trade by UUID' })
  @ApiParam({ name: 'uuid', description: 'Trade UUID' })
  @ApiOkDataResponse({ data: { type: TradeResponseDto } })
  async findByUuid(@Param('uuid') uuid: string): Promise<DataResponseDto<TradeResponseDto>> {
    const trade = await this.tradesService.findByUuid(uuid);
    return new DataResponseDto(plainToInstance(TradeResponseDto, trade));
  }

  @Put(':uuid')
  @ApiOperation({ summary: 'Update a trade by UUID' })
  @ApiParam({ name: 'uuid', description: 'Trade UUID' })
  @ApiOkDataResponse({ data: { type: TradeResponseDto } })
  async updateByUuid(
    @Param('uuid') uuid: string,
    @Body() updateTradeDto: UpdateTradeDto,
  ): Promise<DataResponseDto<TradeResponseDto>> {
    const trade = await this.tradesService.updateByUuid(uuid, updateTradeDto);
    return new DataResponseDto(plainToInstance(TradeResponseDto, trade));
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a trade by UUID' })
  @ApiParam({ name: 'uuid', description: 'Trade UUID' })
  @ApiOkDataResponse({ data: { type: TradeResponseDto } })
  async deleteByUuid(@Param('uuid') uuid: string): Promise<DataResponseDto<null>> {
    await this.tradesService.deleteByUuid(uuid);
    return new DataResponseDto(null);
  }
}
