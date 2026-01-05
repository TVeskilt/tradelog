# STORY-005: Group CRUD API Endpoints

**Epic:** EPIC-002: Trade & Group Management
**Priority:** Critical
**Story Points:** 7
**Status:** Not Started
**Assigned To:** Unassigned
**Created:** 2026-01-05
**Updated:** 2026-01-05 (Aligned with existing Trade API patterns)
**Sprint:** Sprint 2

---

## User Story

As a **trader**
I want to **manage trade groups via REST API endpoints**
So that **I can organize my multi-leg options strategies and view aggregate metrics**

---

## Description

### Background

Interactive Brokers limits multi-leg options strategies to a fixed number of legs and doesn't allow editing groups after creation. This creates frustration when managing complex strategies like calendar spreads and ratio spreads that may have 5+ legs or require adding hedges over time.

This story implements the Group CRUD API that enables unlimited leg grouping and dynamic group management. Groups aggregate individual trades and automatically calculate derived metrics including:

- **closingExpiry:** Earliest expiry date of all child trades (MIN of expiryDate)
- **daysUntilClosingExpiry:** Days remaining until closingExpiry (calculated)
- **status:** Derived from closingExpiry (<7 days = CLOSING_SOON, past = CLOSED, else OPEN)
- **totalPnL:** Sum of all child trade P&Ls
- **profitLoss:** Alias for totalPnL (for consistency)

The API completes the backend foundation, allowing the frontend to provide the flexible grouping experience that IB lacks. This implementation follows the same derived field pattern established in STORY-004 (Trade API).

### Scope

**In scope:**

- REST API endpoints for Group CRUD operations (Create, Read, Update, Delete)
- Automatic calculation of derived group metrics (closingExpiry, status, totalPnL)
- GroupsController and GroupsService in existing `api/src/trades/` domain
- Request/Response DTOs with validation (CreateGroupDto, UpdateGroupDto, GroupResponseDto)
- GroupWithMetricsInterface interface for internal service layer
- Swagger/OpenAPI documentation for all endpoints
- E2E tests for all endpoints using NestJS Supertest
- Business rule enforcement: Groups must have 2+ trades
- Transaction handling for group operations

**Out of scope:**

- Frontend UI for group management (STORY-007)
- Quick entry templates (FR-010, future enhancement)
- Group editing via drag-and-drop (frontend concern)
- Advanced filtering/pagination (deferred until >100 groups)
- Real-time updates (WebSocket, post-MVP)

### User Flow

**Create Group Flow:**

1. User has created 2+ individual trades via STORY-004 API
2. Frontend sends POST /v1/groups with name, strategyType, tradeUuids[], notes
3. Backend validates request (2+ trades required)
4. Backend creates group and updates trades.groupUuid in transaction
5. Backend calculates derived metrics (closingExpiry, status, totalPnL)
6. Backend returns GroupResponseDto with all metrics
7. User sees new group in frontend with calculated status and P&L

**Read Group Flow:**

1. User opens dashboard or expands group in trade list
2. Frontend sends GET /v1/groups/:uuid
3. Backend queries group with included trades (single query with join)
4. Backend calculates derived metrics on-demand
5. Backend returns GroupResponseDto with nested TradeResponseDto[]
6. User sees group details including all legs and aggregate P&L

**Update Group Flow:**

1. User edits group name or strategy type
2. Frontend sends PATCH /v1/groups/:uuid with updated fields
3. Backend validates and updates group
4. Backend recalculates metrics
5. Backend returns updated GroupResponseDto
6. User sees updated group information

**Delete Group Flow:**

1. User deletes group from frontend
2. Frontend sends DELETE /v1/groups/:uuid
3. Backend deletes group (ON DELETE SET NULL preserves trades)
4. Backend returns success
5. Child trades become ungrouped (groupUuid = null)
6. User sees trades moved to "Ungrouped" section

---

## Acceptance Criteria

### Test Environment Setup (PREREQUISITE - Must Complete First)

**⚠️ CRITICAL:** Current e2e tests wipe the development database! This must be fixed before implementing STORY-005.

**Problem:** `api/test/e2e/trades.e2e-spec.ts:50-54` runs `deleteMany()` on `tradelog_dev` database before each test.

**Solution:** Create separate test database to prevent data loss.

