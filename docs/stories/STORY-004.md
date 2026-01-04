# STORY-004: Trade CRUD API Endpoints

**Epic:** EPIC-002 (Trade & Group Management)
**Priority:** Critical
**Story Points:** 8
**Status:** Not Started
**Assigned To:** Unassigned
**Created:** 2026-01-04
**Sprint:** 1

---

## User Story

As a **developer**
I want to **implement a complete REST API for Trade CRUD operations**
So that **the frontend can create, read, update, and delete individual trade records through a type-safe, validated API**

---

## Description

### Background

This story implements the core backend API for managing individual options trades. Each trade represents a single options position (Buy/Sell, Call/Put) with fields like strike price, expiry date, cost basis, current value, and status. This API forms the foundation for all trade management features in TradeLog.

The Trade API must support:
- Manual trade entry from the frontend
- Full CRUD operations with validation
- Calculated derived fields (P&L)
- Integration with groups (optional groupUuid)
- Type-safe DTOs with Swagger documentation

### Scope

**In scope:**
- REST endpoints for Trade CRUD (Create, Read, Update, Delete)
- Request DTOs with validation (CreateTradeDto, UpdateTradeDto)
- Response DTOs with @Expose() pattern (TradeResponseDto)
- DataResponseDto<T> wrapper for consistent API responses
- Global ValidationPipe configuration
- Global ClassSerializerInterceptor setup
- Swagger/OpenAPI documentation for all endpoints
- E2E tests for all endpoints (NestJS Supertest)
- Derived fields: P&L calculation, days to expiry

**Out of scope:**
- Bulk operations (create/update/delete multiple trades) - can be added later if needed
- Backend pagination - client-side filtering is sufficient for MVP (<1000 trades)
- Backend query filtering (status, symbol, groupUuid) - deferred to Phase 2
- Authentication/authorization (single-user localhost MVP)
- Real-time market data integration (manual currentValue entry for MVP)

### User Flow

**Create Trade Flow:**
1. Frontend sends POST /v1/trades with trade data
2. Global ValidationPipe validates CreateTradeDto
3. TradesService creates trade with status defaulting to OPEN
4. Prisma inserts trade into database (transaction)
5. Service transforms Prisma entity → TradeResponseDto (plainToInstance)
6. ClassSerializerInterceptor strips non-@Expose() fields
7. Response wrapped in DataResponseDto<TradeResponseDto>
8. Frontend receives typed response

**Read Trades Flow:**
1. Frontend sends GET /v1/trades
2. TradesService fetches all trades (no backend filtering for MVP)
3. Each trade transformed to TradeResponseDto with derived fields (pnl, daysToExpiry)
4. Response: DataResponseDto<TradeResponseDto[]>

**Update Trade Flow:**
1. Frontend sends PATCH /v1/trades/:uuid with updated fields
2. ValidationPipe validates UpdateTradeDto
3. TradesService updates trade (partial update)
4. Response: DataResponseDto<TradeResponseDto>

**Delete Trade Flow:**
1. Frontend sends DELETE /v1/trades/:uuid
2. TradesService checks if trade is in a group
3. If in group with <2 remaining trades, auto-ungroup (transaction)
4. Delete trade
5. Response: DataResponseDto<void>

---

## Acceptance Criteria

### API Endpoints

- [ ] **POST /v1/trades** - Create trade
  - Accepts CreateTradeDto in request body
  - status field defaults to OPEN (not in CreateTradeDto)
  - groupUuid is optional
  - Returns 201 Created with DataResponseDto<TradeResponseDto>
  - Returns 400 Bad Request if validation fails

- [ ] **GET /v1/trades** - List all trades
  - Returns 200 OK with DataResponseDto<TradeResponseDto[]>
  - Returns all trades (no pagination for MVP)
  - No backend filtering (frontend handles filtering)
  - Returns empty array if no trades exist

- [ ] **GET /v1/trades/:uuid** - Get single trade
  - Returns 200 OK with DataResponseDto<TradeResponseDto>
  - Returns 404 Not Found if trade doesn't exist
  - Includes derived fields (pnl, daysToExpiry)

- [ ] **PUT /v1/trades/:uuid** - Update trade (full update)
  - Accepts UpdateTradeDto in request body
  - Returns 200 OK with DataResponseDto<TradeResponseDto>
  - Returns 404 Not Found if trade doesn't exist
  - Returns 400 Bad Request if validation fails

