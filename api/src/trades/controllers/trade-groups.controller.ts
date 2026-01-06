import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { TradeGroupsService } from '../services/trade-groups.service';
import { CreateTradeGroupDto, UpdateTradeGroupDto } from '../dto/request';
import { TradeGroupResponseDto } from '../dto/response';
import { DataResponseDto } from '../../common/dto';

@ApiTags('Trade Groups')
@Controller({ path: 'trade-groups', version: '1' })
export class TradeGroupsController {
  constructor(private readonly tradeGroupsService: TradeGroupsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new trade group' })
  @ApiResponse({ status: 201, description: 'Trade group created successfully' })
  async create(@Body() createTradeGroupDto: CreateTradeGroupDto): Promise<DataResponseDto<TradeGroupResponseDto>> {
    const tradeGroup = await this.tradeGroupsService.create(createTradeGroupDto);
    return new DataResponseDto(plainToInstance(TradeGroupResponseDto, tradeGroup));
  }

  @Get()
  @ApiOperation({ summary: 'Get all trade groups with metrics' })
  @ApiResponse({ status: 200, description: 'List of all trade groups' })
  async findMany(): Promise<DataResponseDto<TradeGroupResponseDto[]>> {
    const tradeGroups = await this.tradeGroupsService.findMany();
    return new DataResponseDto(tradeGroups.map((tradeGroup) => plainToInstance(TradeGroupResponseDto, tradeGroup)));
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get a trade group by UUID' })
  @ApiParam({ name: 'uuid', description: 'Trade group UUID' })
  @ApiResponse({ status: 200, description: 'Trade group found' })
  async findByUuid(@Param('uuid') uuid: string): Promise<DataResponseDto<TradeGroupResponseDto>> {
    const tradeGroup = await this.tradeGroupsService.findByUuid(uuid);
    return new DataResponseDto(plainToInstance(TradeGroupResponseDto, tradeGroup));
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Partially update a trade group by UUID' })
  @ApiParam({ name: 'uuid', description: 'Trade group UUID' })
  @ApiResponse({ status: 200, description: 'Trade group updated successfully' })
  async updateByUuid(
    @Param('uuid') uuid: string,
    @Body() updateTradeGroupDto: UpdateTradeGroupDto,
  ): Promise<DataResponseDto<TradeGroupResponseDto>> {
    const tradeGroup = await this.tradeGroupsService.updateByUuid(uuid, updateTradeGroupDto);
    return new DataResponseDto(plainToInstance(TradeGroupResponseDto, tradeGroup));
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a trade group by UUID' })
  @ApiParam({ name: 'uuid', description: 'Trade group UUID' })
  @ApiResponse({ status: 200, description: 'Trade group deleted successfully' })
  async deleteByUuid(@Param('uuid') uuid: string): Promise<DataResponseDto<null>> {
    await this.tradeGroupsService.deleteByUuid(uuid);
    return new DataResponseDto(null);
  }
}