- [ ] **Create `.env.test` file in `api/` directory:**

  ```bash
  DATABASE_URL="postgresql://tradelog_user:tradelog_dev_password_change_in_production@localhost:5432/tradelog_test?schema=public"
  NODE_ENV=test
  PORT=3000
  ```

- [ ] **Install dotenv-cli:**

  ```bash
  cd api
  pnpm add -D dotenv-cli
  ```

- [ ] **Update `api/package.json` test script:**

  ```json
  "test:e2e": "NODE_ENV=test dotenv -e .env.test -- jest --config ./test/jest-e2e.json"
  ```

- [ ] **Run migrations on test database (Prisma will auto-create DB):**

  ```bash
  cd api
  DATABASE_URL="postgresql://tradelog_user:tradelog_dev_password_change_in_production@localhost:5432/tradelog_test?schema=public" pnpm prisma migrate deploy
  ```

- [ ] **Verify test database setup:**

  ```bash
  # Run existing e2e tests (should use tradelog_test, not tradelog_dev)
  cd api
  pnpm test:e2e

  # Verify dev database is untouched:
  # - tradelog_dev still has your development data
  # - tradelog_test was created and is being used for tests
  ```

- [ ] **Add `.env.test` to `.gitignore` (if not already covered by `.env*` pattern)**

**Why this is a prerequisite:**

- Prevents accidental data loss during development
- Allows safe iteration on e2e tests
- Required for implementing and testing STORY-005 Groups API
- Fixes existing issue with STORY-004 Trade API tests

**Estimated effort:** 10-15 minutes (one-time setup)

---

### API Endpoints

- [ ] **POST /v1/groups** - Create new group
  - Input: CreateGroupDto (name, strategyType, tradeUuids[], notes?)
  - Output: DataResponseDto<GroupResponseDto>
  - Returns 201 Created on success
  - Returns 400 Bad Request if <2 trades provided
  - Returns 400 Bad Request if any tradeUuid doesn't exist

- [ ] **GET /v1/groups** - List all groups with metrics
  - Output: DataResponseDto<GroupResponseDto[]>
  - Returns 200 OK
  - Each group includes calculated fields: closingExpiry, status, totalPnL
  - Each group includes nested trades array
  - Empty array returned if no groups exist

- [ ] **GET /v1/groups/:uuid** - Get single group with metrics and trades
  - Output: DataResponseDto<GroupResponseDto>
  - Returns 200 OK if found
  - Returns 404 Not Found if uuid doesn't exist
  - Includes all derived metrics
  - Includes nested TradeResponseDto[]

- [ ] **PATCH /v1/groups/:uuid** - Partially update group
  - Input: UpdateGroupDto (name?, strategyType?, notes?) - All fields optional
  - Output: DataResponseDto<GroupResponseDto>
  - Returns 200 OK on success
  - Returns 404 Not Found if uuid doesn't exist
  - Returns 400 Bad Request on validation errors
  - Does NOT update trades (use separate trade endpoints)
  - Uses PATCH (not PUT) since UpdateGroupDto allows partial updates

- [ ] **DELETE /v1/groups/:uuid** - Delete group
  - Output: DataResponseDto<void>
  - Returns 200 OK on success
  - Returns 404 Not Found if uuid doesn't exist
  - ON DELETE SET NULL behavior: child trades preserved with groupUuid = null

### DTOs and Validation

- [ ] **CreateGroupDto** includes:
  - name: string (required, @IsString)
  - strategyType: StrategyType enum (required, @IsEnum)
  - tradeUuids: string[] (required, @IsArray, @ArrayMinSize(2))
  - notes: string (optional, @IsOptional, @IsString)

- [ ] **UpdateGroupDto** includes:
  - name: string (optional, @IsOptional, @IsString)
  - strategyType: StrategyType enum (optional, @IsOptional, @IsEnum)
  - notes: string (optional, @IsOptional, @IsString)
  - All fields optional (PartialType pattern)