- [ ] **DELETE /v1/trades/:uuid** - Delete trade
  - Returns 200 OK with DataResponseDto<void>
  - Returns 404 Not Found if trade doesn't exist
  - If trade is in a group with <2 remaining trades after deletion, auto-ungroup remaining trades and delete group (transaction)

### DTOs

- [ ] **CreateTradeDto** - Request DTO for creating trades
  - Fields: symbol, strikePrice, expiryDate, tradeType, optionType, quantity, costBasis, currentValue, notes (optional), groupUuid (optional)
  - NO status field (defaults to OPEN in service)
  - Uses class-validator decorators (@IsString, @IsNumber, @IsEnum, @Min, @IsDateString, @IsOptional)
  - Uses @ApiProperty decorators for Swagger
  - Enums imported from @prisma/client (TradeType, OptionType)

- [ ] **UpdateTradeDto** - Request DTO for updating trades
  - Extends PartialType(CreateTradeDto)
  - All fields optional
  - Allows updating status field (unlike CreateTradeDto)

- [ ] **TradeResponseDto** - Response DTO
  - Uses @Expose() decorators on all fields to be exposed
  - Fields: uuid, symbol, strikePrice, expiryDate, tradeType, optionType, quantity, costBasis, currentValue, status, notes, groupUuid
  - Derived fields: pnl (calculated as currentValue - costBasis), daysToExpiry (calculated from expiryDate - now)
  - Does NOT expose createdAt, updatedAt (per architecture requirements)
  - Uses @ApiProperty decorators for Swagger

- [ ] **DataResponseDto<T>** - Generic response wrapper
  - Located in api/src/common/dto/
  - Generic class with single property: `data: T`
  - Used consistently across all endpoints

### Validation

- [ ] **Global ValidationPipe** configured in main.ts
  - transform: true (auto-transform request body to DTO instances)
  - whitelist: true (strip properties not in DTO)
  - forbidNonWhitelisted: false (don't throw error, just strip)

- [ ] **Global ClassSerializerInterceptor** configured in main.ts
  - excludeExtraneousValues: true (only expose @Expose() decorated fields)
  - Prevents accidental data leaks

- [ ] **Validation rules enforced:**
  - symbol: required, string, non-empty
  - strikePrice: required, number, ≥0
  - expiryDate: required, valid date string (ISO 8601 format)
  - tradeType: required, enum (BUY, SELL)
  - optionType: required, enum (CALL, PUT)
  - quantity: required, number, ≥1
  - costBasis: required, number, ≥0
  - currentValue: required, number, ≥0
  - notes: optional, string
  - groupUuid: optional, string (UUID format)

### Business Logic

- [ ] **Default status to OPEN** when creating new trade (in TradesService, NOT in DTO)

- [ ] **Calculate derived fields** in TradesService before returning:
  - pnl = currentValue - costBasis
  - daysToExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24))

- [ ] **plainToInstance transformation** used in controller to transform Prisma entity → TradeResponseDto

- [ ] **Group integrity check** on trade deletion:
  - If trade.groupUuid exists, count remaining trades in that group
  - If count would be <2 after deletion, ungroup remaining trades and delete group
  - Use Prisma transaction to ensure atomicity

### API Documentation

- [ ] **Swagger/OpenAPI** documentation generated for all endpoints
  - @ApiTags('Trades') on controller
  - @ApiOperation() on each endpoint with clear description
  - @ApiResponse() decorators for status codes (200, 201, 400, 404, 500)
  - All DTO fields documented with @ApiProperty()
  - Enums documented with examples

- [ ] **Swagger UI** accessible at http://localhost:3000/api/docs

- [ ] **OpenAPI JSON** accessible at http://localhost:3000/api/docs-json (for frontend type generation)

### Testing

- [ ] **E2E tests** for all endpoints using NestJS Supertest
  - POST /v1/trades - create trade (success, validation errors)
  - GET /v1/trades - list trades (empty list, multiple trades)
  - GET /v1/trades/:uuid - get single trade (success, 404)
  - PUT /v1/trades/:uuid - update trade (success, validation errors, 404)
  - DELETE /v1/trades/:uuid - delete trade (success, 404, group integrity check)
  - Test derived fields (pnl, daysToExpiry) are calculated correctly
  - Test status defaults to OPEN
  - Test non-@Expose() fields are excluded (createdAt, updatedAt)

- [ ] All tests pass with 0 failures

### Performance

