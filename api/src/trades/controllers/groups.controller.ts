import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { GroupsService } from '../services/groups.service';
import { CreateGroupDto, UpdateGroupDto } from '../dto/request';
import { GroupResponseDto } from '../dto/response';
import { DataResponseDto } from '../../common/dto';

@ApiTags('Groups')
@Controller({ path: 'groups', version: '1' })
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, description: 'Group created successfully' })
  async create(@Body() createGroupDto: CreateGroupDto): Promise<DataResponseDto<GroupResponseDto>> {
    const group = await this.groupsService.create(createGroupDto);
    return new DataResponseDto(plainToInstance(GroupResponseDto, group));
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups with metrics' })
  @ApiResponse({ status: 200, description: 'List of all groups' })
  async findMany(): Promise<DataResponseDto<GroupResponseDto[]>> {
    const groups = await this.groupsService.findMany();
    return new DataResponseDto(groups.map((group) => plainToInstance(GroupResponseDto, group)));
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get a group by UUID' })
  @ApiParam({ name: 'uuid', description: 'Group UUID' })
  @ApiResponse({ status: 200, description: 'Group found' })
  async findByUuid(@Param('uuid') uuid: string): Promise<DataResponseDto<GroupResponseDto>> {
    const group = await this.groupsService.findByUuid(uuid);
    return new DataResponseDto(plainToInstance(GroupResponseDto, group));
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Partially update a group by UUID' })
  @ApiParam({ name: 'uuid', description: 'Group UUID' })
  @ApiResponse({ status: 200, description: 'Group updated successfully' })
  async updateByUuid(
    @Param('uuid') uuid: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<DataResponseDto<GroupResponseDto>> {
    const group = await this.groupsService.updateByUuid(uuid, updateGroupDto);
    return new DataResponseDto(plainToInstance(GroupResponseDto, group));
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a group by UUID' })
  @ApiParam({ name: 'uuid', description: 'Group UUID' })
  @ApiResponse({ status: 200, description: 'Group deleted successfully' })
  async deleteByUuid(@Param('uuid') uuid: string): Promise<DataResponseDto<null>> {
    await this.groupsService.deleteByUuid(uuid);
    return new DataResponseDto(null);
  }
}
