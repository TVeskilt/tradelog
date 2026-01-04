import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { TradesService } from '../services/trades.service';
import { CreateTradeDto, UpdateTradeDto } from '../dto/request';
import { TradeResponseDto } from '../dto/response';
import { DataResponseDto } from '../../common/dto';

@ApiTags('Trades')
@Controller({ path: 'trades', version: '1' })
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new trade' })
  @ApiResponse({ status: 201, description: 'Trade created successfully' })
  async create(@Body() createTradeDto: CreateTradeDto): Promise<DataResponseDto<TradeResponseDto>> {
    const trade = await this.tradesService.create(createTradeDto);
    return new DataResponseDto(plainToInstance(TradeResponseDto, trade));
  }

  @Get()
  @ApiOperation({ summary: 'Get all trades' })
  @ApiResponse({ status: 200, description: 'List of all trades' })
  async findMany(): Promise<DataResponseDto<TradeResponseDto[]>> {
    const trades = await this.tradesService.findMany();
    return new DataResponseDto(trades.map((trade) => plainToInstance(TradeResponseDto, trade)));
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get a trade by UUID' })
  @ApiParam({ name: 'uuid', description: 'Trade UUID' })
  @ApiResponse({ status: 200, description: 'Trade found' })
  async findByUuid(@Param('uuid') uuid: string): Promise<DataResponseDto<TradeResponseDto>> {
    const trade = await this.tradesService.findByUuid(uuid);
    return new DataResponseDto(plainToInstance(TradeResponseDto, trade));
  }

  @Put(':uuid')
  @ApiOperation({ summary: 'Update a trade by UUID' })
  @ApiParam({ name: 'uuid', description: 'Trade UUID' })
  @ApiResponse({ status: 200, description: 'Trade updated successfully' })
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
  @ApiResponse({ status: 200, description: 'Trade deleted successfully' })
  async deleteByUuid(@Param('uuid') uuid: string): Promise<DataResponseDto<null>> {
    await this.tradesService.deleteByUuid(uuid);
    return new DataResponseDto(null);
  }
}
