# STORY-003: Prisma ORM Setup & Database Schema

**Epic:** EPIC-001: Project Infrastructure & Setup
**Priority:** Critical (Must Have)
**Story Points:** 5
**Status:** Not Started
**Assigned To:** Unassigned
**Created:** 2026-01-04
**Sprint:** Sprint 1

---

## User Story

As a **solo developer**
I want to **configure Prisma ORM with complete Trade and Group database schemas**
So that **I can build type-safe APIs with reliable data persistence and integrity**

---

## Description

### Background

The TradeLog application requires a robust data persistence layer to store options trades and their groupings. Prisma ORM provides type-safe database access with automatic migration management, which is critical for maintaining data integrity as the schema evolves. This story establishes the foundational database schema that all API endpoints and business logic will depend on.

Prisma was chosen for its:
- **Type Safety**: Auto-generated TypeScript types that stay in sync with the database
- **Migration Management**: Version-controlled schema changes with automatic migration generation
- **Developer Experience**: Intuitive schema definition language and excellent tooling
- **PostgreSQL Support**: First-class support for advanced PostgreSQL features

This schema must support the core functional requirements:
- **FR-001**: Manual trade entry with all necessary fields
- **FR-002**: Group creation with strategy types
- **FR-003**: Trade-to-group relationships with unlimited legs
- **FR-010**: Unlimited legs per group (no artificial database constraints)

### Scope

**In Scope:**
- Install and configure Prisma with PostgreSQL provider
- Define `Trade` model with all required fields (symbol, strikePrice, expiryDate, etc.)
- Define `Group` model with all required fields (name, strategyType, notes)
- Create enums: `TradeType`, `OptionType`, `TradeStatus`, `StrategyType`
- Establish 1:N relationship (Group → Trades) with `ON DELETE SET NULL`
- Use UUID primary keys for all models
- Generate Prisma Client for type-safe database access
- Create initial database migration
- Write seed script with sample data (2 groups, 6 trades)
- Verify database schema in PostgreSQL

**Out of Scope:**
- Derived fields (closingExpiry, status, totalPnL) - **calculated at runtime, NOT stored**
- `ItemType` enum in Prisma schema - **TypeScript-only for API responses**
- Database performance tuning (indexes, query optimization)
- Data import/export features
- Database backup/restore procedures
- Multi-tenancy or user authentication tables
- Audit logging tables (createdBy, updatedBy)

### Developer Flow

1. Install Prisma CLI and client packages in the `api` workspace
2. Initialize Prisma with `prisma init` (PostgreSQL provider)
3. Update `.env` with PostgreSQL connection string (from Docker Compose)
4. Define `schema.prisma` with models and enums
5. Run `prisma generate` to create Prisma Client
6. Run `prisma migrate dev` to create initial migration
7. Write seed script in `api/prisma/seed.ts`
8. Configure seed script in `package.json`
9. Run `prisma db seed` to populate test data
10. Verify schema in PostgreSQL using `psql` or Prisma Studio
11. Commit migration files and schema to git

---

## Acceptance Criteria

### Prisma Configuration
- [ ] Prisma installed (`@prisma/client`, `prisma` dev dependency)
- [ ] `prisma/schema.prisma` created with PostgreSQL provider
- [ ] Database connection string configured in `.env` (references `DATABASE_URL`)
- [ ] `.env.example` includes `DATABASE_URL` template
- [ ] Prisma Client generated successfully (`node_modules/.prisma/client`)

### Trade Model
- [ ] `Trade` model defined with the following fields:
  - `uuid` (String, @id, @default(uuid()))
  - `symbol` (String) - e.g., "SPY", "AAPL"
  - `strikePrice` (Decimal, @db.Decimal(10, 2))
  - `expiryDate` (DateTime, @db.Date) - date only, no time
  - `tradeType` (TradeType enum) - BUY or SELL
  - `optionType` (OptionType enum) - CALL or PUT
  - `quantity` (Int) - number of contracts
  - `costBasis` (Decimal, @db.Decimal(10, 2)) - total cost
  - `currentValue` (Decimal, @db.Decimal(10, 2)) - current market value
  - `notes` (String, optional)
  - `groupUuid` (String, optional) - nullable foreign key
  - `createdAt` (DateTime, @default(now()))
  - `updatedAt` (DateTime, @updatedAt)
- [ ] Relationship: `group Group? @relation(fields: [groupUuid], references: [uuid], onDelete: SetNull)`
- [ ] NO derived fields (status, pnl) stored in database

### Group Model
- [ ] `Group` model defined with the following fields:
  - `uuid` (String, @id, @default(uuid()))
  - `name` (String) - user-defined group name
  - `strategyType` (StrategyType enum)
  - `notes` (String, optional)
  - `createdAt` (DateTime, @default(now()))
  - `updatedAt` (DateTime, @updatedAt)