- [ ] Trade creation completes in <100ms (database write + transformation)
- [ ] Trade list query completes in <200ms for 500 trades
- [ ] Single trade query completes in <50ms

---

## Technical Notes

### Components

**Backend (NestJS):**
- `api/src/trades/controllers/trades.controller.ts` - TradesController
- `api/src/trades/services/trades.service.ts` - TradesService
- `api/src/trades/dto/request/create-trade.dto.ts` - CreateTradeDto
- `api/src/trades/dto/request/update-trade.dto.ts` - UpdateTradeDto
- `api/src/trades/dto/response/trade-response.dto.ts` - TradeResponseDto
- `api/src/common/dto/data-response.dto.ts` - DataResponseDto<T>
- `api/src/main.ts` - Global pipes and interceptors
- `api/test/e2e/trades.e2e-spec.ts` - E2E tests

**Database:**
- `trades` table (already exists from STORY-003)

**Frontend (future consumption):**
- Types generated from Swagger spec

### API Endpoints

#### POST /v1/trades

**Request:**
```json
{
  "symbol": "AAPL",
  "strikePrice": 150.00,
  "expiryDate": "2026-02-15",
  "tradeType": "BUY",
  "optionType": "CALL",
  "quantity": 10,
  "costBasis": 1500.00,
  "currentValue": 1750.00,
  "notes": "Long call position on AAPL",
  "groupUuid": "a3bb189e-8bf9-3888-9912-ace4e6543002"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "symbol": "AAPL",
    "strikePrice": 150.00,
    "expiryDate": "2026-02-15",
    "tradeType": "BUY",
    "optionType": "CALL",
    "quantity": 10,
    "costBasis": 1500.00,
    "currentValue": 1750.00,
    "status": "OPEN",
    "notes": "Long call position on AAPL",
    "groupUuid": "a3bb189e-8bf9-3888-9912-ace4e6543002",
    "pnl": 250.00,
    "daysToExpiry": 42
  }
}
```

#### GET /v1/trades

**Response (200 OK):**
```json
{
  "data": [
    {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "symbol": "AAPL",
      "strikePrice": 150.00,
      "expiryDate": "2026-02-15",
      "tradeType": "BUY",
      "optionType": "CALL",
      "quantity": 10,
      "costBasis": 1500.00,
      "currentValue": 1750.00,
      "status": "OPEN",
      "notes": "Long call position on AAPL",
      "groupUuid": "a3bb189e-8bf9-3888-9912-ace4e6543002",
      "pnl": 250.00,
      "daysToExpiry": 42
    }
  ]
}
```

#### GET /v1/trades/:uuid

**Response (200 OK):**
Same as single item in GET /v1/trades

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Trade with UUID '123e4567-e89b-12d3-a456-426614174000' not found",
  "error": "Not Found"
}
```

#### PUT /v1/trades/:uuid

**Request (partial update):**
```json
{
  "currentValue": 1800.00,
  "status": "CLOSING_SOON"
}
```

**Response (200 OK):**
Same structure as POST response with updated fields

#### DELETE /v1/trades/:uuid

**Response (200 OK):**
```json
{
  "data": null
}
```

### Database Changes

**No new migrations required** - `trades` table already exists from STORY-003.

**Indexes used:**
- `uuid` (primary key) - for GET/PUT/DELETE by UUID
- `groupUuid` - for group integrity checks on deletion
- `expiryDate` - for daysToExpiry calculation (optional optimization)

### Derived Fields Calculation

**P&L Calculation:**
```typescript
// In TradesService
calculatePnL(trade: Trade): number {
  return trade.currentValue - trade.costBasis;
}
```

**Days to Expiry Calculation:**
```typescript
// In TradesService
calculateDaysToExpiry(expiryDate: Date): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
```

### Controller Pattern

```typescript
// trades.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { TradesService } from '../services/trades.service';
import { CreateTradeDto, UpdateTradeDto } from '../dto/request';
import { TradeResponseDto } from '../dto/response';
import { DataResponseDto } from '@/common/dto';

@ApiTags('Trades')
@Controller({ path: 'trades', version: '1' })
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trade' })
  @ApiResponse({ status: 201, type: TradeResponseDto })
  async create(@Body() createTradeDto: CreateTradeDto): Promise<DataResponseDto<TradeResponseDto>> {
    const trade = await this.tradesService.create(createTradeDto);
    return {
      data: plainToInstance(TradeResponseDto, trade),
    };
  }

  // ... other endpoints
}
```

### Service Pattern

```typescript
// trades.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTradeDto, UpdateTradeDto } from '../dto/request';
import { TradeStatus } from '@prisma/client';

