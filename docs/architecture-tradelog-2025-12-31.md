# TradeLog - System Architecture Document

**Project:** TradeLog
**Version:** 1.0
**Date:** 2025-12-31
**Project Level:** 2 (5-15 stories)
**Architecture Phase:** Phase 3 - Solutioning

---

## Document Information

**Status:** Approved
**Author:** System Architect (BMAD Method v6)
**Related Documents:**

- Product Brief: `docs/product-brief-tradelog-2025-12-31.md`
- PRD: `docs/prd-tradelog-2025-12-31.md`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architectural Drivers](#part-1-architectural-drivers)
3. [High-Level Architecture](#part-2-high-level-architecture)
4. [Technology Stack](#part-3-technology-stack)
5. [System Components](#part-4-system-components)
6. [Data Architecture](#part-5-data-architecture)
7. [API Design](#part-6-api-design)
8. [NFR Coverage](#part-7-nfr-coverage)
9. [Security Architecture](#part-8-security-architecture)
10. [Scalability & Performance](#part-9-scalability--performance)
11. [Reliability & Availability](#part-10-reliability--availability)
12. [Development & Deployment](#part-11-development--deployment)
13. [Traceability & Trade-offs](#part-12-traceability--trade-offs)
14. [Appendices](#appendices)

---

## Executive Summary

### Project Overview

TradeLog is a custom options trading portfolio management application designed to replace Interactive Brokers' confusing interface. The system enables unlimited leg grouping for complex multi-leg strategies (calendar spreads, ratio spreads) and provides clear portfolio visualization for rapid Friday trading workflow execution (1-2 minute overview target).

**Key Capabilities:**

- Manage individual options trades (Buy/Sell, Call/Put)
- Group trades into multi-leg strategies (2+ trades per group)
- Automatic P&L calculation and group status derivation
- Unified dashboard view with filtering and sorting
- Manual trade status tracking (Open, Closing Soon, Closed)

### Architectural Approach

**Pattern:** Layered Monolith with API-First Design
**Structure:** Monorepo (web/ + api/ + packages/)
**Deployment:** Docker Compose (localhost single-user MVP)

**Key Architectural Decisions:**

1. Single "Trades" domain with Groups as aggregates
2. Derive all group metrics on-demand (never store calculated fields)
3. UUID primary keys for security and future-proofing
4. Contract-first API design (Swagger → Frontend types)
5. Prisma enums as single source of truth
6. API versioning from day 1 (/v1)

### Technology Stack Summary

| Layer              | Technology                            | Rationale                                  |
| ------------------ | ------------------------------------- | ------------------------------------------ |
| **Frontend**       | React 18, TypeScript, Vite, shadcn/ui | Modern SPA, type-safe, fast HMR            |
| **Backend**        | NestJS, TypeScript, Prisma ORM        | DDD-friendly, type-safe, ACID transactions |
| **Database**       | PostgreSQL 15                         | ACID compliance, relational integrity      |
| **Infrastructure** | Docker Compose, Node 24 Alpine        | Single-command setup, environment parity   |
| **API Docs**       | Swagger/OpenAPI, openapi-typescript   | Contract-first, auto-generated types       |

### Performance Targets

- **Dashboard Load:** <2 seconds ✅ (estimated ~725ms)
- **Trade List Render:** <1 second ✅ (estimated ~500ms for 600 items)
- **Form Submission:** <500ms ✅ (estimated ~100ms)
- **Scalability:** 500+ trades, 100+ groups ✅

### Security Posture

**MVP (Localhost):** Minimal security - input validation, SQL injection prevention, data exposure control
**Production (Future):** Authentication, HTTPS, rate limiting, security headers (see Security Backlog)

---

## Part 1: Architectural Drivers

Based on the PRD's Non-Functional Requirements, the following factors heavily influence architectural decisions:

### Primary Drivers (High Impact on Architecture)

**1. NFR-001: Performance Requirements**

- Dashboard load < 2 seconds
- Trade list render < 1 second
- Form submission response < 500ms
- **Architectural Impact:** Requires efficient database queries, proper indexing, optimized API responses, caching strategy

**2. NFR-004: Data Integrity**

- Transactional operations for trade/group management
- Group status automatically derived from child trades
- **Architectural Impact:** Requires transaction management, referential integrity, business logic layer for derivation

**3. NFR-006: Scalability**

- Support 500+ trades, 100+ groups
- **Architectural Impact:** Requires pagination strategy, database indexing, efficient query design

**4. NFR-007: Local Development Reliability**

- Docker Compose single-command startup
- **Architectural Impact:** Containerization architecture, environment configuration management

**5. NFR-005: Code Quality & Documentation**

- TypeScript strict mode
- Swagger/OpenAPI with type generation
- **Architectural Impact:** API-first development, shared type package, contract-driven design

### Secondary Drivers (Moderate Impact)

**6. NFR-003: Responsive Design**

- Desktop, tablet, mobile viewports
- **Architectural Impact:** Frontend component architecture, CSS strategy

**7. NFR-008: Security**

- Minimal for localhost MVP
- **Architectural Impact:** Basic input validation only, defer auth/encryption

---

## Part 2: High-Level Architecture

### Architectural Pattern

**Layered Monolith with API-First Design**

**Rationale:**

- Level 2 project suits a simple, proven architecture
- Monorepo structure naturally aligns with layered approach
- API-first via Swagger enables contract-driven development
- Clear separation of concerns without over-engineering
- Single-user localhost deployment doesn't require microservices complexity

### System Architecture Diagram

```
┌─────────────────────────────────────┐
│   User Browser                      │
└──────────────┬──────────────────────┘
               │ HTTP/REST
               ↓
┌─────────────────────────────────────┐
│   Frontend (React SPA)              │
│   - UI Components (shadcn)          │
│   - Forms (React Hook Form + Zod)  │
│   - State (TanStack Query)          │
│   - Routes                          │
└──────────────┬──────────────────────┘
               │ REST API
               ↓
┌─────────────────────────────────────┐
│   Backend (NestJS)                  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ Controllers (API Gateway)   │  │
│   │ - Swagger/OpenAPI           │  │
│   │ - DTO Validation            │  │
│   └──────────┬──────────────────┘  │
│              ↓                      │
│   ┌─────────────────────────────┐  │
│   │ Services (Business Logic)   │  │
│   │ - Group status derivation   │  │
│   │ - P&L calculation           │  │
│   │ - Business rules            │  │
│   └──────────┬──────────────────┘  │
│              ↓                      │
│   ┌─────────────────────────────┐  │
│   │ Prisma ORM (Data Access)    │  │
│   │ - Type-safe queries         │  │
│   │ - Transactions              │  │
│   └──────────┬──────────────────┘  │
└───────────────┼──────────────────────┘
                ↓
┌─────────────────────────────────────┐
│   PostgreSQL Database               │
│   - trades table                    │
│   - trade_groups table                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Shared Types Package              │
│   (imported by frontend & backend)  │
│   - TypeScript enums (ItemType)     │
└─────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Monorepo Structure:** Frontend, backend, and shared packages in single repository for type safety and simpler dependency management

2. **Layered Backend:** Controllers → Services → Data Access ensures clean separation and testability

3. **Contract-First API:** Swagger decorators define API contract, generate types for frontend consumption

4. **Derived Data:** Group status and metrics calculated on-demand rather than stored, ensuring consistency

5. **Docker Containerization:** All components containerized for reliable local development

6. **Single Domain:** Trades domain contains both Trade and Group logic (Groups are aggregates of Trades)

---

## Part 3: Technology Stack

### General Requirement

✅ Use **latest LTS versions** for all packages and technologies

### Frontend Stack

**React 18.2** ✅ Implemented (STORY-006)

- Component-based architecture
- Large ecosystem for trading UI components
- Addresses: NFR-002 (usability), NFR-003 (responsive design)
- Version: 18.2.0

**TypeScript (strict mode)** ✅ Implemented (STORY-006)

- End-to-end type safety with backend
- Compile-time error detection
- Addresses: NFR-005 (code quality)
- Zero `any` types, full strict mode enforcement

**Vite 5** ✅ Implemented (STORY-006)

- Fast HMR and optimized builds
- Better DX than Create React App
- Addresses: NFR-007 (development reliability)
- Version: 5.0.0

**shadcn/ui** ✅ Implemented (STORY-006)

- Accessible, customizable components
- TypeScript-first, no runtime dependency
- Addresses: NFR-002 (intuitive UI), NFR-003 (responsive)
- Components: Button, Input, Select, Calendar, Dialog, Form, Popover, Textarea
- Built on Radix UI primitives

**Tailwind CSS v4.1.18 (alpha)** ✅ Implemented (STORY-006)

- Utility-first CSS framework
- New @import and @theme syntax (v4 breaking changes)
- Addresses: NFR-003 (responsive design)
- Note: Using alpha version - replaced CSS custom properties with explicit classes for calendar component

**React Hook Form 7.70** ✅ Implemented (STORY-006)

- Minimal re-renders for better performance
- Great TypeScript integration
- Addresses: NFR-001 (performance)
- Created reusable wrapper components (ReactHookFormField, ReactHookFormSelect, ReactHookFormDatePicker)

**Zod 4.3.5** ✅ Implemented (STORY-006)

- Runtime validation with type inference
- Integrates with React Hook Form
- Addresses: NFR-004 (data integrity), NFR-005 (type safety)
- Note: v4 uses new error message format: {message: 'text'}

**TanStack Query 5.90.16 (React Query)** ✅ Implemented (STORY-006)

- Built-in caching, automatic refetching
- Optimistic updates support
- Addresses: NFR-001 (performance via caching)

**openapi-fetch 0.15.0 + openapi-react-query 0.5.1** ✅ Implemented (STORY-006)

- Type-safe API client generated from OpenAPI spec
- Automatic type inference from backend schema
- Replaces traditional Axios/fetch approaches
- Addresses: NFR-005 (type safety), NFR-001 (performance)
- QueryKey structure: [method, path, params]

**date-fns 4.1.0** ✅ Implemented (STORY-006)

- Lightweight date utility library
- Used for date formatting and parsing
- Addresses timezone issues with parseISO() and format()

**Sonner 2.0.7** ✅ Implemented (STORY-006)

- Toast notification library
- Clean, accessible notifications
- Used for success/error feedback

### Backend Stack

**NestJS**

- DDD-friendly module structure
- Built-in dependency injection
- Excellent TypeScript support
- Addresses: NFR-005 (code quality), NFR-006 (scalability)

**TypeScript (strict mode)**

- End-to-end type safety
- Addresses: NFR-005 (code quality)

**Prisma ORM**

- Type-safe queries - generates types from schema
- **Enums as source of truth** - defined in schema.prisma, used everywhere
- Migration management
- PostgreSQL optimization
- Addresses: NFR-004 (data integrity), NFR-005 (type safety), NFR-006 (performance)

**class-validator + class-transformer**

- DTO validation in NestJS
- Decorator-based, clean API
- Enables `@Expose()` pattern for response serialization
- Addresses: NFR-004 (data integrity), NFR-008 (security - prevents data leaks)

**@nestjs/swagger** ✅ Enhanced (STORY-006)

- Auto-generates OpenAPI spec
- Provides Swagger UI at `/api/docs`
- **Generates TypeScript types for frontend** via `openapi-typescript`
- Addresses: NFR-005 (API documentation), FR-000 (Swagger requirement)
- Custom decorators: @ApiOkDataResponse, @ApiCreatedDataResponse (following DocAid pattern)
- Properly documents response content types for frontend type generation

**compression**

- Gzip/deflate response compression
- Reduces payload size for better performance
- Addresses: NFR-001 (performance)

### Database

**PostgreSQL 15+**

- ACID compliance for transactions
- Excellent relational data support
- Proven reliability
- Addresses: NFR-004 (data integrity), NFR-006 (scalability)

### Infrastructure

**Docker + Docker Compose**

- Environment parity
- Single-command startup
- Isolated dependencies
- Addresses: NFR-007 (local development reliability)

**Node 24 Alpine**

- Latest LTS version
- Lightweight (~120MB vs 900MB)
- Secure, minimal attack surface
- Fast builds

### Development Tools

**pnpm 9+**

- Efficient monorepo support
- Faster than npm, disk space efficient
- Workspace management
- Addresses: NFR-007 (development efficiency)

**ESLint + Prettier**

- Consistent code style
- Catch common errors
- Addresses: NFR-005 (code quality)

**TypeScript Compiler (tsc)**

- Strict mode enforcement
- Build-time type checking
- Addresses: NFR-005 (code quality)

**openapi-typescript 7.10.1** ✅ Implemented (STORY-006)

- Generate frontend types from Swagger spec
- Single source of truth (backend schema)
- Auto-sync on build
- Addresses: NFR-005 (type safety)
- Command: `pnpm type:gen` generates src/types/api.schema.ts from OpenAPI spec

### Type Flow Architecture

```
prisma/schema.prisma
  ↓ (prisma generate)
@prisma/client (Trade, Group, TradeType, OptionType, TradeStatus, StrategyType)
  ↓ (used in)
NestJS DTOs with @nestjs/swagger decorators
  ↓ (generates)
OpenAPI spec (swagger.json)
  ↓ (openapi-typescript)
Frontend types (api.types.ts)
  ↓ (used in)
React components + TanStack Query
```

**Key Decision:** Prisma enums + Swagger type generation provides complete end-to-end type safety. No separate shared package needed for enums.

---

## Part 4: System Components

### Component 1: Frontend Application (React SPA)

**Purpose:** User interface for portfolio and trade management

**Responsibilities:**

- Render responsive UI (desktop, tablet, mobile viewports)
- Handle user input via forms (React Hook Form + Zod)
- Consume backend REST API (v1 versioned endpoints)
- Cache and synchronize data (TanStack Query)
- Display portfolio dashboard with real-time calculations
- Manage client-side routing

**Internal Structure:**

```
web/src/
├── pages/                      # Route components
│   ├── Dashboard.tsx
│   └── TradesList.tsx
├── components/                 # Reusable UI (shadcn-based)
│   ├── ui/                     # shadcn components
│   ├── trade-form/             # Trade & strategy creation
│   │   ├── trade-form.tsx      # Main form (includes Strategy Builder)
│   │   ├── strategy-section.tsx
│   │   └── trade-list-item.tsx
│   ├── TradeCard.tsx
│   └── index.ts                # Barrel export
├── lib/
│   ├── api/                    # API client layer
│   │   ├── client.ts           # openapi-fetch instance
│   │   ├── trades.ts           # Trade queries/mutations
│   │   ├── trade-groups.ts     # Group queries/mutations
│   │   └── index.ts
│   ├── validation/             # Zod schemas
│   │   ├── trade.schema.ts
│   │   └── index.ts
│   ├── form-error-handler.ts   # API error handling utilities
│   └── trade-form-utils.ts     # Trade form business logic
├── types/
│   ├── api.schema.ts           # Generated from Swagger via openapi-typescript
│   └── trade-form.types.ts     # Shared form types
├── hooks/                      # Custom React hooks (TanStack Query)
│   ├── use-trades.ts
│   └── use-trade-groups.ts
└── main.tsx
```

**Interfaces:**

- Consumes: `GET/POST/PATCH/DELETE /v1/trades`, `/v1/trade-groups`, `POST /v1/strategies`
- Receives: `DataResponseDto<T>` wrapped responses
- Uses types from: `types/api.schema.ts` (Swagger-generated)

**Dependencies:**

- Backend API (http://localhost:3000/v1)
- Swagger-generated types

**Technologies:**

- React 18, TypeScript, Vite, shadcn/ui, React Hook Form, Zod, TanStack Query

**Addresses:**

- All FRs (UI layer for all features)
- NFR-001 (performance via caching)
- NFR-002 (intuitive UI)
- NFR-003 (responsive design)

---

### Component 2: Backend API (NestJS Application)

**Purpose:** Business logic, data access, and API gateway

**Responsibilities:**

- Expose REST API endpoints (versioned `/v1`)
- Validate requests via DTOs (class-validator)
- Execute business logic (group status derivation, P&L calculation)
- Manage database transactions (Prisma)
- Transform responses via DTOs (class-transformer)
- Generate OpenAPI documentation (Swagger)
- Apply global interceptors and pipes

**Internal Structure:**

```
api/src/
├── trades/                          # Trading Domain (DDD module)
│   ├── controllers/
│   │   ├── trades.controller.ts     # /v1/trades endpoints
│   │   └── groups.controller.ts     # /v1/trade-groups endpoints
│   ├── services/
│   │   ├── trades.service.ts        # Trade business logic
│   │   └── groups.service.ts        # Group aggregation logic
│   ├── dto/
│   │   ├── request/
│   │   │   ├── create-trade.dto.ts
│   │   │   ├── update-trade.dto.ts
│   │   │   ├── create-group.dto.ts
│   │   │   └── index.ts
│   │   └── response/
│   │       ├── trade-response.dto.ts      # With @Expose()
│   │       ├── group-response.dto.ts      # With calculated fields
│   │       └── index.ts
│   ├── interfaces/
│   │   ├── group-with-metrics.interface.ts  # Custom compositions
│   │   └── index.ts
│   ├── trades.module.ts
│   └── index.ts                     # Barrel export
│
├── common/
│   ├── dto/
│   │   └── data-response.dto.ts     # DataResponseDto<T>
│   ├── enums/
│   │   ├── item-type.enum.ts        # TypeScript enum (NOT Prisma)
│   │   └── index.ts
│   ├── interceptors/
│   ├── pipes/
│   └── index.ts
│
├── prisma/
│   ├── prisma.service.ts
│   └── schema.prisma                # Source of truth (entities + enums)
│
└── main.ts                          # Global config (pipes, interceptors, CORS)
```

**Interfaces:**

- Exposes: REST API at `http://localhost:3000/v1`
- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI spec: `http://localhost:3000/api/docs-json`
- Database: PostgreSQL via Prisma

**Key Patterns:**

- **Global ValidationPipe:** Auto-transform and whitelist incoming requests
- **Global ClassSerializerInterceptor:** Only expose `@Expose()` decorated fields
- **plainToInstance:** Explicit Prisma entity → Response DTO transformation
- **DataResponseDto<T>:** Consistent response wrapper

**Dependencies:**

- PostgreSQL database (port 5432)
- Prisma Client (generated from schema.prisma)

**Technologies:**

- NestJS, TypeScript, Prisma, class-validator, class-transformer, @nestjs/swagger, compression

**Addresses:**

- All FRs (API implementation)
- NFR-004 (data integrity via transactions)
- NFR-005 (code quality via DDD structure, Swagger docs)
- NFR-006 (scalability via efficient queries)

---

### Component 3: PostgreSQL Database

**Purpose:** Persistent data storage with ACID guarantees

**Responsibilities:**

- Store trades and groups with relational integrity
- Enforce foreign key constraints
- Support transactions for atomic operations
- Provide indexed queries for performance
- Handle concurrent access safely

**Schema (managed by Prisma):**

```
┌──────────────────────┐
│ groups               │
├──────────────────────┤
│ uuid (PK)            │
│ name                 │
│ strategyType (enum)  │
│ notes                │
│ createdAt            │
│ updatedAt            │
└──────────┬───────────┘
           │ 1
           │
           │ many
           ↓
┌──────────────────────┐
│ trades               │
├──────────────────────┤
│ uuid (PK)            │
│ symbol               │
│ strikePrice          │
│ expiryDate           │
│ tradeType (enum)     │
│ optionType (enum)    │
│ quantity             │
│ costBasis            │
│ currentValue         │
│ status (enum)        │
│ notes                │
│ tradeGroupUuid (FK, null) │─────┐
│ createdAt            │     │
│ updatedAt            │     │
└──────────────────────┘     │
                              │
                              └→ groups.uuid (ON DELETE SET NULL)
```

**Indexes:**

- trades: `tradeGroupUuid`, `expiryDate`, `status`, `symbol`
- groups: `strategyType`

**Enums (defined in Prisma):**

- TradeType, OptionType, TradeStatus, StrategyType

**Interfaces:**

- Prisma Client connection (port 5432 internal to Docker network)

**Dependencies:**

- None (standalone)

**Technologies:**

- PostgreSQL 15+ (Alpine Docker image)

**Addresses:**

- NFR-004 (data integrity via ACID)
- NFR-006 (scalability via indexes)

---

### Component 4: Docker Infrastructure

**Purpose:** Containerized development environment

**Responsibilities:**

- Containerize all services (web, api, database)
- Orchestrate multi-container startup via Docker Compose
- Provide single-command setup (`docker-compose up`)
- Manage service networking and volumes
- Ensure environment parity

**Services:**

**web:**

- Image: Node 24 Alpine
- Command: `pnpm dev` (Vite dev server)
- Port: 5173:5173
- Volumes: `./web:/app` (hot reload)
- Environment: `VITE_API_URL=http://localhost:3000/v1`

**api:**

- Image: Node 24 Alpine
- Command: `pnpm start:dev` (NestJS watch mode)
- Port: 3000:3000
- Volumes: `./api:/app`
- Environment: `DATABASE_URL=postgresql://user:pass@postgres:5432/tradelog`
- Depends on: postgres

**postgres:**

- Image: PostgreSQL 15 Alpine
- Port: 5432:5432 (exposed for local DB tools)
- Volume: `postgres-data:/var/lib/postgresql/data` (persistence)
- Environment: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

**Network:**

- Bridge network connecting all services

**Dependencies:**

- Docker Engine
- Docker Compose

**Technologies:**

- Docker, Docker Compose, Node 24 Alpine, PostgreSQL 15 Alpine

**Addresses:**

- NFR-007 (local development reliability)
- FR-000 (project setup)

---

### Component 5: Type Generation Pipeline

**Purpose:** Maintain type safety across frontend and backend

**Responsibilities:**

- Generate Prisma Client from schema.prisma
- Generate OpenAPI spec from NestJS decorators
- Generate frontend types from OpenAPI spec
- Ensure single source of truth

**Flow:**

```
1. prisma/schema.prisma (Source of Truth)
   ↓ pnpm prisma generate
2. @prisma/client (Trade, Group, enums)
   ↓ used in NestJS DTOs with @ApiProperty
3. @nestjs/swagger generates OpenAPI spec
   ↓ exposed at /api/docs-json
4. openapi-typescript generates api.types.ts
   ↓ imported by frontend
5. React components use typed API client
```

**Build Scripts:**

```json
{
  "api:generate": "prisma generate && nest build",
  "web:generate": "openapi-typescript http://localhost:3000/api/docs-json -o ./src/types/api.types.ts",
  "type:generate": "pnpm api:generate && pnpm web:generate"
}
```

**Dependencies:**

- Backend must be running for frontend type generation

**Technologies:**

- Prisma CLI, @nestjs/swagger, openapi-typescript

**Addresses:**

- NFR-005 (code quality via end-to-end type safety)

---

## Part 5: Data Architecture

### Data Model

#### Entity 1: Trade (Individual Options Trade)

**Purpose:** Represents a single options position.

**Stored Attributes:**

- `uuid` - UUID (primary key)
- `symbol` - String - Stock ticker (e.g., "AAPL", "TSLA", "SPY")
- `strikePrice` - Decimal(10,2) - Strike price in dollars
- `expiryDate` - Date - Option expiration date
- `tradeType` - Enum (BUY, SELL)
- `optionType` - Enum (CALL, PUT)
- `quantity` - Integer - Number of contracts
- `costBasis` - Decimal(10,2) - Total cost of position
- `currentValue` - Decimal(10,2) - Current market value (manual entry for MVP)
- `status` - Enum (OPEN, CLOSING_SOON, CLOSED)
- `notes` - Text (nullable) - Trade journal notes
- `tradeGroupUuid` - UUID (nullable, FK to Group)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

#### Entity 2: Group (Trade Combination/Strategy)

**Purpose:** Represents a multi-leg strategy composed of related trades.

**Stored Attributes:**

- `uuid` - UUID (primary key)
- `name` - String - User-defined or suggested name (e.g., "Calendar Spread Feb-15-2026")
- `strategyType` - Enum (CALENDAR_SPREAD, RATIO_CALENDAR_SPREAD, CUSTOM)
- `notes` - Text (nullable) - Strategy reasoning
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

**Derived Attributes (Calculated on-demand, NOT stored):**

- `closingExpiry` - Date - **MIN(trade.expiryDate)** of all child trades
- `status` - TradeStatus - Derived from child trade statuses
- `totalCostBasis` - Decimal - **SUM(trade.costBasis)** of children
- `totalCurrentValue` - Decimal - **SUM(trade.currentValue)** of children
- `profitLoss` - Decimal - `totalCurrentValue - totalCostBasis`

### Relationships

```
Group (1) ──────< (many) Trade
            tradeGroupUuid FK

- One group contains many trades (2+ required by business logic)
- One trade belongs to zero or one group (nullable tradeGroupUuid)
- Ungrouped trades: tradeGroupUuid = null
- Cascade behavior: ON DELETE SET NULL (preserve trades when group deleted)
```

**Business Rules:**

- Groups must have 2+ trades (enforced in TradeGroupsService)
- If group has <2 trades after deletion, auto-ungroup remaining trade(s)
- Group derived fields recalculated on every read

### Database Schema (Prisma)

```prisma
// api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===== ENUMS (Database-stored only) =====
// NOTE: ItemType is NOT here - it's a TypeScript enum in api/src/common/enums/

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

// ===== MODELS =====

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
  symbol       String      // Stock ticker (AAPL, TSLA, etc.)
  strikePrice  Decimal     @db.Decimal(10, 2)
  expiryDate   DateTime    @db.Date
  tradeType    TradeType
  optionType   OptionType
  quantity     Int
  costBasis    Decimal     @db.Decimal(10, 2)
  currentValue Decimal     @db.Decimal(10, 2)
  status       TradeStatus
  notes        String?     @db.Text
  tradeGroupUuid    String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  group        Group?      @relation(fields: [tradeGroupUuid], references: [uuid], onDelete: SetNull)

  @@index([tradeGroupUuid])
  @@index([expiryDate])
  @@index([status])
  @@index([symbol])
  @@map("trades")
}
```

### Normalization & Data Integrity

**Normalization Level:** 3NF (Third Normal Form)

- No redundant data storage
- All derived values calculated on-demand
- Single source of truth for all data points

**Key Decision: Why NOT store `closingExpiry` in groups table?**

- ❌ **Denormalization risk:** Creates duplicate data (already in trades.expiryDate)
- ❌ **Consistency risk:** Must update whenever child trades change
- ❌ **Complexity:** Requires triggers or application logic to maintain
- ✅ **Calculate on-demand:** Trivial query for ~100 groups, ensures consistency
- ✅ **Single source of truth:** Trade expiry dates are authoritative

**Constraint Strategy:**

- Primary keys: UUIDs (globally unique, no enumeration)
- Foreign key: `trades.tradeGroupUuid → groups.uuid` with `ON DELETE SET NULL`
- NOT NULL constraints on required fields
- Check constraints: `quantity > 0`, `costBasis >= 0`, `currentValue >= 0`
- Unique constraints: None (multiple trades can have same symbol/strike/expiry)

### Index Strategy

**Performance Considerations (addresses NFR-001, NFR-006):**

**trades table:**

- `uuid` (UUID, primary key) - Clustered index
- `tradeGroupUuid` - Non-clustered - For joins and "trades in group" queries
- `expiryDate` - Non-clustered - For sorting/filtering by expiry, "closing soon" queries
- `status` - Non-clustered - For filtering open/closed trades
- `symbol` - Non-clustered - For filtering by stock ticker

**groups table:**

- `uuid` (UUID, primary key) - Clustered index
- `strategyType` - Non-clustered - For filtering by strategy type

**Query Optimization:**

- Dashboard query: Fetch all groups with child trades (eager loading via Prisma `include`)
- Trade list: Fetch trades with optional group info (left join)
- Pagination: Deferred until >1,000 trades (architecture supports `LIMIT/OFFSET`)

### Data Flow Patterns

**Create Trade:**

```
Frontend form → Validation (Zod)
              → POST /v1/trades
              → DTO validation (class-validator)
              → TradesService.create()
              → Prisma transaction BEGIN
              → INSERT INTO trades (status = OPEN by default)
              → Prisma transaction COMMIT
              → Transform to TradeResponseDto (plainToInstance)
              → Return DataResponseDto<TradeResponseDto>
              → Frontend cache invalidation (TanStack Query)
```

**Create Group (from existing trades):**

```
Frontend (select trades + name) → Validation
                                → POST /v1/trade-groups
                                → DTO validation
                                → TradeGroupsService.create()
                                → Prisma transaction BEGIN
                                → INSERT INTO groups
                                → UPDATE trades SET tradeGroupUuid WHERE uuid IN (...)
                                → Prisma transaction COMMIT
                                → Calculate derived fields (closingExpiry, status, metrics)
                                → Transform to TradeGroupResponseDto
                                → Return DataResponseDto<TradeGroupResponseDto>
                                → Frontend cache invalidation
```

**Create Strategy (atomic group + trades via Strategy Builder):**

```
Frontend (Trade Form strategy mode) → Validation (Zod)
                                    → POST /v1/strategies
                                    → DTO validation (CreateStrategyDto)
                                    → TradeGroupsService.createStrategy()
                                    → Prisma transaction BEGIN
                                    → INSERT INTO groups (with metadata)
                                    → INSERT INTO trades (with tradeGroupUuid, status = OPEN)
                                    → Prisma transaction COMMIT
                                    → Calculate derived fields (closingExpiry, status, metrics)
                                    → Transform to TradeGroupResponseDto
                                    → Return DataResponseDto<TradeGroupResponseDto>
                                    → Frontend cache invalidation
```

**Key Difference:** Strategy Builder creates both group and trades atomically, while the traditional flow groups existing trades.

**Fetch Group with Metrics (Read Path):**

```
GET /v1/trade-groups/:uuid
  ↓
TradeGroupsService.findByUuid(uuid)
  ↓
Prisma query with include: { trades: true }
  ↓
Calculate derived fields:
  - closingExpiry = Math.min(...trades.map(t => t.expiryDate))
  - status = deriveStatus(trades)
  - totalCostBasis = trades.reduce((sum, t) => sum + t.costBasis, 0)
  - totalCurrentValue = trades.reduce((sum, t) => sum + t.currentValue, 0)
  - profitLoss = totalCurrentValue - totalCostBasis
  ↓
Transform to TradeGroupResponseDto (plainToInstance)
  ↓
Return DataResponseDto<TradeGroupResponseDto>
```

**Derived Status Algorithm:**

```typescript
// TradeGroupsService.deriveGroupStatus()
deriveGroupStatus(trades: Trade[]): TradeStatus {
  if (trades.some(t => t.status === TradeStatus.CLOSED)) {
    return TradeStatus.CLOSED;
  }
  if (trades.some(t => t.status === TradeStatus.CLOSING_SOON)) {
    return TradeStatus.CLOSING_SOON;
  }
  return TradeStatus.OPEN;
}
```

### Transaction Boundaries

All multi-table operations use Prisma transactions (addresses NFR-004):

**Transaction Scope 1: Create Group**

```typescript
await prisma.$transaction([
  prisma.group.create({ data: { ... } }),
  prisma.trade.updateMany({
    where: { uuid: { in: tradeUuids } },
    data: { tradeGroupUuid: newGroupUuid }
  })
]);
```

**Transaction Scope 2: Delete Group**

```typescript
// ON DELETE SET NULL handles this automatically
await prisma.group.delete({ where: { uuid } });
// trades.tradeGroupUuid automatically set to null
```

**Transaction Scope 3: Delete Trade (with group integrity check)**

```typescript
await prisma.$transaction(async (tx) => {
  const trade = await tx.trade.delete({ where: { uuid } });

  if (trade.tradeGroupUuid) {
    const remainingTrades = await tx.trade.count({
      where: { tradeGroupUuid: trade.tradeGroupUuid },
    });

    if (remainingTrades < 2) {
      // Ungroup remaining trades
      await tx.trade.updateMany({
        where: { tradeGroupUuid: trade.tradeGroupUuid },
        data: { tradeGroupUuid: null },
      });
      await tx.group.delete({ where: { uuid: trade.tradeGroupUuid } });
    }
  }
});
```

### Data Consistency Rules

1. **Group Integrity:**
   - Groups must have 2+ trades (enforced in service layer)
   - If trade removal leaves <2 trades, auto-ungroup and delete group

2. **Derived Fields:**
   - Never stored, always calculated on read
   - Ensures consistency (no stale data)
   - Single source of truth (trade data)

3. **Status Derivation:**
   - Group status deterministic from child trade statuses
   - No manual override allowed
   - Frontend never sends group status

4. **Referential Integrity:**
   - Foreign keys enforced at database level
   - Cascade behavior preserves trades when groups deleted
   - No orphaned data

---

## Part 6: API Design

### API Versioning Strategy

**Base URL:** `http://localhost:3000/v1`

**Versioning Type:** URI-based (`VersioningType.URI`)

- All endpoints prefixed with `/v1`
- Future versions: `/v2`, `/v3`, etc.
- Allows API evolution without breaking changes

**Configuration:**

```typescript
// main.ts
app.enableVersioning({ type: VersioningType.URI });
```

### Response Pattern

**All endpoints return consistent wrapper:**

```typescript
// common/dto/data-response.dto.ts
export class DataResponseDto<T> {
  readonly data!: T;
}
```

**Example Response:**

```json
{
  "data": {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "symbol": "AAPL",
    "strikePrice": 150.00,
    ...
  }
}
```

**For lists:**

```json
{
  "data": [
    { "uuid": "...", ... },
    { "uuid": "...", ... }
  ]
}
```

### REST Endpoints

#### Trades Endpoints

**Base:** `/v1/trades`

| Method | Endpoint                    | Description                            | Request Body     | Response                              |
| ------ | --------------------------- | -------------------------------------- | ---------------- | ------------------------------------- |
| GET    | `/v1/trades`                | List ungrouped trades                  | -                | `DataResponseDto<TradeResponseDto[]>` |
| GET    | `/v1/trades?include=groups` | List all portfolio items (mixed)       | -                | `DataResponseDto<PortfolioItemDto[]>` |
| GET    | `/v1/trades/:uuid`          | Get single trade                       | -                | `DataResponseDto<TradeResponseDto>`   |
| POST   | `/v1/trades`                | Create trade (status defaults to OPEN) | `CreateTradeDto` | `DataResponseDto<TradeResponseDto>`   |
| PATCH  | `/v1/trades/:uuid`          | Update trade                           | `UpdateTradeDto` | `DataResponseDto<TradeResponseDto>`   |
| DELETE | `/v1/trades/:uuid`          | Delete trade                           | -                | `DataResponseDto<void>`               |

**Query Parameters (GET /v1/trades):**

- `?include=groups` - Include groups in response (mixed portfolio items)
- `?status=OPEN` - Filter by status
- `?symbol=AAPL` - Filter by stock ticker
- `?sortBy=createdAt|symbol` - Sort field
- `?order=asc|desc` - Sort order

**PortfolioItemDto (Discriminated Union):**

```typescript
type PortfolioItemDto =
  | (TradeGroupResponseDto & { readonly itemType: ItemType.GROUP })
  | (TradeResponseDto & { readonly itemType: ItemType.TRADE });
```

**ItemType Enum (TypeScript only, NOT in Prisma):**

```typescript
// api/src/common/enums/item-type.enum.ts
export enum ItemType {
  TRADE = 'TRADE',
  GROUP = 'GROUP',
}
```

#### Groups Endpoints

**Base:** `/v1/trade-groups`

| Method | Endpoint                             | Description             | Request Body               | Response                              |
| ------ | ------------------------------------ | ----------------------- | -------------------------- | ------------------------------------- |
| GET    | `/v1/trade-groups`                         | List all groups         | -                          | `DataResponseDto<TradeGroupResponseDto[]>` |
| GET    | `/v1/trade-groups/:uuid`                   | Get single group        | -                          | `DataResponseDto<TradeGroupResponseDto>`   |
| POST   | `/v1/trade-groups`                         | Create group from existing trades | `CreateTradeGroupDto`           | `DataResponseDto<TradeGroupResponseDto>`   |
| PATCH  | `/v1/trade-groups/:uuid`                   | Update group metadata   | `UpdateTradeGroupDto`           | `DataResponseDto<TradeGroupResponseDto>`   |
| DELETE | `/v1/trade-groups/:uuid`                   | Delete group            | -                          | `DataResponseDto<void>`               |
| POST   | `/v1/trade-groups/:uuid/trades`            | Add trades to group     | `{ tradeUuids: string[] }` | `DataResponseDto<TradeGroupResponseDto>`   |
| DELETE | `/v1/trade-groups/:uuid/trades/:tradeUuid` | Remove trade from group | -                          | `DataResponseDto<TradeGroupResponseDto>`   |

#### Strategy Builder Endpoint

**Base:** `/v1/strategies`

**Updated Implementation (2026-01-11):**

The Strategy Builder provides atomic creation of a trade group and all its child trades in a single transaction. This is the primary method for creating multi-leg strategies in the UI via the Trade Form's strategy mode.

| Method | Endpoint         | Description                                      | Request Body         | Response                            |
| ------ | ---------------- | ------------------------------------------------ | -------------------- | ----------------------------------- |
| POST   | `/v1/strategies` | Atomically create group + trades (Strategy Builder) | `CreateStrategyDto` | `DataResponseDto<TradeGroupResponseDto>` |

**Key Characteristics:**
- **Atomic Transaction:** Creates both the trade group and all child trades in a single database transaction
- **Frontend Integration:** Used by the Trade Form's strategy toggle mode
- **Single Source:** Replaces the need for separate group creation flow
- **Data Validation:** Ensures all trades have consistent data before creation

### DTO Definitions

#### Request DTOs (Input Validation)

**CreateTradeDto:**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { TradeType, OptionType } from '@prisma/client';

export class CreateTradeDto {
  @ApiProperty({ example: 'AAPL', description: 'Stock ticker symbol' })
  @IsString()
  readonly symbol!: string;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  @Min(0)
  readonly strikePrice!: number;

  @ApiProperty({ example: '2026-02-15' })
  @IsDateString()
  readonly expiryDate!: string;

  @ApiProperty({ enum: TradeType })
  @IsEnum(TradeType)
  readonly tradeType!: TradeType;

  @ApiProperty({ enum: OptionType })
  @IsEnum(OptionType)
  readonly optionType!: OptionType;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  readonly quantity!: number;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  @Min(0)
  readonly costBasis!: number;

  @ApiProperty({ example: 1750.0 })
  @IsNumber()
  @Min(0)
  readonly currentValue!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly notes?: string;

  @ApiProperty({ required: false, description: 'UUID of parent group' })
  @IsOptional()
  @IsString()
  readonly tradeGroupUuid?: string;

  // NOTE: status NOT included - defaults to OPEN in service
}
```

**CreateTradeGroupDto:**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsArray, ArrayMinSize, IsOptional } from 'class-validator';
import { StrategyType } from '@prisma/client';

export class CreateTradeGroupDto {
  @ApiProperty({ example: 'Calendar Spread Feb-15-2026' })
  @IsString()
  readonly name!: string;

  @ApiProperty({ enum: StrategyType })
  @IsEnum(StrategyType)
  readonly strategyType!: StrategyType;

  @ApiProperty({ type: [String], description: 'Array of trade UUIDs (min 2)' })
  @IsArray()
  @ArrayMinSize(2)
  readonly tradeUuids!: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly notes?: string;
}
```

**CreateStrategyDto (Strategy Builder):**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StrategyType } from '@prisma/client';
import { CreateTradeDto } from './create-trade.dto';

class StrategyGroupDto {
  @ApiProperty({ example: 'Calendar Spread Feb-15-2026' })
  @IsString()
  readonly name!: string;

  @ApiProperty({ enum: StrategyType })
  @IsEnum(StrategyType)
  readonly strategyType!: StrategyType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly notes?: string;
}

export class CreateStrategyDto {
  @ApiProperty({ type: StrategyGroupDto, description: 'Group metadata' })
  @ValidateNested()
  @Type(() => StrategyGroupDto)
  readonly group!: StrategyGroupDto;

  @ApiProperty({
    type: [CreateTradeDto],
    description: 'Array of trades to create (min 2)',
    example: [
      { symbol: 'AAPL', strikePrice: 150, expiryDate: '2026-02-15', ... },
      { symbol: 'AAPL', strikePrice: 150, expiryDate: '2026-03-15', ... }
    ]
  })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateTradeDto)
  readonly trades!: CreateTradeDto[];
}
```

**Note:** CreateStrategyDto enables atomic creation of a trade group and all its child trades in a single transaction. This is used by the Trade Form's Strategy Builder mode (STORY-007).

#### Response DTOs (Output Transformation)

**Response DTOs use `@Expose()` decorator pattern with `excludeExtraneousValues: true`**

**TradeResponseDto:**

```typescript
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TradeType, OptionType, TradeStatus } from '@prisma/client';

export class TradeResponseDto {
  @Expose()
  @ApiProperty()
  readonly uuid!: string;

  @Expose()
  @ApiProperty()
  readonly symbol!: string;

  @Expose()
  @ApiProperty()
  readonly strikePrice!: number;

  @Expose()
  @ApiProperty()
  @Type(() => Date)
  readonly expiryDate!: Date;

  @Expose()
  @ApiProperty({ enum: TradeType })
  readonly tradeType!: TradeType;

  @Expose()
  @ApiProperty({ enum: OptionType })
  readonly optionType!: OptionType;

  @Expose()
  @ApiProperty()
  readonly quantity!: number;

  @Expose()
  @ApiProperty()
  readonly costBasis!: number;

  @Expose()
  @ApiProperty()
  readonly currentValue!: number;

  @Expose()
  @ApiProperty({ enum: TradeStatus })
  readonly status!: TradeStatus;

  @Expose()
  @ApiProperty({ required: false })
  readonly notes?: string;

  @Expose()
  @ApiProperty({ required: false })
  readonly tradeGroupUuid?: string;

  // NOTE: createdAt, updatedAt NOT exposed (removed per requirements)
}
```

**TradeGroupResponseDto:**

```typescript
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { StrategyType, TradeStatus } from '@prisma/client';
import { TradeResponseDto } from './trade-response.dto';

export class TradeGroupResponseDto {
  @Expose()
  @ApiProperty()
  readonly uuid!: string;

  @Expose()
  @ApiProperty()
  readonly name!: string;

  @Expose()
  @ApiProperty({ enum: StrategyType })
  readonly strategyType!: StrategyType;

  @Expose()
  @ApiProperty({ required: false })
  readonly notes?: string;

  // ===== DERIVED FIELDS (calculated in service) =====

  @Expose()
  @ApiProperty({ description: 'Earliest expiry date of child trades (calculated)' })
  @Type(() => Date)
  readonly closingExpiry!: Date;

  @Expose()
  @ApiProperty({ enum: TradeStatus, description: 'Derived from child trade statuses' })
  readonly status!: TradeStatus;

  @Expose()
  @ApiProperty({ description: 'Sum of child trade cost basis (calculated)' })
  readonly totalCostBasis!: number;

  @Expose()
  @ApiProperty({ description: 'Sum of child trade current values (calculated)' })
  readonly totalCurrentValue!: number;

  @Expose()
  @ApiProperty({ description: 'Profit/Loss (calculated)' })
  readonly profitLoss!: number;

  @Expose()
  @ApiProperty({ type: [TradeResponseDto] })
  @Type(() => TradeResponseDto)
  readonly trades!: TradeResponseDto[];

  // NOTE: createdAt, updatedAt NOT exposed
}
```

### Controller Pattern with plainToInstance

**Example: TradesController**

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ItemType, TradeStatus } from '@prisma/client';
import { TradesService } from '../services/trades.service';
import { CreateTradeDto, UpdateTradeDto } from '../dto/request';
import { TradeResponseDto, PortfolioItemDto } from '../dto/response';
import { DataResponseDto } from '@/common/dto';

@ApiTags('Trades')
@Controller({ path: 'trades', version: '1' })
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Get()
  @ApiOperation({ summary: 'List trades (optionally include groups)' })
  @ApiQuery({ name: 'include', required: false, enum: ['groups'] })
  @ApiQuery({ name: 'status', required: false, enum: TradeStatus })
  async findMany(
    @Query('include') include?: 'groups',
    @Query('status') status?: TradeStatus
  ): Promise<DataResponseDto<PortfolioItemDto[] | TradeResponseDto[]>> {
    if (include === 'groups') {
      // Return mixed groups + ungrouped trades
      const items = await this.tradesService.findManyPortfolioItems({ status });
      return { data: items };
    }

    // Return only ungrouped trades
    const trades = await this.tradesService.findMany({ status });
    return {
      data: trades.map((trade) => ({
        itemType: ItemType.TRADE,
        ...plainToInstance(TradeResponseDto, trade),
      })),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new trade' })
  @ApiResponse({ status: 201 })
  async create(@Body() createTradeDto: CreateTradeDto): Promise<DataResponseDto<TradeResponseDto>> {
    const trade = await this.tradesService.create(createTradeDto);

    return {
      data: plainToInstance(TradeResponseDto, trade),
    };
  }

  // ... other endpoints
}
```

**Key Pattern:**

1. Service returns Prisma entity (plain object)
2. Controller transforms via `plainToInstance(ResponseDto, entity)`
3. ClassSerializerInterceptor strips non-`@Expose()` fields
4. Response wrapped in `DataResponseDto<T>`

### HTTP Status Codes

| Operation      | Success Code | Error Codes                         |
| -------------- | ------------ | ----------------------------------- |
| GET (list)     | 200 OK       | 500 Internal Server Error           |
| GET (single)   | 200 OK       | 404 Not Found, 500                  |
| POST (create)  | 201 Created  | 400 Bad Request, 500                |
| PATCH (update) | 200 OK       | 400 Bad Request, 404 Not Found, 500 |
| DELETE         | 200 OK       | 404 Not Found, 500                  |

### Error Response Format

**NestJS default error format:**

```json
{
  "statusCode": 400,
  "message": ["symbol should not be empty", "quantity must be a positive number"],
  "error": "Bad Request"
}
```

**404 Not Found:**

```json
{
  "statusCode": 404,
  "message": "Trade with UUID '...' not found",
  "error": "Not Found"
}
```

### Swagger Documentation

**Base Configuration:**

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('TradeLog API')
  .setDescription('Options trading portfolio management API')
  .setVersion('1.0')
  .addTag('Trades', 'Trade management endpoints')
  .addTag('Groups', 'Group management endpoints')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Endpoints:**

- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs-json`

**Auto-generated from:**

- `@ApiTags()` - Groups endpoints
- `@ApiOperation()` - Endpoint descriptions
- `@ApiProperty()` - DTO field documentation
- `@ApiResponse()` - Response types

**Frontend type generation:**

```bash
pnpm web:generate
# Runs: openapi-typescript http://localhost:3000/api/docs-json -o web/src/types/api.types.ts
```

---

## Part 7: NFR Coverage

This section maps each Non-Functional Requirement to architectural decisions.

### NFR-001: Performance Requirements

**Requirements:**

- Dashboard loads in <2 seconds
- Trade list renders in <1 second
- Form submissions respond in <500ms

**Architectural Solutions:**

| Decision                                | How It Addresses NFR-001                                                                                             |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **PostgreSQL Indexes**                  | Indexes on `tradeGroupUuid`, `expiryDate`, `status`, `symbol` enable fast filtering and sorting                           |
| **TanStack Query (React Query)**        | Client-side caching reduces redundant API calls, optimistic updates improve perceived performance                    |
| **Compression Middleware**              | Gzip/deflate reduces payload size, faster network transfer for trade lists                                           |
| **Derived Fields Calculated On-Demand** | No stale data, always fresh; trade-off: slight calculation overhead (~50ms for 100 groups) acceptable for <2s budget |
| **Efficient Prisma Queries**            | Single query with `include: { trades: true }` for groups (no N+1 problem)                                            |
| **React Hook Form**                     | Minimal re-renders, uncontrolled inputs improve form responsiveness                                                  |
| **Vite HMR**                            | Fast development feedback loop ensures performance testing is practical                                              |

**Performance Budget:**

- Database query: ~200ms (indexed queries)
- Business logic (derive status, calculate metrics): ~100ms
- Network transfer (compressed): ~100ms
- React rendering: ~500ms
- **Total: ~900ms** (well under 2s budget)

### NFR-002: Usability

**Requirements:**

- Intuitive interface
- Minimal learning curve

**Architectural Solutions:**

| Decision                          | How It Addresses NFR-002                                                     |
| --------------------------------- | ---------------------------------------------------------------------------- |
| **shadcn/ui Components**          | Accessible, well-documented components follow UX best practices              |
| **React Hook Form**               | Clear error messages, inline validation improves user feedback               |
| **Consistent API Response Shape** | `DataResponseDto<T>` wrapper makes frontend consumption predictable          |
| **Suggested Group Names**         | System suggests `"{Strategy} {Expiry}"` format reduces cognitive load        |
| **Unified Portfolio View**        | Single endpoint (`GET /v1/trades?include=groups`) simplifies dashboard logic |
| **ItemType Discriminator**        | Clear type discrimination (group vs trade) for frontend rendering logic      |

### NFR-003: Responsive Design

**Requirements:**

- Desktop (1920x1080+)
- Tablet (768-1024px)
- Mobile (375-768px)

**Architectural Solutions:**

| Decision                         | How It Addresses NFR-003                                     |
| -------------------------------- | ------------------------------------------------------------ |
| **shadcn/ui**                    | Built-in responsive variants, mobile-first design patterns   |
| **React Component Architecture** | Component-based UI allows viewport-specific rendering        |
| **Vite**                         | Fast builds enable rapid responsive testing across viewports |

### NFR-004: Data Integrity

**Requirements:**

- Trade operations are transactional
- Group status automatically derived from child trades
- No inconsistent data states

**Architectural Solutions:**

| Decision                            | How It Addresses NFR-004                                                                       |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Prisma Transactions**             | All multi-table operations wrapped in `$transaction` (ACID guarantees)                         |
| **Foreign Key Constraints**         | `trades.tradeGroupUuid → groups.uuid ON DELETE SET NULL` enforces referential integrity at DB level |
| **Derived Group Status**            | Never stored, always calculated from child trades (single source of truth)                     |
| **Validation Pipeline**             | Frontend (Zod) → Backend (class-validator) → Database (constraints) triple validation          |
| **Business Logic in Service Layer** | Group integrity rules (2+ trades) enforced in `TradeGroupsService`                                  |
| **ClassSerializerInterceptor**      | `excludeExtraneousValues: true` prevents accidental data leaks                                 |

### NFR-005: Code Quality

**Requirements:**

- TypeScript strict mode
- Swagger/OpenAPI documentation
- Generated types for frontend
- ESLint + Prettier

**Architectural Solutions:**

| Decision                             | How It Addresses NFR-005                                              |
| ------------------------------------ | --------------------------------------------------------------------- |
| **TypeScript Strict Mode**           | Compile-time type checking, no implicit `any`, null safety            |
| **Prisma Schema as Source of Truth** | Database types → Generated TypeScript types (`@prisma/client`)        |
| **@nestjs/swagger**                  | Auto-generates OpenAPI spec from decorators, always in sync with code |
| **openapi-typescript**               | Generates frontend types from Swagger spec, end-to-end type safety    |
| **Barrel Exports (`index.ts`)**      | Clean import paths, encapsulation, easier refactoring                 |
| **Readonly Interfaces**              | Immutability by default, prevents accidental mutations                |
| **No Entity Wrappers**               | Use Prisma types directly, avoid duplication and drift                |
| **ESLint + Prettier**                | Consistent code style, catch common errors                            |
| **DDD Module Structure**             | Clear domain boundaries (`trades/` module), organized codebase        |
| **plainToInstance Pattern**          | Explicit transformation points, easy to debug                         |

### NFR-006: Scalability

**Requirements:**

- Handle 500+ trades
- Handle 100+ groups
- Maintain performance under load

**Architectural Solutions:**

| Decision                   | How It Addresses NFR-006                                           |
| -------------------------- | ------------------------------------------------------------------ |
| **Database Indexes**       | O(log n) lookups instead of O(n) table scans                       |
| **PostgreSQL**             | Proven scalability, handles millions of rows efficiently           |
| **Efficient Queries**      | Single query with joins (`include: { trades: true }`) avoids N+1   |
| **Pagination Ready**       | Architecture supports adding `?limit=50&offset=100` later          |
| **Stateless Backend**      | NestJS services are stateless, easy to scale horizontally (future) |
| **TanStack Query Caching** | Reduces backend load through intelligent client-side caching       |

### NFR-007: Local Development Reliability

**Requirements:**

- Docker Compose single-command startup
- Consistent environment across developers

**Architectural Solutions:**

| Decision                  | How It Addresses NFR-007                                     |
| ------------------------- | ------------------------------------------------------------ |
| **Docker Compose**        | `docker-compose up` starts all services (web, api, postgres) |
| **Node 24 Alpine Images** | Lightweight (~120MB), fast builds, secure                    |
| **Volume Mounts**         | Hot reload for both web (Vite) and api (NestJS watch mode)   |
| **Environment Variables** | `.env` files for configuration, easily customizable          |
| **pnpm Workspaces**       | Monorepo dependency management, single `pnpm install`        |
| **Prisma Migrations**     | `prisma migrate dev` ensures DB schema always matches code   |
| **PostgreSQL Container**  | Isolated database, no conflicts with other projects          |

### NFR-008: Security

**Requirements:**

- Input validation
- No SQL injection
- Basic security best practices
- **No authentication required** (localhost single-user)

**Architectural Solutions:**

| Decision                                                   | How It Addresses NFR-008                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Prisma ORM**                                             | Parameterized queries, prevents SQL injection by design                  |
| **ValidationPipe (`whitelist: true`)**                     | Strips unexpected properties from requests, prevents parameter pollution |
| **ClassSerializerInterceptor (`excludeExtraneousValues`)** | Only exposes `@Expose()` decorated fields, prevents data leaks           |
| **TypeScript Strict Mode**                                 | Prevents common vulnerabilities (type coercion, null dereference)        |
| **CORS Configuration**                                     | Restricts origins (only `localhost:5173` can call API)                   |
| **UUID Primary Keys**                                      | No ID enumeration attacks (vs. auto-increment integers)                  |

---

## Part 8: Security Architecture

**Context:** Localhost MVP for single user. Minimal security requirements, focus on development best practices.

### Security Threat Model

**In Scope (Addressed):**

- ✅ SQL Injection
- ✅ Parameter Pollution
- ✅ Data Leakage (exposing internal fields)
- ✅ Type Coercion Vulnerabilities
- ✅ Cross-Origin Requests (limited)

**Out of Scope (Deferred Post-MVP):**

- ❌ Authentication/Authorization (single user, trusted environment)
- ❌ Encryption (HTTPS/TLS) - localhost only
- ❌ Rate Limiting - single user
- ❌ CSRF Protection - same-origin requests
- ❌ Session Management - no sessions
- ❌ XSS Protection - standard React escaping sufficient

### Input Validation Strategy

**Three-Layer Validation (Defense in Depth):**

**Layer 1: Frontend Validation (Zod)**

- Purpose: User experience, immediate feedback
- **NOT a security boundary** (client-side, can be bypassed)

**Layer 2: Backend DTO Validation (class-validator)**

- Purpose: Security, type safety
- **Enforced by:** Global ValidationPipe in `main.ts`
- **This is the security boundary**

**Layer 3: Database Constraints (PostgreSQL)**

- Purpose: Final enforcement, data integrity
- **Cannot be bypassed** by application logic errors

### SQL Injection Prevention

**Primary Defense: Prisma ORM**

All database queries are parameterized by design:

```typescript
// ✅ SAFE - Prisma parameterizes automatically
await prisma.trade.findMany({
  where: { symbol: userInput }, // Parameterized, not string concatenation
});

// ✅ Even raw queries are parameterized with Prisma
await prisma.$queryRaw`SELECT * FROM trades WHERE symbol = ${userInput}`;
// Prisma converts to: SELECT * FROM trades WHERE symbol = $1
```

**No string concatenation in queries** - Prisma handles parameterization.

### Data Exposure Control

**ClassSerializerInterceptor Pattern:**

```typescript
// main.ts
app.useGlobalInterceptors(
  new ClassSerializerInterceptor(app.get(Reflector), {
    excludeExtraneousValues: true, // 🔒 Only expose @Expose() fields
  })
);
```

**Response DTOs whitelist fields:**

- Only fields with `@Expose()` decorator are included in response
- Prevents accidental exposure of Prisma internal fields
- Prevents exposure of createdAt/updatedAt (removed per requirements)

### Request Sanitization

**Global ValidationPipe Configuration:**

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // 🔒 Strip properties not in DTO
    forbidNonWhitelisted: false,
    transform: true,
  })
);
```

**Example - Parameter Pollution Prevention:**

```json
// Request body
{
  "symbol": "AAPL",
  "strikePrice": 150,
  "maliciousField": "DROP TABLE trades;"  // ⚠️ Attack attempt
}

// After ValidationPipe (whitelist: true)
{
  "symbol": "AAPL",
  "strikePrice": 150
  // maliciousField stripped automatically
}
```

### CORS Configuration

```typescript
// main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // 🔒 Only frontend
  credentials: false,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
});
```

### Primary Key Security

**UUID vs. Auto-Increment:**

```typescript
// ✅ UUIDs prevent enumeration attacks
uuid: "a3bb189e-8bf9-3888-9912-ace4e6543002"

// ❌ Auto-increment exposes counts and allows enumeration
id: 1, 2, 3, 4...
// Attacker can: GET /trades/1, GET /trades/2, etc.
```

### Security Backlog (Post-MVP Enhancements)

**⚠️ IMPORTANT: Required before production deployment.**

#### Priority 1: Required for Production

| Item                 | Description                                         | Estimated Effort |
| -------------------- | --------------------------------------------------- | ---------------- |
| **Authentication**   | User login/registration (JWT with @nestjs/passport) | 2-3 stories      |
| **HTTPS/TLS**        | nginx reverse proxy + Let's Encrypt                 | 1 story          |
| **Authorization**    | Role-based access control (if multi-user)           | 2 stories        |
| **Rate Limiting**    | @nestjs/throttler, Redis-backed                     | 1 story          |
| **Security Headers** | Helmet.js integration                               | 0.5 story        |

#### Priority 2: Recommended Enhancements

| Item                   | Description                  | Estimated Effort |
| ---------------------- | ---------------------------- | ---------------- |
| **CSRF Protection**    | csurf middleware             | 1 story          |
| **API Key Management** | Vault, AWS Secrets Manager   | 1 story          |
| **Audit Logging**      | Track all data modifications | 1-2 stories      |
| **Input Sanitization** | DOMPurify for notes fields   | 0.5 story        |
| **Session Management** | Redis session store          | 1 story          |

#### Priority 3: Nice to Have

| Item                    | Description                | Estimated Effort   |
| ----------------------- | -------------------------- | ------------------ |
| **2FA**                 | TOTP via speakeasy library | 2 stories          |
| **Encryption at Rest**  | PostgreSQL pgcrypto        | 1 story            |
| **Security Monitoring** | Sentry, CloudWatch         | 1-2 stories        |
| **Penetration Testing** | Third-party audit          | External           |
| **WAF**                 | Cloudflare, AWS WAF        | 0.5 story (config) |

---

## Part 9: Scalability & Performance

**Target Requirements:**

- Dashboard load: <2 seconds
- Trade list render: <1 second
- Form submission: <500ms
- Support: 500+ trades, 100+ groups

### Database Performance Optimization

#### Index Strategy

**Trades Table Indexes:**

```sql
CREATE INDEX idx_trades_group_uuid ON trades(tradeGroupUuid);
CREATE INDEX idx_trades_expiry_date ON trades(expiryDate);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_symbol ON trades(symbol);
```

**Groups Table Indexes:**

```sql
CREATE INDEX idx_groups_strategy_type ON groups(strategyType);
```

**Performance Impact:**

| Query                | Without Index | With Index | Improvement |
| -------------------- | ------------- | ---------- | ----------- |
| Find all open trades | ~50ms         | ~5ms       | 10x         |
| Trades by group      | ~30ms         | ~2ms       | 15x         |
| Sort by expiry       | ~40ms         | ~8ms       | 5x          |

#### Query Optimization

**Avoid N+1 Problem:**

```typescript
// ✅ GOOD - Single query with join
const groups = await prisma.group.findMany({
  include: { trades: true }, // Single JOIN query
});
// Total: 1 query, ~50ms
```

**Query Performance Benchmarks (500 trades, 100 groups):**

| Operation                          | Query Time |
| ---------------------------------- | ---------- |
| Get all groups with trades (eager) | ~80ms      |
| Get ungrouped trades               | ~20ms      |
| Get single trade by UUID           | ~2ms       |
| Create trade                       | ~10ms      |
| Update trade                       | ~8ms       |
| Delete trade with group check      | ~25ms      |

### Caching Strategy

#### Client-Side Caching (TanStack Query)

**Default Configuration:**

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // Data fresh for 30s
      cacheTime: 300000, // Keep in cache for 5min
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});
```

**Cache Performance Impact:**

| Scenario              | Without Cache | With Cache | Improvement |
| --------------------- | ------------- | ---------- | ----------- |
| Return to dashboard   | 800ms         | 50ms       | 16x faster  |
| Navigate back/forward | 800ms         | 0ms        | Instant     |

### Backend Performance

#### Response Compression

```typescript
// main.ts
app.use(
  compression({
    threshold: 1024,
    level: 6,
  })
);
```

**Compression Impact:**

| Response Type         | Uncompressed | Compressed | Reduction |
| --------------------- | ------------ | ---------- | --------- |
| 100 trades list       | 45KB         | 12KB       | 73%       |
| 50 groups with trades | 120KB        | 28KB       | 77%       |

### Performance Budget Breakdown

**Dashboard Load (<2s budget):**

```
Database Query:          80ms
Business Logic:          50ms
Response Serialization:  30ms
Network Transfer:        20ms
Frontend Parsing:        30ms
React Rendering:         400ms
Browser Paint:           100ms
─────────────────────────────
TOTAL:                   710ms ✅
BUFFER:                  1290ms (65%)
```

### Scalability Limits & Breakpoints

**Current Architecture Supports:**

| Resource         | MVP Target | Comfortable Limit | Breaking Point                |
| ---------------- | ---------- | ----------------- | ----------------------------- |
| Trades           | 500        | 2,000             | ~5,000 (need pagination)      |
| Groups           | 100        | 500               | ~1,000 (need pagination)      |
| Concurrent Users | 1          | 10                | ~50 (need connection pooling) |

### Performance & Scalability Backlog (Future Enhancements)

#### Trigger-Based Implementation

| Enhancement                      | Trigger Condition               | Priority | Estimated Effort |
| -------------------------------- | ------------------------------- | -------- | ---------------- |
| **Pagination**                   | >1,000 trades or >500 groups    | High     | 1 story          |
| **Virtual Scrolling**            | List rendering >1s (>300 items) | High     | 1 story          |
| **Database Connection Pooling**  | >10 concurrent users            | High     | 0.5 story        |
| **Redis Caching Layer**          | >50 concurrent users            | Medium   | 2 stories        |
| **Database Partitioning**        | Database >1GB                   | Medium   | 2-3 stories      |
| **CDN for Static Assets**        | Production deployment           | Medium   | 0.5 story        |
| **Query Performance Monitoring** | Production deployment           | Medium   | 1 story          |

---

## Part 10: Reliability & Availability

**Context:** Localhost MVP for single user. High availability not critical, but data integrity and error recovery are essential.

### Availability Targets

**MVP (Localhost):**

- Target Uptime: N/A (user controls start/stop)
- Recovery Time Objective (RTO): `docker-compose up` (~30 seconds)
- Recovery Point Objective (RPO): Last database commit (PostgreSQL ACID)

### Data Reliability

#### ACID Guarantees (PostgreSQL)

- **Atomicity:** All operations in transaction succeed or all fail
- **Consistency:** Foreign key constraints, check constraints enforced
- **Isolation:** Default level READ COMMITTED
- **Durability:** PostgreSQL WAL ensures committed data survives crashes

#### Data Persistence Strategy

**Docker Volume Configuration:**

- PostgreSQL data stored in named volume `postgres-data`
- Survives `docker-compose down` (not `docker-compose down -v`)
- Manual backup via scripts

### Error Handling

**Global Exception Filter** handles all errors consistently.

**Prisma Error Handling:**

| Prisma Error Code | Meaning                       | HTTP Status     | Action                |
| ----------------- | ----------------------------- | --------------- | --------------------- |
| P2002             | Unique constraint failed      | 409 Conflict    | Return conflict error |
| P2003             | Foreign key constraint failed | 400 Bad Request | Validate input        |
| P2025             | Record not found              | 404 Not Found   | Return not found      |

**Frontend Error Handling:**

- React Error Boundaries catch rendering errors
- TanStack Query retry logic for network failures
- Graceful degradation (show cached data if refetch fails)

### Database Backup & Recovery

**Manual Backup Scripts:**

```bash
# Backup
./scripts/backup-db.sh

# Restore
./scripts/restore-db.sh ./backups/tradelog_20250131_120000.sql.gz
```

### Health Checks

**Health Check Endpoint:**

```typescript
@Get('/v1/health')
@HealthCheck()
check() {
  return this.health.check([
    () => this.prisma.pingCheck('database'),
  ]);
}
```

### Failure Scenarios & Recovery

| Failure Scenario          | Impact                      | Recovery                               |
| ------------------------- | --------------------------- | -------------------------------------- |
| **Database crash**        | Data loss since last commit | Restart container, data persists (WAL) |
| **Backend crash**         | API unavailable             | `docker-compose restart api` (~5s)     |
| **Frontend crash**        | UI unresponsive             | Browser refresh                        |
| **Docker volume deleted** | Total data loss             | Restore from backup                    |

### Reliability & Availability Backlog (Future Enhancements)

| Enhancement                 | Trigger               | Priority | Estimated Effort |
| --------------------------- | --------------------- | -------- | ---------------- |
| **Automated DB Backups**    | Production deployment | Critical | 0.5 story        |
| **Database Replication**    | Production deployment | High     | 2 stories        |
| **Uptime Monitoring**       | Production deployment | High     | 0.5 story        |
| **Error Tracking (Sentry)** | Production deployment | High     | 1 story          |
| **Log Aggregation**         | Production deployment | Medium   | 1-2 stories      |

---

## Part 11: Development & Deployment

**Goal:** Single-command setup for reliable local development (NFR-007)

### Development Environment Setup

#### Prerequisites

- Node.js 24 LTS
- Docker Desktop
- pnpm 9+
- Git

#### Initial Setup

**1. Clone Repository:**

```bash
git clone https://github.com/user/tradelog.git
cd tradelog
```

**2. Install Dependencies:**

```bash
pnpm install
```

**3. Environment Configuration:**

```bash
cp api/.env.example api/.env
cp web/.env.example web/.env
```

**4. Start Services:**

```bash
docker-compose up
```

**5. Run Migrations:**

```bash
cd api
pnpm prisma migrate dev
```

### Monorepo Structure

```
tradelog/
├── web/                       # React frontend
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── .env
├── api/                       # NestJS backend
│   ├── src/
│   │   ├── trades/
│   │   ├── common/
│   │   ├── prisma/
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── test/
│   │   └── e2e/
│   ├── package.json
│   └── .env
├── packages/
│   └── shared/
├── scripts/
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

### pnpm Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'web'
  - 'api'
  - 'packages/*'
```

### Docker Configuration

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  web:
    build: ./web
    ports: ['5173:5173']
    volumes: ['./web:/app', '/app/node_modules']
    environment: ['VITE_API_URL=http://localhost:3000/v1']
    depends_on: [api]

  api:
    build: ./api
    ports: ['3000:3000']
    volumes: ['./api:/app', '/app/node_modules']
    environment: ['DATABASE_URL=postgresql://postgres:password@postgres:5432/tradelog']
    depends_on: [postgres]

  postgres:
    image: postgres:15-alpine
    ports: ['5432:5432']
    environment: ['POSTGRES_DB=tradelog']
    volumes: ['postgres-data:/var/lib/postgresql/data']
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s

volumes:
  postgres-data:
```

### Backend Application Configuration (main.ts)

**Complete main.ts with all global configurations:**

```typescript
import { NestFactory, Reflector } from '@nestjs/core';
import { VersioningType, ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ===== VERSIONING =====
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ===== CORS =====
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: false,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  // ===== GLOBAL VALIDATION PIPE =====
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    })
  );

  // ===== GLOBAL SERIALIZATION INTERCEPTOR =====
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    })
  );

  // ===== COMPRESSION =====
  app.use(
    compression({
      threshold: 1024,
      level: 6,
    })
  );

  // ===== SWAGGER DOCUMENTATION =====
  const config = new DocumentBuilder()
    .setTitle('TradeLog API')
    .setDescription('Options trading portfolio management API')
    .setVersion('1.0')
    .addTag('Trades', 'Trade management endpoints')
    .addTag('Groups', 'Group management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ===== GRACEFUL SHUTDOWN =====
  app.enableShutdownHooks();

  // ===== START SERVER =====
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Backend running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);

  // ===== SHUTDOWN HANDLERS =====
  process.on('SIGTERM', async () => {
    await app.close();
    process.exit(0);
  });
}

bootstrap();
```

### Database Migrations Workflow

**Creating Migrations:**

```bash
cd api
pnpm prisma migrate dev --name add_new_field
```

**Applying Migrations (Production):**

```bash
pnpm prisma migrate deploy
```

### Type Generation Workflow

**1. Generate Prisma types:**

```bash
cd api
pnpm prisma generate
```

**2. Generate frontend types from Swagger:**

```bash
pnpm web:generate
# Generates: web/src/types/api.types.ts
```

### Build Process

**Development Build:**

```bash
pnpm build  # Builds both api and web
```

**Production Dockerfiles:**

- Node 24 Alpine base images
- Multi-stage builds for optimization
- nginx for frontend static serving

### Testing Strategy

**E2E Tests Only (NestJS):**

```typescript
// api/test/e2e/trades.e2e-spec.ts
describe('Trades E2E', () => {
  it('should create a new trade', () => {
    return request(app.getHttpServer())
      .post('/v1/trades')
      .send({
        /* trade data */
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.status).toBe('OPEN'); // Default status
      });
  });
});
```

**Run Tests:**

```bash
pnpm api:test:e2e
```

---

## Part 12: Traceability & Trade-offs

### Requirements Traceability Matrix

**Functional Requirements → Architectural Components**

| FR     | Requirement                                    | Primary Components                                           |
| ------ | ---------------------------------------------- | ------------------------------------------------------------ |
| FR-000 | Project setup with Swagger/OpenAPI             | Docker, @nestjs/swagger, openapi-typescript                  |
| FR-001 | Create individual trade                        | TradesController, TradesService, Prisma                      |
| FR-002 | Create trade group                             | TradeGroupsController, TradeGroupsService, Prisma                      |
| FR-003 | View all trades and groups (unified dashboard) | TradesController (`?include=groups`), ItemType discriminator |
| FR-004 | View individual trade details                  | TradesController.findByUuid()                                |
| FR-005 | View individual group details                  | TradeGroupsController.findByUuid(), derived fields                |
| FR-006 | Edit existing trade                            | TradesController.update()                                    |
| FR-007 | Track trade status                             | TradeStatus enum, TradeGroupsService (derived status)             |
| FR-008 | Add trades to group                            | TradeGroupsController, Prisma transactions                        |
| FR-009 | Remove trades from group                       | TradeGroupsController, TradeGroupsService (integrity check)            |
| FR-010 | Delete trades                                  | TradesController.deleteByUuid()                              |
| FR-011 | Automated P&L calculation                      | TradeGroupsService, derived fields                                |
| FR-012 | Add notes                                      | Trade.notes, Group.notes                                     |
| FR-013 | Filter trades                                  | Query params, PostgreSQL indexes                             |
| FR-014 | Sort by expiry                                 | PostgreSQL indexes, orderBy                                  |
| FR-015 | Distinguish trade types                        | TradeType, OptionType enums                                  |

### Key Architectural Trade-offs

#### 1. Derived Fields vs. Stored Fields

**Decision:** Calculate on-demand, do NOT store

| Approach                  | Pros                                        | Cons                                  |
| ------------------------- | ------------------------------------------- | ------------------------------------- |
| **Store** (Rejected)      | ✓ Faster (~80ms saved)                      | ✗ Consistency risk, update complexity |
| **Calculate** (✅ Chosen) | ✓ Always consistent, single source of truth | ✗ Slight cost (~100ms)                |

**Justification:** Consistency > 80ms performance gain

#### 2. Layered Monolith vs. Microservices

**Decision:** Layered Monolith

| Approach                     | Pros                                     | Cons                                      |
| ---------------------------- | ---------------------------------------- | ----------------------------------------- |
| **Microservices** (Rejected) | ✓ Independent scaling                    | ✗ Overkill for 1 user, complex deployment |
| **Monolith** (✅ Chosen)     | ✓ Simple, ACID transactions, low latency | ✗ Cannot scale independently              |

**Justification:** Single user, localhost, 2-day MVP timeline

#### 3. UUID vs. Auto-increment IDs

**Decision:** UUIDs

**Justification:**

- Security: No ID enumeration
- Future-proof: Supports replication
- Storage overhead negligible

#### 4. Pagination from Day 1 vs. Deferred

**Decision:** Defer pagination

**Trigger:** Implement when trade count >1,000 or render time >1s

#### 5. API Versioning from Day 1

**Decision:** Implement URI versioning (`/v1`)

**Justification:** Near-zero overhead, future-proof, industry best practice

#### 6. Single Domain vs. Separate Domains

**Decision:** Single "Trades" domain (Groups as aggregates)

**Justification:** Groups ARE composed of trades (tight coupling)

#### 7. Frontend Type Generation

**Decision:** Generate from Swagger

**Justification:** Single source of truth, auto-sync, prevents drift

#### 8. Docker for Local Development

**Decision:** Docker Compose

**Justification:** NFR-007 requirement, environment parity

#### 9. Testing Strategy

**Decision:** E2E tests only for MVP

**Justification:** High ROI, tests full flows, 2-day timeline

#### 10. Exclude createdAt/updatedAt

**Decision:** Do NOT expose to frontend

**Justification:** Not needed for MVP features, can add later

### Decision Log (ADRs)

1. **ADR-001:** Layered Monolith over Microservices
2. **ADR-002:** Derive Group Metrics On-Demand
3. **ADR-003:** UUIDs for Primary Keys
4. **ADR-004:** Generate Frontend Types from Swagger
5. **ADR-005:** Docker for Local Development
6. **ADR-006:** Defer Pagination to Post-MVP
7. **ADR-007:** API Versioning from Day 1
8. **ADR-008:** Single "Trades" Domain

### Risks & Mitigation

| Risk                             | Likelihood | Impact   | Mitigation                         |
| -------------------------------- | ---------- | -------- | ---------------------------------- |
| Database grows >1GB              | Low        | Medium   | Pagination, partitioning (backlog) |
| Performance degrades >500 trades | Medium     | High     | Monitor, implement backlog items   |
| Data loss                        | Low        | Critical | Regular backups                    |
| Stale frontend types             | Medium     | Low      | Run type:generate after changes    |

---

## Appendices

### Appendix A: Glossary

- **BMAD Method:** Structured development workflow (Brainstorm, Model, Architect, Develop)
- **DDD:** Domain-Driven Design
- **DTO:** Data Transfer Object
- **NFR:** Non-Functional Requirement
- **FR:** Functional Requirement
- **MVP:** Minimum Viable Product
- **P&L:** Profit & Loss
- **ACID:** Atomicity, Consistency, Isolation, Durability

### Appendix B: References

- **Product Brief:** `docs/product-brief-tradelog-2025-12-31.md`
- **PRD:** `docs/prd-tradelog-2025-12-31.md`
- **NestJS Documentation:** https://docs.nestjs.com
- **Prisma Documentation:** https://www.prisma.io/docs
- **React Documentation:** https://react.dev

### Appendix C: Next Steps

After architecture approval:

1. **Sprint Planning** - Break down 3 epics into implementable stories
2. **Environment Setup** - Initialize monorepo, Docker, Prisma
3. **Scaffold Projects** - Generate NestJS and React apps
4. **Implement Stories** - Follow sprint plan
5. **E2E Testing** - Write tests for critical flows
6. **Review & Deploy** - User acceptance, localhost deployment

---

**End of Architecture Document**

**Approval Required:** Yes
**Next Phase:** Phase 4 - Sprint Planning (`/sprint-planning`)