- [ ] **GroupResponseDto** includes:
  - uuid: string (@Expose)
  - name: string (@Expose)
  - strategyType: StrategyType (@Expose)
  - notes: string? (@Expose)
  - closingExpiry: Date (@Expose) - **Calculated field** (MIN of trade expiry dates)
  - daysUntilClosingExpiry: number (@Expose) - **Calculated field** (days until closingExpiry)
  - status: TradeStatus (@Expose) - **Derived field** (based on closingExpiry)
  - totalCostBasis: number (@Expose) - **Calculated field** (SUM of trade costBasis)
  - totalCurrentValue: number (@Expose) - **Calculated field** (SUM of trade currentValue)
  - profitLoss: number (@Expose) - **Calculated field** (totalCurrentValue - totalCostBasis)
  - trades: TradeResponseDto[] (@Expose, @Type) - Nested child trades
  - createdAt and updatedAt NOT exposed
  - Follows same pattern as TradeResponseDto (pnl, daysToExpiry)

- [ ] **GroupWithMetricsInterface interface** in `api/src/trades/interfaces/`
  - Used internally by GroupsService
  - Combines Prisma Group type with calculated metrics
  - NO "I" prefix (e.g., GroupWithMetricsInterface, not IGroupWithMetrics)

### Business Logic

- [ ] **Group integrity rule:** Groups must have 2+ trades
  - Enforced on creation (CreateGroupDto validation)
  - If trade removal leaves <2 trades, auto-ungroup remaining trade(s)

- [ ] **closingExpiry calculation:**
  - closingExpiry = MIN(trade.expiryDate) across all child trades
  - Calculated on every read, never stored

- [ ] **daysUntilClosingExpiry calculation:**
  - daysUntilClosingExpiry = Math.floor((closingExpiry - now) / (1000 _ 60 _ 60 \* 24))
  - Follows same pattern as TradeResponseDto.daysToExpiry
  - Calculated on every read, never stored

- [ ] **Status derivation logic:**
  - If daysUntilClosingExpiry < 0: CLOSED
  - If daysUntilClosingExpiry <= 7: CLOSING_SOON
  - Otherwise: OPEN
  - Calculated on every read, never stored
  - Uses daysUntilClosingExpiry for consistency

- [ ] **P&L calculations:**
  - totalCostBasis = SUM(trade.costBasis) across all child trades
  - totalCurrentValue = SUM(trade.currentValue) across all child trades
  - profitLoss = totalCurrentValue - totalCostBasis
  - Calculated on every read, never stored

### Transaction Handling

- [ ] **Create group transaction:**
  - BEGIN TRANSACTION
  - INSERT INTO groups
  - UPDATE trades SET groupUuid WHERE uuid IN (tradeUuids)
  - COMMIT
  - Rollback if any operation fails

- [ ] **Delete group behavior:**
  - ON DELETE SET NULL constraint handles automatically
  - Child trades preserved with groupUuid = null
  - No explicit transaction needed

### Documentation

- [ ] **Swagger/OpenAPI documentation:**
  - All endpoints documented with @ApiOperation
  - DTOs documented with @ApiProperty
  - Request/response types defined
  - Enum values documented
  - Accessible at /api/docs

### Testing

- [ ] **E2E tests pass for all endpoints:**
  - POST /v1/groups creates group and updates trades
  - GET /v1/groups returns all groups with metrics
  - GET /v1/groups/:uuid returns single group with nested trades
  - PATCH /v1/groups/:uuid updates group fields
  - DELETE /v1/groups/:uuid deletes group and ungroups trades
  - Validation errors return 400 Bad Request
  - Not found errors return 404 Not Found
  - Derived metrics calculated correctly

### Performance

- [ ] **Group metrics calculation completes <100ms** for groups with up to 20 trades
- [ ] **No N+1 query problems** - Use Prisma include for eager loading trades

---

## Technical Notes

### Components Involved

**Backend:**

- `api/src/trades/controllers/groups.controller.ts` - NEW
- `api/src/trades/services/groups.service.ts` - NEW
- `api/src/trades/dto/request/create-group.dto.ts` - NEW
- `api/src/trades/dto/request/update-group.dto.ts` - NEW
- `api/src/trades/dto/response/group-response.dto.ts` - NEW
- `api/src/trades/interfaces/group-with-metrics.interface.ts` - NEW (NO "I" prefix)
- `api/src/trades/trades.module.ts` - UPDATED (add GroupsController, GroupsService)

**Database:**

- `groups` table (already exists via STORY-003 Prisma schema)
- `trades` table (groupUuid FK already exists)

**Shared:**

- Prisma enums: StrategyType, TradeStatus
- DataResponseDto<T> wrapper (already exists)

### API Endpoints Detail