@Injectable()
export class TradesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTradeDto: CreateTradeDto) {
    const trade = await this.prisma.trade.create({
      data: {
        ...createTradeDto,
        status: TradeStatus.OPEN, // Default status
      },
    });

    return this.enrichTradeWithDerivedFields(trade);
  }

  private enrichTradeWithDerivedFields(trade: any) {
    return {
      ...trade,
      pnl: this.calculatePnL(trade),
      daysToExpiry: this.calculateDaysToExpiry(trade.expiryDate),
    };
  }

  // ... other methods
}
```

### Transformation Pattern (plainToInstance)

```typescript
// In controller
import { plainToInstance } from 'class-transformer';

const responseDto = plainToInstance(TradeResponseDto, prismaTrade);
// ClassSerializerInterceptor automatically strips non-@Expose() fields
```

### Error Handling

**Validation errors (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": [
    "symbol should not be empty",
    "strikePrice must be a positive number",
    "quantity must be at least 1"
  ],
  "error": "Bad Request"
}
```

**Not found (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Trade with UUID '...' not found",
  "error": "Not Found"
}
```

### Security Considerations

- **SQL Injection Prevention:** Prisma ORM uses parameterized queries by design
- **Input Validation:** Triple validation (frontend Zod, backend class-validator, database constraints)
- **Data Exposure Control:** ClassSerializerInterceptor with excludeExtraneousValues prevents leaking internal fields
- **Parameter Pollution:** ValidationPipe with whitelist: true strips unexpected properties
- **UUID Primary Keys:** Prevents ID enumeration attacks

### Edge Cases

**Trade deletion with group integrity:**
- If deleting a trade leaves its group with <2 trades, auto-ungroup remaining trades and delete the group
- Use Prisma transaction to ensure atomicity (all or nothing)

**Invalid UUID format:**
- NestJS automatically validates UUID format in route params
- Returns 400 Bad Request if invalid

**Decimal precision:**
- strikePrice, costBasis, currentValue use Decimal(10,2) in database
- Supports values up to $99,999,999.99

**Date handling:**
- expiryDate stored as Date type (no time component)
- Accepts ISO 8601 format: "YYYY-MM-DD"
- Validates with @IsDateString() decorator

---

## Dependencies

### Prerequisite Stories

- **STORY-001:** Monorepo setup (completed) - Required for monorepo structure
- **STORY-002:** Docker environment (completed) - Required for PostgreSQL database
- **STORY-003:** Prisma ORM setup (completed) - Required for `trades` table, Prisma Client, enums

### Blocked Stories

- **STORY-006:** Trade Entry Form UI - Requires this API to submit trade data
- **STORY-009:** Hierarchical Trade List - Requires this API to fetch trades
- **STORY-012:** P&L Calculation & Status Display - Requires derived fields from this API

### External Dependencies

- NestJS framework (already installed from STORY-001)
- Prisma Client (generated from STORY-003)
- class-validator (already installed)
- class-transformer (already installed)
- @nestjs/swagger (already installed)
- PostgreSQL database (running from STORY-002)

### Technical Dependencies

- `@prisma/client` - Generated types for Trade, TradeType, OptionType, TradeStatus
- Global ValidationPipe - Must be configured in main.ts
- Global ClassSerializerInterceptor - Must be configured in main.ts

---

## Definition of Done

### Code

- [ ] All code implemented and committed to feature branch
- [ ] TradesController with all 5 endpoints (POST, GET, GET/:uuid, PUT/:uuid, DELETE/:uuid)
- [ ] TradesService with business logic (create, findMany, findByUuid, update, delete)
- [ ] CreateTradeDto with validation decorators
- [ ] UpdateTradeDto extending PartialType(CreateTradeDto)
- [ ] TradeResponseDto with @Expose() decorators
- [ ] DataResponseDto<T> generic wrapper
- [ ] Global ValidationPipe configured in main.ts
- [ ] Global ClassSerializerInterceptor configured in main.ts
- [ ] Barrel exports (index.ts) in dto/request and dto/response folders

### Testing

- [ ] E2E tests written for all endpoints (≥90% coverage)
- [ ] Tests for successful operations (201, 200)
- [ ] Tests for validation errors (400)
- [ ] Tests for not found errors (404)
- [ ] Tests for derived fields (pnl, daysToExpiry)
- [ ] Tests for status defaulting to OPEN
- [ ] Tests for group integrity on deletion
- [ ] All tests passing (0 failures)

### Documentation

- [ ] Swagger UI accessible at http://localhost:3000/api/docs
- [ ] OpenAPI JSON accessible at http://localhost:3000/api/docs-json
- [ ] All endpoints documented with @ApiOperation()
- [ ] All DTOs documented with @ApiProperty()
- [ ] Example request/response in Swagger
- [ ] Enums documented in Swagger

### Integration

- [ ] Code merged to main branch
- [ ] Works in Docker development environment
- [ ] Database migrations applied (no new migrations needed, uses existing `trades` table)
- [ ] No breaking changes to existing features (STORY-003)

### Functional

- [ ] Create trade via Swagger UI works correctly
- [ ] List trades returns all trades with derived fields
- [ ] Get single trade by UUID works
- [ ] Update trade works (partial and full update)
- [ ] Delete trade works (with group integrity check)
- [ ] Validation errors return clear messages
- [ ] Response DTOs exclude createdAt, updatedAt
- [ ] Performance targets met (<100ms create, <200ms list)

### Code Quality

- [ ] TypeScript strict mode enabled, no `any` types
- [ ] ESLint passes with 0 errors/warnings
- [ ] Prettier formatting applied
- [ ] Code reviewed (self-review for solo developer)
- [ ] No console.log or debug statements

---

## Story Points Breakdown

- **Backend API endpoints (5 endpoints):** 3 points
- **DTOs with validation (3 DTOs):** 2 points
- **Global pipes/interceptors setup:** 1 point
- **Derived fields calculation:** 1 point
- **E2E testing (comprehensive):** 2 points
- **Swagger documentation:** 1 point
- **Total:** 10 points → **Adjusted to 8 points** (accounting for existing infrastructure from STORY-003)

**Rationale:**
- NestJS module structure already exists from STORY-003
- Prisma Client and database schema already set up
- Docker environment already running
- Main complexity is in DTO validation, transformation patterns, and E2E testing
- 8 points aligns with "Very Complex" (2-3 days at ~2 hours per point)

---

## Additional Notes

### Integration with STORY-003

This story builds directly on STORY-003:
- Uses `trades` table created in STORY-003
- Uses Prisma Client generated in STORY-003
- Uses enums (TradeType, OptionType, TradeStatus) from STORY-003 schema
- No new migrations required

### Naming Conventions

Per architecture document:
- Interfaces: NO "I" prefix (e.g., GroupWithMetrics, not IGroupWithMetrics)
- Response DTOs: Use `@Expose()` pattern with excludeExtraneousValues
- Request DTOs: Use class-validator decorators
- Services: Singular name (TradesService, not TradeService)

### Type Safety

Complete end-to-end type safety:
1. Prisma schema → @prisma/client types
2. DTOs with decorators → NestJS validation
3. @nestjs/swagger → OpenAPI spec
4. openapi-typescript → Frontend types (STORY-006+)

### API Versioning

All endpoints use `/v1` prefix from day 1 for future-proofing.

### No Pagination for MVP

Per architecture decisions:
- No backend pagination (frontend handles filtering/sorting)
- Acceptable for <1000 trades
- Can add later if needed (trigger: >1000 trades or >1s render time)

---

## Progress Tracking

**Status History:**
- 2026-01-04 11:36: Story created
- 2026-01-04 11:40: Implementation started
- 2026-01-04 13:45: Implementation completed
- 2026-01-04 13:50: All tests passing (22/22 E2E tests)
- 2026-01-04 13:55: Code quality checks passed

**Actual Effort:** 2 hours 20 minutes (Estimated: 8 points / ~16 hours)

**Implementation Notes:**
- Implemented complete Trade CRUD API with 5 endpoints
- Created 4 DTOs with comprehensive validation and transformation
- Used @Type(() => Date) for automatic date transformation
- Configured dual-mode support (local dev + Docker containers)
- Added ConfigModule for environment variable management
- Implemented group integrity checks on trade deletion
- Set up modern ESLint 9 with flat config and Prettier
- All 22 E2E tests passing with 100% endpoint coverage
- Zero TypeScript errors, zero `any` types, zero lint errors
- Fixed Docker Compose DATABASE_URL configuration for both modes
- Removed redundant code (unused exports, prisma.config.ts)

---

**This story was created using BMAD Method v6 - Phase 4 (Implementation Planning)**