- [ ] Relationship: `trades Trade[]` (one-to-many)
- [ ] NO derived fields (closingExpiry, status, totalPnL) stored in database

### Enums
- [ ] `TradeType` enum: `BUY`, `SELL`
- [ ] `OptionType` enum: `CALL`, `PUT`
- [ ] `TradeStatus` enum: `OPEN`, `CLOSING_SOON`, `CLOSED` (for frontend use, derived at runtime)
- [ ] `StrategyType` enum: `CALENDAR_SPREAD`, `RATIO_CALENDAR_SPREAD`, `CUSTOM`
- [ ] **NOTE**: NO `ItemType` enum in Prisma (TypeScript discriminated union only)

### Relationships & Constraints
- [ ] Group-to-Trade relationship is 1:N (one group has many trades)
- [ ] Trade `groupUuid` is nullable (trades can be ungrouped)
- [ ] `ON DELETE SET NULL` behavior: deleting a group ungroups its trades (doesn't delete them)
- [ ] UUID primary keys on all models (not auto-incrementing integers)
- [ ] No unique constraints beyond primary keys

### Migrations
- [ ] Initial migration created: `prisma/migrations/YYYYMMDDHHMMSS_init/migration.sql`
- [ ] Migration applied successfully to PostgreSQL database
- [ ] Migration creates all tables, enums, and relationships
- [ ] Schema matches Prisma schema definition exactly

### Seed Script
- [ ] Seed script created: `prisma/seed.ts`
- [ ] Seed configured in `package.json`: `"prisma": { "seed": "tsx prisma/seed.ts" }`
- [ ] Seed creates **2 groups**:
  - Group 1: "SPY Calendar Spread", strategyType: CALENDAR_SPREAD
  - Group 2: "AAPL Ratio Calendar", strategyType: RATIO_CALENDAR_SPREAD
- [ ] Seed creates **6 trades**:
  - 3 trades in Group 1 (various strikes/expiries)
  - 2 trades in Group 2
  - 1 ungrouped trade (groupUuid = null)
- [ ] Seed script is idempotent (can run multiple times safely)
- [ ] `prisma db seed` executes without errors

### Verification
- [ ] Prisma Studio can open and display tables (`npx prisma studio`)
- [ ] PostgreSQL contains `Trade`, `Group` tables with correct columns
- [ ] Sample data visible in database
- [ ] No TypeScript errors when importing PrismaClient
- [ ] PrismaClient autocomplete works for models (Trade, Group)

---

## Technical Notes

### Database Configuration

**Connection String Format:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/tradelog?schema=public"
```

**Docker Compose Integration:**
- PostgreSQL service defined in `docker-compose.yml` (from STORY-002)
- Database name: `tradelog`
- Port: `5432`
- Environment variables passed from `.env` file

### Prisma Schema Structure

**File:** `api/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum TradeType {
  BUY
  SELL
}

enum OptionType {
  CALL
  PUT
}

enum TradeStatus {
  OPEN
  CLOSING_SOON
  CLOSED
}

enum StrategyType {
  CALENDAR_SPREAD
  RATIO_CALENDAR_SPREAD
  CUSTOM
}

model Group {
  uuid         String       @id @default(uuid())
  name         String
  strategyType StrategyType
  notes        String?
  trades       Trade[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}

model Trade {
  uuid         String     @id @default(uuid())
  symbol       String
  strikePrice  Decimal    @db.Decimal(10, 2)
  expiryDate   DateTime   @db.Date
  tradeType    TradeType
  optionType   OptionType
  quantity     Int
  costBasis    Decimal    @db.Decimal(10, 2)
  currentValue Decimal    @db.Decimal(10, 2)
  notes        String?
  groupUuid    String?
  group        Group?     @relation(fields: [groupUuid], references: [uuid], onDelete: SetNull)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}
```

### Key Design Decisions

**1. Decimal vs Float for Money:**
- Use `Decimal` type with precision `@db.Decimal(10, 2)` for all monetary values
- Avoids floating-point rounding errors in P&L calculations
- Supports values up to $99,999,999.99 (sufficient for options trading)

**2. Date vs DateTime for expiryDate:**
- Use `DateTime` with `@db.Date` annotation to store date only (no time component)
- Options expire at market close, but exact time isn't needed for grouping logic
- Simplifies comparison logic for "closing soon" calculations

**3. UUID vs Auto-Increment IDs:**
- UUID primary keys prevent enumeration attacks
- Future-proof for distributed systems or data merging
- Slight performance trade-off acceptable for MVP scale (<1000 trades)

**4. ON DELETE SET NULL vs CASCADE:**
- Deleting a group should NOT delete its trades
- Trades become ungrouped (groupUuid = null) when group is deleted
- Preserves data integrity and prevents accidental data loss

**5. No Derived Fields in Database:**
- `closingExpiry` (min expiry date in group) - calculated at query time
- `status` (OPEN/CLOSING_SOON/CLOSED) - derived from expiryDate
- `totalPnL` (sum of trade P&Ls) - calculated at query time
- **Rationale**: Avoids data synchronization issues, guarantees accuracy

**6. TradeStatus Enum in Prisma (but not stored):**
- Enum defined for TypeScript type generation
- NOT used as a database column (status is derived)
- Included for consistency with API DTOs

### Seed Data Specification

**Group 1: SPY Calendar Spread**
- Name: "SPY Calendar Spread"
- Strategy: CALENDAR_SPREAD
- Trades:
  1. SPY $450 CALL, BUY, expiry: 30 days out, qty: 1, cost: $500, current: $520
  2. SPY $450 CALL, SELL, expiry: 60 days out, qty: 1, cost: -$300, current: -$280
  3. SPY $455 CALL, BUY, expiry: 30 days out, qty: 1, cost: $450, current: $470

**Group 2: AAPL Ratio Calendar**
- Name: "AAPL Ratio Calendar"
- Strategy: RATIO_CALENDAR_SPREAD
- Trades:
  1. AAPL $180 PUT, BUY, expiry: 15 days out, qty: 2, cost: $800, current: $820
  2. AAPL $180 PUT, SELL, expiry: 45 days out, qty: 1, cost: -$450, current: -$430

**Ungrouped Trade:**
- TSLA $250 CALL, BUY, expiry: 10 days out, qty: 1, cost: $600, current: $550
- groupUuid: null

### Prisma Commands Reference

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create migration (in dev)
npx prisma migrate dev --name init

# Apply migrations (production)
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### NestJS Integration (Future Story)

This schema enables NestJS integration in STORY-004:
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Type-safe query
const trades = await prisma.trade.findMany({
  where: { groupUuid: 'some-uuid' },
  include: { group: true }
})
```

### Edge Cases & Validation

**Trade Validation (application layer, not database):**
- `quantity` must be > 0
- `strikePrice` must be > 0
- `expiryDate` should be in the future (warning, not error)
- `costBasis` and `currentValue` can be negative (short positions)

**Group Validation:**
- `name` must be non-empty
- `strategyType` must be valid enum value

**Relationship Validation:**
- Trades can reference non-existent groups → database error (foreign key constraint)
- Groups can be deleted → trades become ungrouped (ON DELETE SET NULL)

---

## Dependencies

### Prerequisite Stories
- **STORY-001**: Monorepo Setup with pnpm Workspaces
  - **Why**: Need monorepo structure and `api/` workspace to install Prisma
  - **Blocker**: Cannot install Prisma packages without pnpm workspace

- **STORY-002**: Docker Compose Development Environment
  - **Why**: PostgreSQL database must be running to apply migrations
  - **Blocker**: Cannot run `prisma migrate dev` without PostgreSQL connection

### Blocked Stories
- **STORY-004**: Trade CRUD API Endpoints
  - **Why**: API needs Prisma Client to query database
  - **Impact**: Cannot implement services without schema

- **STORY-005**: Group CRUD API Endpoints
  - **Why**: API needs Group model and relationships
  - **Impact**: Cannot calculate derived metrics without Trade relationship

### External Dependencies
- **PostgreSQL 15** running in Docker (from STORY-002)
- **Node 24** with TypeScript support (from STORY-001)
- **pnpm workspace** configured (from STORY-001)

### Package Dependencies
- `@prisma/client` (^6.0.0) - Prisma Client runtime
- `prisma` (^6.0.0) - Prisma CLI (dev dependency)
- `tsx` (^4.0.0) - TypeScript execution for seed script (dev dependency)

---

## Definition of Done

### Code Quality
- [ ] `schema.prisma` follows Prisma naming conventions
- [ ] All enums use SCREAMING_SNAKE_CASE
- [ ] All models use PascalCase
- [ ] All fields use camelCase
- [ ] TypeScript strict mode passes (no `any` types)
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] No `console.log` statements in seed script (use proper logging if needed)

### Testing
- [ ] Seed script executes successfully (`pnpm prisma db seed`)
- [ ] Prisma Studio displays all tables and data
- [ ] Manual verification: 2 groups and 6 trades exist in database
- [ ] Manual verification: Relationships display correctly in Prisma Studio
- [ ] Migration can be applied to fresh database without errors
- [ ] No Prisma Client generation errors

### Documentation
- [ ] Prisma schema includes comments for complex fields
- [ ] `.env.example` documents DATABASE_URL format
- [ ] Seed script includes comments explaining sample data
- [ ] Migration files committed to git (`prisma/migrations/`)
- [ ] README updated with Prisma setup instructions (if new steps)

### Integration
- [ ] Migration files committed to git
- [ ] `schema.prisma` committed to git
- [ ] Seed script committed to git
- [ ] `.env.example` updated (DATABASE_URL template)
- [ ] `.env` in `.gitignore` (do not commit actual credentials)
- [ ] Works in Docker environment (database accessible from backend container)
- [ ] No breaking changes to existing infrastructure (STORY-001, STORY-002)

### Functional
- [ ] Database schema matches Prisma schema exactly
- [ ] All acceptance criteria satisfied
- [ ] Prisma Client can be imported in TypeScript files
- [ ] Autocomplete works for models (Trade, Group) and enums
- [ ] Sample data is realistic and useful for testing
- [ ] ON DELETE SET NULL behavior verified (delete group → trades persist)

### Performance
- [ ] Migration applies in <10 seconds
- [ ] Seed script executes in <5 seconds
- [ ] Prisma Client generation takes <30 seconds

---

## Story Points Breakdown

**Total: 5 points**

### Estimation Details

| Task                                  | Complexity | Time Estimate | Points |
| ------------------------------------- | ---------- | ------------- | ------ |
| Prisma installation & configuration   | Simple     | 30 minutes    | 0.5    |
| Schema definition (models + enums)    | Moderate   | 1.5 hours     | 1.5    |
| Migration creation & testing          | Simple     | 1 hour        | 1      |
| Seed script with realistic sample data| Moderate   | 1.5 hours     | 1.5    |
| Verification & documentation          | Simple     | 30 minutes    | 0.5    |
| **Total**                             |            | **~5 hours**  | **5**  |

### Rationale

**Why 5 points:**
- Schema definition requires careful attention to field types (Decimal vs Float)
- Relationships need proper configuration (ON DELETE behavior)
- Seed script must create realistic, interconnected data
- Migration process needs verification in Docker environment
- NOT complex enough for 8 points (no complex business logic)
- MORE complex than 3 points (multiple models, enums, relationships)

**Senior developer efficiency:**
- ~1 story point = 1 hour for this task
- Prisma's excellent documentation reduces unknowns
- Docker environment already set up (STORY-002 complete)

**Risks factored into estimate:**
- First-time Prisma setup in monorepo (+0.5 points)
- Docker networking issues (low probability, already tested in STORY-002)

---

## Additional Notes

### Future Enhancements (Post-MVP)

**Performance Optimizations:**
- Add database indexes on frequently queried fields:
  - `Trade.groupUuid` (for group lookup)
  - `Trade.expiryDate` (for sorting/filtering)
  - `Trade.symbol` (for filtering)
  - `Group.strategyType` (for filtering)

**Schema Evolution:**
- Add `status` field to Trade model (if runtime calculation becomes bottleneck)
- Add audit fields: `createdBy`, `updatedBy` (when user auth added)
- Add soft delete: `deletedAt` (for undo functionality)
- Add `version` field (for optimistic locking)

**Data Integrity:**
- Add check constraints (e.g., quantity > 0, strikePrice > 0)
- Add unique constraint on (symbol, strikePrice, expiryDate, optionType) if needed
- Add foreign key indexes for performance

### Testing Strategy

**Manual Testing Checklist:**
1. Run `docker-compose up -d` → PostgreSQL starts
2. Run `pnpm prisma migrate dev` → migration applies successfully
3. Run `pnpm prisma db seed` → sample data loads
4. Open Prisma Studio → verify 2 groups, 6 trades
5. Delete a group in Prisma Studio → verify trades persist (groupUuid becomes null)
6. Run `pnpm prisma generate` → Prisma Client regenerates
7. Import PrismaClient in a TypeScript file → autocomplete works

**No automated tests required for MVP** (schema definition is self-documenting)

### Rollback Plan

If migration fails:
1. Check Docker logs: `docker-compose logs postgres`
2. Verify DATABASE_URL in `.env`
3. Drop database and recreate: `docker-compose down -v && docker-compose up -d`
4. Re-apply migration: `pnpm prisma migrate dev`

If schema needs changes after migration:
1. Modify `schema.prisma`
2. Run `pnpm prisma migrate dev --name <change_description>`
3. Review generated migration SQL before applying

---

## Progress Tracking

**Status History:**
- 2026-01-04: Created by solo developer
- 2026-01-04 10:30 AM: Started implementation (feature/STORY-003-prisma-orm-setup)

**Actual Effort:** In progress (started 2026-01-04 10:30 AM)

**Blockers:** None (prerequisites STORY-001 and STORY-002 completed)

---

**This story was created using BMAD Method v6 - Phase 4 (Implementation Planning)**