#### POST /v1/groups

**Request:**

```json
{
  "name": "Calendar Spread Feb-15-2026",
  "strategyType": "CALENDAR_SPREAD",
  "tradeUuids": ["a3bb189e-8bf9-3888-9912-ace4e6543001", "a3bb189e-8bf9-3888-9912-ace4e6543002"],
  "notes": "Selling Feb-15 $150 call, buying Mar-15 $150 call"
}
```

**Response (201 Created):**

```json
{
  "data": {
    "uuid": "b4cc290f-9cf0-4999-0023-bdf5f7654003",
    "name": "Calendar Spread Feb-15-2026",
    "strategyType": "CALENDAR_SPREAD",
    "notes": "Selling Feb-15 $150 call, buying Mar-15 $150 call",
    "closingExpiry": "2026-02-15T00:00:00.000Z",
    "daysUntilClosingExpiry": 41,
    "status": "OPEN",
    "totalCostBasis": 1500.0,
    "totalCurrentValue": 1750.0,
    "profitLoss": 250.0,
    "trades": [
      {
        /* TradeResponseDto 1 */
      },
      {
        /* TradeResponseDto 2 */
      }
    ]
  }
}
```

#### GET /v1/groups

**Response (200 OK):**

```json
{
  "data": [
    {
      "uuid": "b4cc290f-9cf0-4999-0023-bdf5f7654003",
      "name": "Calendar Spread Feb-15-2026",
      "strategyType": "CALENDAR_SPREAD",
      "closingExpiry": "2026-02-15T00:00:00.000Z",
      "daysUntilClosingExpiry": 5,
      "status": "CLOSING_SOON",
      "totalCostBasis": 1500.0,
      "totalCurrentValue": 1750.0,
      "profitLoss": 250.0,
      "trades": [
        /* nested trades */
      ]
    }
  ]
}
```

#### GET /v1/groups/:uuid

**Response (200 OK):**

```json
{
  "data": {
    "uuid": "b4cc290f-9cf0-4999-0023-bdf5f7654003",
    "name": "Calendar Spread Feb-15-2026",
    "strategyType": "CALENDAR_SPREAD",
    "notes": "Selling Feb-15 $150 call, buying Mar-15 $150 call",
    "closingExpiry": "2026-02-15T00:00:00.000Z",
    "daysUntilClosingExpiry": 5,
    "status": "CLOSING_SOON",
    "totalCostBasis": 1500.0,
    "totalCurrentValue": 1750.0,
    "profitLoss": 250.0,
    "trades": [
      {
        "uuid": "a3bb189e-8bf9-3888-9912-ace4e6543001",
        "symbol": "AAPL",
        "strikePrice": 150.0,
        "expiryDate": "2026-02-15T00:00:00.000Z",
        "tradeType": "SELL",
        "optionType": "CALL",
        "quantity": 10,
        "costBasis": 750.0,
        "currentValue": 850.0,
        "pnl": 100.0,
        "daysToExpiry": 5,
        "status": "CLOSING_SOON",
        "notes": "Short leg",
        "groupUuid": "b4cc290f-9cf0-4999-0023-bdf5f7654003"
      },
      {
        "uuid": "a3bb189e-8bf9-3888-9912-ace4e6543002",
        "symbol": "AAPL",
        "strikePrice": 150.0,
        "expiryDate": "2026-03-15T00:00:00.000Z",
        "tradeType": "BUY",
        "optionType": "CALL",
        "quantity": 10,
        "costBasis": 750.0,
        "currentValue": 900.0,
        "pnl": 150.0,
        "daysToExpiry": 69,
        "status": "OPEN",
        "notes": "Long leg",
        "groupUuid": "b4cc290f-9cf0-4999-0023-bdf5f7654003"
      }
    ]
  }
}
```

#### PATCH /v1/groups/:uuid

**Request:**

```json
{
  "name": "Calendar Spread Feb-15-2026 (UPDATED)",
  "notes": "Adjusted notes"
}
```

**Response (200 OK):**

```json
{
  "data": {
    /* Updated GroupResponseDto */
  }
}
```

#### DELETE /v1/groups/:uuid

**Response (200 OK):**

```json
{
  "data": null
}
```

### Database Schema (Reference)

```prisma
model Group {
  uuid         String       @id @default(uuid())
  name         String
  strategyType StrategyType
  notes        String?      @db.Text
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  trades       Trade[]

  @@index([strategyType])
  @@map("groups")
}

model Trade {
  uuid         String      @id @default(uuid())
  symbol       String
  strikePrice  Decimal     @db.Decimal(10, 2)
  expiryDate   DateTime    @db.Date
  tradeType    TradeType
  optionType   OptionType
  quantity     Int
  costBasis    Decimal     @db.Decimal(10, 2)
  currentValue Decimal     @db.Decimal(10, 2)
  status       TradeStatus
  notes        String?     @db.Text
  groupUuid    String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  group        Group?      @relation(fields: [groupUuid], references: [uuid], onDelete: SetNull)

  @@index([groupUuid])
  @@map("trades")
}
```

### Implementation Patterns

**Controller Pattern (groups.controller.ts):**

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { GroupsService } from '../services/groups.service';
import { CreateGroupDto, UpdateGroupDto } from '../dto/request';
import { GroupResponseDto } from '../dto/response';
import { DataResponseDto } from '@/common/dto';

@ApiTags('Groups')
@Controller({ path: 'groups', version: '1' })
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, type: GroupResponseDto })
  async create(@Body() createGroupDto: CreateGroupDto): Promise<DataResponseDto<GroupResponseDto>> {
    const group = await this.groupsService.create(createGroupDto);
    return new DataResponseDto(plainToInstance(GroupResponseDto, group));
  }

  @Get()
  @ApiOperation({ summary: 'List all groups with metrics' })
  async findAll(): Promise<DataResponseDto<GroupResponseDto[]>> {
    const groups = await this.groupsService.findAll();
    return new DataResponseDto(groups.map((g) => plainToInstance(GroupResponseDto, g)));
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get single group with metrics' })
  @ApiParam({ name: 'uuid', description: 'Group UUID' })
  async findByUuid(@Param('uuid') uuid: string): Promise<DataResponseDto<GroupResponseDto>> {
    const group = await this.groupsService.findByUuid(uuid);
    return new DataResponseDto(plainToInstance(GroupResponseDto, group));
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Partially update a group' })
  @ApiParam({ name: 'uuid', description: 'Group UUID' })
  async update(
    @Param('uuid') uuid: string,
    @Body() updateGroupDto: UpdateGroupDto
  ): Promise<DataResponseDto<GroupResponseDto>> {
    const group = await this.groupsService.update(uuid, updateGroupDto);
    return new DataResponseDto(plainToInstance(GroupResponseDto, group));
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a group' })
  @ApiParam({ name: 'uuid', description: 'Group UUID' })
  async delete(@Param('uuid') uuid: string): Promise<DataResponseDto<null>> {
    await this.groupsService.delete(uuid);
    return new DataResponseDto(null);
  }
}
```

**Service Pattern (groups.service.ts):**

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateGroupDto, UpdateGroupDto } from '../dto/request';
import { GroupWithMetricsInterface } from '../interfaces';
import { TradeStatus } from '@prisma/client';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto): Promise<GroupWithMetricsInterface> {
    const { tradeUuids, ...groupData } = createGroupDto;

    // Validate trades exist
    const trades = await this.prisma.trade.findMany({
      where: { uuid: { in: tradeUuids } },
    });

    if (trades.length !== tradeUuids.length) {
      throw new BadRequestException('One or more trade UUIDs not found');
    }

    // Create group and update trades in transaction
    const group = await this.prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({ data: groupData });

      await tx.trade.updateMany({
        where: { uuid: { in: tradeUuids } },
        data: { groupUuid: newGroup.uuid },
      });

      return tx.group.findUnique({
        where: { uuid: newGroup.uuid },
        include: { trades: true },
      });
    });

    return this.calculateMetrics(group);
  }

  async findAll(): Promise<GroupWithMetricsInterface[]> {
    const groups = await this.prisma.group.findMany({
      include: { trades: true },
    });

    return groups.map((g) => this.calculateMetrics(g));
  }

  async findByUuid(uuid: string): Promise<GroupWithMetricsInterface> {
    const group = await this.prisma.group.findUnique({
      where: { uuid },
      include: { trades: true },
    });

    if (!group) {
      throw new NotFoundException(`Group with UUID '${uuid}' not found`);
    }

    return this.calculateMetrics(group);
  }

  async update(uuid: string, updateGroupDto: UpdateGroupDto): Promise<GroupWithMetricsInterface> {
    const group = await this.prisma.group.update({
      where: { uuid },
      data: updateGroupDto,
      include: { trades: true },
    });

    return this.calculateMetrics(group);
  }

  async delete(uuid: string): Promise<void> {
    await this.prisma.group.delete({ where: { uuid } });
    // ON DELETE SET NULL handles ungrouping trades automatically
  }

  // Helper: Calculate derived metrics (mirrors TradesService.enrichTradeWithDerivedFields pattern)
  private calculateMetrics(group: any): GroupWithMetricsInterface {
    const { trades } = group;

    // Calculate closingExpiry (earliest expiry of all child trades)
    const closingExpiry = new Date(
      Math.min(...trades.map((t) => new Date(t.expiryDate).getTime()))
    );

    // Calculate days until closingExpiry
    const daysUntilClosingExpiry = this.calculateDaysUntilExpiry(closingExpiry);

    // Derive status from daysUntilClosingExpiry
    const status = this.deriveStatus(daysUntilClosingExpiry);

    // Calculate P&L metrics
    const totalCostBasis = trades.reduce((sum, t) => sum + Number(t.costBasis), 0);

    const totalCurrentValue = trades.reduce((sum, t) => sum + Number(t.currentValue), 0);

    const profitLoss = totalCurrentValue - totalCostBasis;

    return {
      ...group,
      closingExpiry,
      daysUntilClosingExpiry,
      status,
      totalCostBasis,
      totalCurrentValue,
      profitLoss,
    };
  }

  // Helper: Calculate days until expiry (matches TradesService.calculateDaysToExpiry)
  private calculateDaysUntilExpiry(closingExpiry: Date): number {
    const now = new Date();
    const diffMs = closingExpiry.getTime() - now.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  // Helper: Derive status from daysUntilClosingExpiry
  private deriveStatus(daysUntilClosingExpiry: number): TradeStatus {
    if (daysUntilClosingExpiry < 0) {
      return TradeStatus.CLOSED;
    }

    if (daysUntilClosingExpiry <= 7) {
      return TradeStatus.CLOSING_SOON;
    }

    return TradeStatus.OPEN;
  }
}
```

### Security Considerations

- **Input validation:** class-validator ensures tradeUuids array has 2+ elements
- **SQL injection:** Prisma ORM parameterizes all queries automatically
- **Parameter pollution:** ValidationPipe with whitelist: true strips unexpected fields
- **Data exposure:** ClassSerializerInterceptor with excludeExtraneousValues: true only exposes @Expose() fields
- **UUID primary keys:** No ID enumeration attacks

### Edge Cases

1. **Creating group with non-existent trade UUIDs:**
   - Validate all trades exist before transaction
   - Return 400 Bad Request with clear message

2. **Deleting group with 2 trades:**
   - ON DELETE SET NULL preserves trades
   - Both trades become ungrouped (groupUuid = null)

3. **Group with only 1 trade (should never happen):**
   - CreateGroupDto enforces 2+ with @ArrayMinSize(2)
   - If trade deletion leaves 1 trade, GroupsService auto-ungroups (future: STORY-008)

4. **closingExpiry calculation with trades at same expiry:**
   - MIN returns same date for all
   - Status derived correctly from that date

5. **P&L calculation with negative values:**
   - Prisma Decimal handles negative numbers correctly
   - Frontend displays as red text

6. **Very large groups (>20 trades):**
   - Performance may degrade beyond 100ms target
   - Monitor and optimize if needed (future backlog)

---

## Dependencies

### Prerequisite Stories

- **STORY-001:** Monorepo Setup (COMPLETED) - Provides monorepo structure
- **STORY-002:** Docker Compose Environment (COMPLETED) - Provides Docker setup
- **STORY-003:** Prisma ORM & Database Schema (COMPLETED) - Provides groups and trades tables
- **STORY-004:** Trade CRUD API (COMPLETED) - Provides TradeResponseDto, DataResponseDto, validation patterns

### Blocked Stories

- **STORY-007:** Group Management UI - Needs this API to function
- **STORY-008:** Trade & Group Deletion - Extends this API with advanced deletion logic
- **STORY-009:** Hierarchical Trade List - Consumes this API to display groups
- **STORY-010:** Dashboard Metrics & Filtering - Uses group metrics from this API
- **STORY-012:** P&L Calculation & Status Display - Displays derived metrics from this API

### External Dependencies

- **Prisma Client:** `@prisma/client` (already installed)
- **class-validator:** Validation decorators (already installed)
- **class-transformer:** DTO transformation (already installed)
- **@nestjs/swagger:** OpenAPI generation (already installed)

---

## Definition of Done

### Prerequisites

- [ ] **Test database setup completed** (see Test Environment Setup section)
  - .env.test file created
  - dotenv-cli installed
  - package.json test script updated
  - tradelog_test database created and migrated
  - Verified e2e tests run against test database (not dev database)

### Code Quality

- [ ] All acceptance criteria satisfied
- [ ] TypeScript strict mode enabled, no `any` types
- [ ] ESLint passes with no warnings or errors
- [ ] Prettier formatting applied
- [ ] Code reviewed (self-review for solo developer)
- [ ] No console.log or debug statements in production code

### Testing

- [ ] E2E tests pass for all 5 endpoints (POST, GET list, GET single, PATCH, DELETE)
- [ ] E2E tests cover validation errors (400 Bad Request scenarios)
- [ ] E2E tests cover not found errors (404 scenarios)
- [ ] E2E tests verify derived metrics calculated correctly
- [ ] E2E tests verify transaction rollback on errors
- [ ] All tests run successfully with `pnpm api:test:e2e`

### Documentation

- [ ] Swagger/OpenAPI documentation generated and accessible at /api/docs
- [ ] All endpoints documented with @ApiOperation decorators
- [ ] All DTOs documented with @ApiProperty decorators
- [ ] Enum values documented in Swagger
- [ ] Code comments added for complex business logic (status derivation, metrics calculation)

### Integration

- [ ] Code committed to git with descriptive message
- [ ] Merged to main branch (or feature branch if multi-day work)
- [ ] Works in Docker development environment
- [ ] No breaking changes to existing STORY-004 Trade API
- [ ] Prisma schema unchanged (already complete from STORY-003)

### Functional

- [ ] All 5 API endpoints work correctly in Postman/Swagger UI
- [ ] Groups can be created with 2+ trades
- [ ] Groups list returned with calculated metrics
- [ ] Single group returned with nested trades
- [ ] Groups can be updated (name, strategyType, notes)
- [ ] Groups can be deleted (trades preserved)
- [ ] Validation errors return 400 Bad Request with clear messages
- [ ] Not found errors return 404 Not Found
- [ ] Derived metrics (closingExpiry, status, totalPnL) calculated correctly
- [ ] Performance <100ms for groups with up to 20 trades

---

## Story Points Breakdown

**Total: 7 points** (Reduced from 8 - existing patterns make this simpler)

### Breakdown

- **Controllers & Routes (2 points):**
  - GroupsController with 5 endpoints
  - Request/response handling (mirrors TradesController pattern)
  - Swagger decorators (@ApiOperation, @ApiParam, @ApiResponse)
  - HTTP status codes (@HttpCode)

- **Services & Business Logic (2.5 points):**
  - GroupsService CRUD operations
  - calculateMetrics helper (closingExpiry, daysUntilClosingExpiry, status, P&L)
  - calculateDaysUntilExpiry helper (matches Trade pattern)
  - deriveStatus helper
  - Transaction handling for create operations

- **DTOs & Interfaces (0.5 points):**
  - CreateGroupDto with validation (@ArrayMinSize(2))
  - UpdateGroupDto (PartialType pattern from Trade API)
  - GroupResponseDto with @Expose decorators (mirrors TradeResponseDto)
  - GroupWithMetricsInterface interface (simple type composition)

- **E2E Testing (2 points):**
  - Test coverage for all 5 endpoints (mirror trades.e2e-spec.ts structure)
  - Validation error scenarios
  - Not found error scenarios
  - Derived metrics calculation verification
  - Transaction rollback verification

### Rationale

This is a moderately complex story (7 points) because:

1. **Established patterns:** TradesController/Service provide clear blueprint
2. **Derived fields pattern:** Already proven in Trade API (pnl, daysToExpiry)
3. **5 CRUD endpoints:** Standard implementation, well-understood
4. **Transaction handling:** Pattern exists in Trade deletion logic
5. **Comprehensive testing:** Mirrors existing e2e test structure

**Originally estimated 8 points, reduced to 7 because:**

- DataResponseDto constructor pattern already exists
- Derived field calculation pattern already proven
- Transaction handling pattern already tested
- Controller/Service/DTO patterns fully established
- E2E test structure can be copied from trades.e2e-spec.ts

---

## Additional Notes

### Why Calculate Metrics On-Demand?

**Decision:** Never store derived fields (closingExpiry, status, totalPnL) in database.

**Rationale:**

- **Consistency:** Always fresh, no stale data
- **Single source of truth:** Trade expiry dates and values are authoritative
- **No sync issues:** No need to update group metrics when trades change
- **Simplicity:** No triggers, no cascading updates
- **Performance acceptable:** ~100ms for 20 trades is well within budget

**Trade-off:** Slight performance cost (~100ms) vs. guaranteed consistency.

### Why No "I" Prefix for Interfaces?

**TypeScript Convention:** Modern TypeScript style guides recommend NO prefix.

- ✅ `GroupWithMetricsInterface` (modern, clean)
- ❌ `IGroupWithMetrics` (outdated C#/Java convention)

### Why Reuse Trades Domain?

**Domain-Driven Design:** Groups ARE aggregates of Trades. They belong in the same domain.

- Groups cannot exist without trades
- Group metrics derive from trade data
- Tight coupling is appropriate here

**File structure:**

```
api/src/trades/
  controllers/
    trades.controller.ts
    groups.controller.ts  ← Same domain
  services/
    trades.service.ts
    groups.service.ts     ← Same domain
```

### Performance Optimization Notes

**Query optimization:**

- Use `include: { trades: true }` for eager loading (single query with join)
- Avoid N+1 problem by fetching trades with group in one query
- Database indexes on groupUuid and expiryDate

**Calculation optimization:**

- Metrics calculation is O(n) where n = number of trades in group
- For 20 trades: ~100ms
- For 100 trades: ~500ms (still acceptable)
- No optimization needed until >1000 trades

---

## Progress Tracking

**Status History:**

- 2026-01-05: Created by user
- [ ] Started by developer (date TBD)
- [ ] Code review by developer (self-review)
- [ ] Completed (date TBD)

**Actual Effort:** TBD (will be filled during/after implementation)

---

## Revision History

**2026-01-05 - Added test database setup prerequisite:**

- **CRITICAL:** Added "Test Environment Setup" as mandatory prerequisite
- Current e2e tests wipe development database (data loss risk)
- Solution: Separate test database (tradelog_test) with .env.test
- Includes step-by-step setup instructions
- Estimated effort: 10-15 minutes
- Added to Definition of Done as prerequisite checklist

**2026-01-05 - Updated to align with existing Trade API patterns:**

1. **Added daysUntilClosingExpiry field:**
   - Mirrors TradeResponseDto.daysToExpiry pattern
   - Calculated using Math.floor (consistent with Trade API)
   - Added to GroupResponseDto and business logic

2. **Fixed DataResponseDto usage:**
   - Changed from object literal `{ data: ... }` to constructor `new DataResponseDto(...)`
   - Matches existing TradesController pattern
   - Added HttpCode and HttpStatus decorators

3. **Verified PATCH method:**
   - Confirmed PATCH (not PUT) for partial updates
   - UpdateGroupDto uses PartialType (all fields optional)

4. **Updated service helpers:**
   - calculateMetrics() includes daysUntilClosingExpiry
   - Added calculateDaysUntilExpiry() helper (matches Trade pattern)
   - Updated deriveStatus() to use daysUntilClosingExpiry

5. **Reduced story points:**
   - From 8 to 7 points
   - Rationale: Existing patterns reduce implementation complexity

6. **Enhanced examples:**
   - Added pnl and daysToExpiry to nested TradeResponseDto in examples
   - Updated all API response examples with daysUntilClosingExpiry

**Changes verified against:**

- `api/src/trades/controllers/trades.controller.ts`
- `api/src/trades/services/trades.service.ts`
- `api/src/trades/dto/response/trade-response.dto.ts`
- `api/src/common/dto/data-response.dto.ts`
- `api/test/e2e/trades.e2e-spec.ts`

---

**This story was created using BMAD Method v6 - Phase 4 (Implementation Planning)**
