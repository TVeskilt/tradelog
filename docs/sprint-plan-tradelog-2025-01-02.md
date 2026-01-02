# Sprint Plan: TradeLog MVP

# Custom Options Trading Portfolio Manager

**Document Version**: 1.0
**Generated**: 2025-01-02
**Project**: TradeLog
**Project Level**: 2 (5-15 stories)
**Planning Horizon**: 3 sprints (6 weeks)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Team Composition & Capacity](#team-composition--capacity)
3. [Story Inventory](#story-inventory)
4. [Sprint Breakdown](#sprint-breakdown)
5. [Traceability Matrices](#traceability-matrices)
6. [Dependencies & Critical Path](#dependencies--critical-path)
7. [Risk Register](#risk-register)
8. [Definition of Done](#definition-of-done)
9. [Success Metrics](#success-metrics)

---

## Executive Summary

### Overview

This sprint plan outlines the implementation roadmap for TradeLog MVP, a custom options trading portfolio management application designed to replace Interactive Brokers' interface with unlimited leg grouping capabilities and rapid portfolio overview.

### Scope

- **Total Stories**: 12
- **Total Story Points**: 61
- **Sprints**: 3 (2-week sprints)
- **Timeline**: 6 weeks
- **Team**: 1 senior developer (part-time)

### Key Objectives

1. **Sprint 1**: Establish monorepo infrastructure and core backend API
2. **Sprint 2**: Complete backend and build primary user interfaces
3. **Sprint 3**: Deliver dashboard, management UI, and MVP completion

### Success Criteria

- All 15 functional requirements covered
- 1-2 minute Friday portfolio overview achievable
- Unlimited leg grouping supported
- Local Docker development environment operational
- E2E test coverage for backend APIs

---

## Team Composition & Capacity

### Team Structure

| Role                 | Name | Skill Level | Availability | Hours/Week |
| -------------------- | ---- | ----------- | ------------ | ---------- |
| Full-Stack Developer | Solo | Senior      | Part-time    | ~20 hours  |

### Sprint Capacity Calculation

- **Sprint Duration**: 2 weeks
- **Working Hours per Sprint**: ~40 hours
- **Senior Efficiency**: ~1 story point = 2 hours
- **Sprint Capacity**: ~20 story points

### Capacity Allocation

| Sprint    | Target Points | Actual Points | Variance                           |
| --------- | ------------- | ------------- | ---------------------------------- |
| Sprint 1  | 20            | 21            | +1 (acceptable, foundational work) |
| Sprint 2  | 20            | 21            | +1 (acceptable, core features)     |
| Sprint 3  | 20            | 19            | -1 (buffer for polish)             |
| **Total** | **60**        | **61**        | **+1**                             |

### Assumptions

- No holidays or planned absences
- Part-time availability consistent (~20 hours/week)
- Senior developer familiar with React, NestJS, TypeScript
- No blockers requiring external dependencies

---

## Story Inventory

### EPIC-001: Project Infrastructure & Setup (13 points)

#### STORY-001: Monorepo Setup with pnpm Workspaces

**Story Points**: 3
**Sprint**: 1
**Priority**: Critical

**Description**:
Set up monorepo structure using pnpm workspaces with web (React frontend) and api (NestJS backend) at project root.

**Acceptance Criteria**:

- ✅ pnpm workspace configured with web/ and api/ folders at root
- ✅ Shared packages/shared folder for common TypeScript code
- ✅ TypeScript strict mode enabled in all packages
- ✅ ESLint and Prettier configured with consistent rules
- ✅ package.json scripts for dev, build, lint
- ✅ All packages install and build successfully

**Technical Notes**:

- Use pnpm 9+
- Configure workspace protocol for internal dependencies
- Set up barrel exports (index.ts) throughout

**Requirements Coverage**: FR-000

---

#### STORY-002: Docker Compose Development Environment

**Story Points**: 5
**Sprint**: 1
**Priority**: Critical

**Description**:
Create Docker Compose setup for local development with PostgreSQL database and NestJS backend.

**Acceptance Criteria**:

- ✅ docker-compose.yml with PostgreSQL 15 service
- ✅ Backend service using Node 24 Alpine image
- ✅ Volume mounts for hot-reloading in development
- ✅ Environment variables via .env file
- ✅ Health checks for database and backend
- ✅ Documentation for docker-compose up workflow
- ✅ Seed script for development data

**Technical Notes**:

- PostgreSQL port: 5432
- Backend port: 3000
- Use named volumes for database persistence
- .env.example template for configuration

**Requirements Coverage**: FR-000

---

#### STORY-003: Prisma ORM Setup & Database Schema

**Story Points**: 5
**Sprint**: 1
**Priority**: Critical

**Description**:
Configure Prisma ORM with complete schema for Trade and Group models.

**Acceptance Criteria**:

- ✅ Prisma configured with PostgreSQL provider
- ✅ Trade model with all fields (uuid, symbol, strikePrice, expiryDate, tradeType, optionType, quantity, costBasis, currentValue, status, notes, groupUuid, timestamps)
- ✅ Group model with all fields (uuid, name, strategyType, notes, timestamps)
- ✅ Enums: TradeType (BUY, SELL), OptionType (CALL, PUT), TradeStatus (OPEN, CLOSING_SOON, CLOSED), StrategyType (CALENDAR_SPREAD, RATIO_CALENDAR_SPREAD, CUSTOM)
- ✅ 1:N relationship (Group → Trades) with ON DELETE SET NULL
- ✅ UUID primary keys on all models
- ✅ Prisma Client generated and accessible
- ✅ Initial migration created and applied
- ✅ Seed script with sample data (2 groups, 6 trades)

**Technical Notes**:

- Use Decimal type for monetary values (precision 10, scale 2)
- Date type for expiryDate (no time component)
- groupUuid nullable for ungrouped trades
- NO ItemType enum in Prisma (TypeScript-only)
- NO derived fields (closingExpiry, status, pnl) stored in database

**Requirements Coverage**: FR-000, FR-003

---

### EPIC-002: Trade & Group Management (29 points)

#### STORY-004: Trade CRUD API Endpoints

**Story Points**: 8
**Sprint**: 1
**Priority**: Critical

**Description**:
Implement REST API for Trade CRUD operations with NestJS.

**Acceptance Criteria**:

- ✅ POST /v1/trades - Create trade (status defaults to OPEN)
- ✅ GET /v1/trades - List all trades
- ✅ GET /v1/trades/:uuid - Get single trade
- ✅ PUT /v1/trades/:uuid - Update trade
- ✅ DELETE /v1/trades/:uuid - Delete trade
- ✅ DTOs: CreateTradeDto, UpdateTradeDto, TradeResponseDto
- ✅ TradeResponseDto uses @Expose() decorators, excludes createdAt/updatedAt
- ✅ DataResponseDto<T> wrapper for consistent API responses
- ✅ class-validator validation on all DTOs
- ✅ Swagger/OpenAPI documentation generated
- ✅ E2E tests for all endpoints (NestJS Supertest)
- ✅ Global ValidationPipe with transform: true, whitelist: true
- ✅ ClassSerializerInterceptor with excludeExtraneousValues: true
- ✅ plainToInstance for Prisma entity → DTO transformation

**Technical Notes**:

- Controllers in api/src/trades/controllers/
- Services in api/src/trades/services/
- DTOs in api/src/trades/dto/request/ and api/src/trades/dto/response/
- Use barrel exports (index.ts)
- NO status field in CreateTradeDto (defaults to OPEN in service)
- groupUuid optional in CreateTradeDto

**Requirements Coverage**: FR-001, FR-013, FR-003

---

#### STORY-005: Group CRUD API Endpoints

**Story Points**: 8
**Sprint**: 2
**Priority**: Critical

**Description**:
Implement REST API for Group CRUD operations with derived metrics calculation.

**Acceptance Criteria**:

- ✅ POST /v1/groups - Create group
- ✅ GET /v1/groups - List all groups with metrics
- ✅ GET /v1/groups/:uuid - Get single group with metrics and trades
- ✅ PUT /v1/groups/:uuid - Update group
- ✅ DELETE /v1/groups/:uuid - Delete group
- ✅ DTOs: CreateGroupDto, UpdateGroupDto, GroupResponseDto
- ✅ GroupResponseDto includes calculated fields: closingExpiry (MIN(trade.expiryDate)), status (derived from closingExpiry), totalPnL (SUM of trade P&Ls)
- ✅ GroupWithMetrics interface in api/src/trades/interfaces/ (NO "I" prefix)
- ✅ class-validator validation on all DTOs
- ✅ Swagger/OpenAPI documentation
- ✅ E2E tests for all endpoints
- ✅ Derived metrics calculated on-demand (NOT stored in database)

**Technical Notes**:

- Reuse trades domain (api/src/trades/)
- GroupsController and GroupsService alongside TradesController/Service
- closingExpiry = MIN(trade.expiryDate WHERE groupUuid = group.uuid)
- status logic: <7 days = CLOSING_SOON, past expiry = CLOSED, else OPEN
- Performance target: <100ms for groups with up to 20 trades

**Requirements Coverage**: FR-002, FR-014, FR-003, FR-010

---

#### STORY-006: Trade Entry Form UI

**Story Points**: 5
**Sprint**: 2
**Priority**: High

**Description**:
Build React form for manual trade entry with validation.

**Acceptance Criteria**:

- ✅ Form fields: symbol, strikePrice, expiryDate, tradeType, optionType, quantity, costBasis, currentValue, notes
- ✅ Optional group selection (dropdown of existing groups)
- ✅ React Hook Form for form management
- ✅ Zod schema validation matching CreateTradeDto
- ✅ Date picker for expiryDate
- ✅ Number inputs for strikePrice, quantity, costBasis, currentValue
- ✅ Select dropdowns for tradeType, optionType
- ✅ Client-side validation with error messages
- ✅ Submit calls POST /v1/trades endpoint
- ✅ Success/error feedback to user
- ✅ Form reset after successful submission
- ✅ shadcn/ui components for consistent styling

**Technical Notes**:

- Use openapi-typescript to generate types from Swagger
- TanStack Query for API mutations
- Form in web/src/components/TradeForm/
- Validation errors display inline below fields

**Requirements Coverage**: FR-001, FR-003

---

#### STORY-007: Group Management UI

**Story Points**: 5
**Sprint**: 3
**Priority**: High

**Description**:
Build React interface for creating, editing, and managing groups.

**Acceptance Criteria**:

- ✅ Create group form: name, strategyType, notes
- ✅ Edit group modal with same fields
- ✅ Group list view showing name, strategyType, trade count
- ✅ Assign trades to group (drag-and-drop or checkbox selection)
- ✅ Ungroup trades (set groupUuid to null)
- ✅ React Hook Form + Zod validation
- ✅ Submit calls POST /v1/groups (create) or PUT /v1/groups/:uuid (update)
- ✅ TanStack Query for mutations and cache invalidation
- ✅ shadcn/ui components
- ✅ Visual indication of strategy type (calendar, ratio calendar, custom)

**Technical Notes**:

- Component in web/src/components/GroupManagement/
- Modal for create/edit using shadcn/ui Dialog
- Trade assignment via PUT /v1/trades/:uuid with updated groupUuid
- Support unlimited legs (no UI limit on trade count)

**Requirements Coverage**: FR-002, FR-003, FR-014, FR-010

---

#### STORY-008: Trade & Group Deletion with Confirmation

**Story Points**: 3
**Sprint**: 3
**Priority**: Medium

**Description**:
Implement deletion flows with user confirmation dialogs.

**Acceptance Criteria**:

- ✅ Delete trade button with confirmation modal
- ✅ Delete group button with confirmation modal
- ✅ Confirmation shows what will be deleted
- ✅ For group deletion, show impact: "X trades will be ungrouped"
- ✅ Calls DELETE /v1/trades/:uuid or DELETE /v1/groups/:uuid
- ✅ TanStack Query cache invalidation after deletion
- ✅ Success/error feedback
- ✅ shadcn/ui AlertDialog component
- ✅ Cancel and Confirm buttons clearly labeled

**Technical Notes**:

- AlertDialog from shadcn/ui
- Show trade symbol or group name in confirmation
- ON DELETE SET NULL ensures trades persist when group deleted

**Requirements Coverage**: FR-012

---

### EPIC-003: Portfolio Dashboard & Visualization (19 points)

#### STORY-009: Hierarchical Trade List View

**Story Points**: 8
**Sprint**: 2
**Priority**: Critical

**Description**:
Build hierarchical list showing groups (expandable) with nested trades.

**Acceptance Criteria**:

- ✅ List displays groups as expandable rows
- ✅ Expanding group shows all trades in that group
- ✅ Ungrouped trades shown in separate section
- ✅ Group rows show: name, strategyType, trade count, closingExpiry, status, totalPnL
- ✅ Trade rows show: symbol, strikePrice, expiryDate, tradeType, optionType, quantity, costBasis, currentValue, P&L, status
- ✅ Expand/collapse animation
- ✅ Visual hierarchy (indentation, icons)
- ✅ Calls GET /v1/groups (includes trades) and GET /v1/trades
- ✅ TanStack Query for data fetching and caching
- ✅ Renders <2 seconds for 100 groups + 1000 trades
- ✅ shadcn/ui Table or custom list component

**Technical Notes**:

- Component in web/src/components/TradeList/
- Use virtualization (react-window or @tanstack/react-virtual) if performance issue
- Color coding for status (OPEN = neutral, CLOSING_SOON = yellow, CLOSED = gray)
- P&L color coding (profit = green, loss = red)

**Requirements Coverage**: FR-004, FR-011

---

#### STORY-010: Dashboard Metrics & Filtering

**Story Points**: 5
**Sprint**: 3
**Priority**: High

**Description**:
Build dashboard with key portfolio metrics and filtering capabilities.

**Acceptance Criteria**:

- ✅ Metrics panel: total trades, total groups, total P&L, open positions, closing soon count
- ✅ Filter by: status (open/closing/closed), strategyType, symbol
- ✅ Date range filter for expiryDate
- ✅ Filters applied client-side (no backend filtering for MVP)
- ✅ Metrics update based on filtered data
- ✅ Filter controls: dropdowns, date pickers, search input
- ✅ Clear filters button
- ✅ Filtered list reflects in hierarchical trade list
- ✅ shadcn/ui components for filters
- ✅ Layout: metrics at top, filters below, list below filters

**Technical Notes**:

- Component in web/src/components/Dashboard/
- Use TanStack Query cached data for filtering
- Debounce symbol search input (300ms)
- Metrics calculated from filtered dataset

**Requirements Coverage**: FR-005, FR-006, FR-011

---

#### STORY-011: Sorting & Expiry Alerts

**Story Points**: 3
**Sprint**: 3
**Priority**: Medium

**Description**:
Add sorting controls and visual expiry alerts for trades closing soon.

**Acceptance Criteria**:

- ✅ Sort groups by: name, closingExpiry, totalPnL, trade count
- ✅ Sort trades by: symbol, expiryDate, P&L
- ✅ Sort direction toggle (ascending/descending)
- ✅ Visual alert for trades with status CLOSING_SOON (highlight row, badge, icon)
- ✅ Alert for groups with closingExpiry <7 days
- ✅ Default sort: groups by closingExpiry ascending, trades by expiryDate ascending
- ✅ Sort controls in table headers (clickable)
- ✅ Visual indicator of current sort column and direction
- ✅ shadcn/ui icons for sort and alerts

**Technical Notes**:

- Sorting implemented client-side
- CLOSING_SOON logic: expiryDate - now < 7 days
- Use amber/yellow color for alerts
- Icon: AlertTriangle from lucide-react

**Requirements Coverage**: FR-007, FR-008, FR-011

---

#### STORY-012: P&L Calculation & Status Display

**Story Points**: 3
**Sprint**: 3
**Priority**: High

**Description**:
Implement P&L calculation logic and status derivation with visual display.

**Acceptance Criteria**:

- ✅ Trade P&L calculation: (currentValue - costBasis) \* quantity
- ✅ Group totalPnL: SUM of trade P&Ls for trades in group
- ✅ Portfolio totalPnL: SUM of all trade P&Ls
- ✅ Status derivation for trades: <7 days to expiry = CLOSING_SOON, past expiry = CLOSED, else OPEN
- ✅ Status derivation for groups: based on closingExpiry (MIN of trade expiries)
- ✅ P&L displayed as currency (e.g., +$1,234.56 or -$567.89)
- ✅ Color coding: profit green, loss red, neutral gray
- ✅ Status badges with color coding
- ✅ Calculation completes <100ms for 1000 trades
- ✅ P&L updates when currentValue edited

**Technical Notes**:

- Calculation in backend services for API responses
- Frontend displays values from API
- Use Intl.NumberFormat for currency formatting
- Status logic centralized in backend service

**Requirements Coverage**: FR-009, FR-004

---

## Sprint Breakdown

### Sprint 1: Foundation & Backend Core

**Duration**: 2 weeks
**Target Points**: 20
**Actual Points**: 21

#### Goals

1. Establish monorepo development environment
2. Database schema deployed and operational
3. Trade CRUD API functional and tested
4. Docker environment running locally

#### Stories

| Story                          | Points | Priority |
| ------------------------------ | ------ | -------- |
| STORY-001: Monorepo Setup      | 3      | Critical |
| STORY-002: Docker Environment  | 5      | Critical |
| STORY-003: Prisma ORM & Schema | 5      | Critical |
| STORY-004: Trade CRUD API      | 8      | Critical |
| **Total**                      | **21** |          |

#### Success Criteria

- ✅ `docker-compose up` starts PostgreSQL and backend
- ✅ Prisma migrations applied successfully
- ✅ Trade API endpoints pass E2E tests
- ✅ Swagger documentation accessible at http://localhost:3000/api
- ✅ Seed data loaded (2 groups, 6 trades)

#### Risks

- Docker setup issues on local machine (RISK-003)
- Prisma migration failures (RISK-004)

#### Deliverables

- Runnable monorepo with pnpm workspaces
- Docker Compose configuration
- Database schema with migrations
- Trade CRUD API with E2E tests
- API documentation (Swagger)

---

### Sprint 2: Groups & Primary UI

**Duration**: 2 weeks
**Target Points**: 20
**Actual Points**: 21

#### Goals

1. Complete backend API surface (Groups CRUD)
2. Enable manual trade entry via UI
3. Build hierarchical trade list for portfolio overview
4. Full API coverage for MVP features

#### Stories

| Story                              | Points | Priority |
| ---------------------------------- | ------ | -------- |
| STORY-005: Group CRUD API          | 8      | Critical |
| STORY-006: Trade Entry Form        | 5      | High     |
| STORY-009: Hierarchical Trade List | 8      | Critical |
| **Total**                          | **21** |          |

#### Success Criteria

- ✅ Group API endpoints pass E2E tests
- ✅ Users can create trades via web form
- ✅ Hierarchical list displays groups and trades
- ✅ Expand/collapse groups works smoothly
- ✅ Derived metrics (closingExpiry, status, totalPnL) calculated correctly

#### Risks

- Hierarchical list complexity (RISK-005)
- Frontend-backend integration issues (RISK-010)

#### Deliverables

- Group CRUD API with E2E tests
- Trade entry form with validation
- Hierarchical trade list component
- Swagger types generated for frontend

---

### Sprint 3: Dashboard & Enhanced Features

**Duration**: 2 weeks
**Target Points**: 20
**Actual Points**: 19

#### Goals

1. Deliver complete MVP with dashboard
2. Enable group management via UI
3. Implement filtering, sorting, and alerts
4. Achieve 1-2 minute portfolio overview goal

#### Stories

| Story                                    | Points | Priority |
| ---------------------------------------- | ------ | -------- |
| STORY-007: Group Management UI           | 5      | High     |
| STORY-008: Deletion with Confirmation    | 3      | Medium   |
| STORY-010: Dashboard Metrics & Filtering | 5      | High     |
| STORY-011: Sorting & Expiry Alerts       | 3      | Medium   |
| STORY-012: P&L Calculation & Status      | 3      | High     |
| **Total**                                | **19** |          |

#### Success Criteria

- ✅ Users can create/edit/delete groups via UI
- ✅ Dashboard shows portfolio metrics
- ✅ Filtering by status, strategy, symbol works
- ✅ Sorting by various columns works
- ✅ Expiry alerts visible for closing positions
- ✅ 1-2 minute Friday overview achievable
- ✅ All 15 FRs covered

#### Risks

- Performance issues with large datasets (RISK-006)
- Scope creep (RISK-008)

#### Deliverables

- Group management UI
- Deletion confirmation flows
- Dashboard with metrics and filters
- Sorting and expiry alerts
- P&L calculation display
- Complete MVP application

---

## Traceability Matrices

### Story → Epic Mapping

| Story     | Epic     | Description                   |
| --------- | -------- | ----------------------------- |
| STORY-001 | EPIC-001 | Monorepo Setup                |
| STORY-002 | EPIC-001 | Docker Environment            |
| STORY-003 | EPIC-001 | Prisma ORM & Schema           |
| STORY-004 | EPIC-002 | Trade CRUD API                |
| STORY-005 | EPIC-002 | Group CRUD API                |
| STORY-006 | EPIC-002 | Trade Entry Form              |
| STORY-007 | EPIC-002 | Group Management UI           |
| STORY-008 | EPIC-002 | Deletion with Confirmation    |
| STORY-009 | EPIC-003 | Hierarchical Trade List       |
| STORY-010 | EPIC-003 | Dashboard Metrics & Filtering |
| STORY-011 | EPIC-003 | Sorting & Expiry Alerts       |
| STORY-012 | EPIC-003 | P&L Calculation & Status      |

### Story → Functional Requirements Coverage

| Story     | Primary FRs            | Secondary FRs  |
| --------- | ---------------------- | -------------- |
| STORY-001 | FR-000                 | -              |
| STORY-002 | FR-000                 | -              |
| STORY-003 | FR-000                 | FR-003         |
| STORY-004 | FR-001, FR-013         | FR-003         |
| STORY-005 | FR-002, FR-014         | FR-003, FR-010 |
| STORY-006 | FR-001                 | FR-003         |
| STORY-007 | FR-002, FR-003, FR-014 | FR-010         |
| STORY-008 | FR-012                 | -              |
| STORY-009 | FR-004                 | FR-011         |
| STORY-010 | FR-005, FR-006         | FR-011         |
| STORY-011 | FR-007, FR-008         | FR-011         |
| STORY-012 | FR-009                 | FR-004         |

### Functional Requirements Coverage Summary

| FR     | Description           | Stories Covering                                      | Coverage    |
| ------ | --------------------- | ----------------------------------------------------- | ----------- |
| FR-000 | Monorepo & deployment | STORY-001, STORY-002, STORY-003                       | ✅ Complete |
| FR-001 | Manual trade entry    | STORY-004, STORY-006                                  | ✅ Complete |
| FR-002 | Group creation        | STORY-005, STORY-007                                  | ✅ Complete |
| FR-003 | Trade grouping        | STORY-003, STORY-004, STORY-005, STORY-006, STORY-007 | ✅ Complete |
| FR-004 | Hierarchical view     | STORY-009, STORY-012                                  | ✅ Complete |
| FR-005 | Dashboard metrics     | STORY-010                                             | ✅ Complete |
| FR-006 | Filtering             | STORY-010                                             | ✅ Complete |
| FR-007 | Sorting               | STORY-011                                             | ✅ Complete |
| FR-008 | Expiry alerts         | STORY-011                                             | ✅ Complete |
| FR-009 | Manual P&L            | STORY-012                                             | ✅ Complete |
| FR-010 | Unlimited legs        | STORY-005, STORY-007                                  | ✅ Complete |
| FR-011 | 1-2 minute overview   | STORY-009, STORY-010, STORY-011                       | ✅ Complete |
| FR-012 | Deletion              | STORY-008                                             | ✅ Complete |
| FR-013 | Edit trades           | STORY-004                                             | ✅ Complete |
| FR-014 | Edit groups           | STORY-005, STORY-007                                  | ✅ Complete |

**All 15 functional requirements are covered by the 12 stories.**

### Story → Non-Functional Requirements Coverage

| Story     | NFRs Addressed                                                                                                                         |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| STORY-001 | NFR-008 (Monorepo structure)                                                                                                           |
| STORY-002 | NFR-006 (Local development reliability)                                                                                                |
| STORY-003 | NFR-003 (Data integrity via Prisma), NFR-007 (SQL injection prevention)                                                                |
| STORY-004 | NFR-001 (API performance), NFR-003 (Validation), NFR-004 (TypeScript + tests), NFR-007 (Input validation)                              |
| STORY-005 | NFR-001 (API performance), NFR-003 (Validation), NFR-004 (TypeScript + tests), NFR-005 (Handle 100 groups), NFR-007 (Input validation) |
| STORY-006 | NFR-002 (Usable form), NFR-003 (Client validation), NFR-007 (Input sanitization)                                                       |
| STORY-007 | NFR-002 (Intuitive UI), NFR-005 (Support unlimited legs)                                                                               |
| STORY-008 | NFR-002 (Clear confirmations), NFR-003 (Prevent accidental deletion)                                                                   |
| STORY-009 | NFR-001 (Render <2s), NFR-002 (Clear hierarchy), NFR-005 (1000 trades)                                                                 |
| STORY-010 | NFR-001 (Fast filtering), NFR-002 (Clear metrics)                                                                                      |
| STORY-011 | NFR-001 (Fast sorting), NFR-002 (Visual alerts)                                                                                        |
| STORY-012 | NFR-001 (P&L <100ms), NFR-003 (Accurate calculations)                                                                                  |

---

## Dependencies & Critical Path

### Dependency Graph

```
STORY-001 (Monorepo)
    ↓
STORY-002 (Docker) ──────────┐
    ↓                         │
STORY-003 (Prisma Schema)     │
    ├──→ STORY-004 (Trade API)│
    │       ↓                 │
    │   STORY-006 (Trade Form)│
    │       ↓                 │
    └──→ STORY-005 (Group API)│
            ↓                 │
        STORY-007 (Group UI)  │
            │                 │
            ↓                 ↓
        STORY-009 (Hierarchical List)
            ↓
        STORY-010, STORY-011, STORY-012 (Dashboard features)
            ↓
        STORY-008 (Deletion - can be done anytime after APIs)
```

### Dependency Matrix

| Story     | Depends On           | Blocks                          |
| --------- | -------------------- | ------------------------------- |
| STORY-001 | None                 | All stories                     |
| STORY-002 | STORY-001            | STORY-003, STORY-004, STORY-005 |
| STORY-003 | STORY-001, STORY-002 | STORY-004, STORY-005            |
| STORY-004 | STORY-003            | STORY-006, STORY-009, STORY-012 |
| STORY-005 | STORY-003            | STORY-007, STORY-009, STORY-012 |
| STORY-006 | STORY-004            | None                            |
| STORY-007 | STORY-005            | None                            |
| STORY-008 | STORY-004, STORY-005 | None                            |
| STORY-009 | STORY-004, STORY-005 | STORY-010, STORY-011            |
| STORY-010 | STORY-009            | None                            |
| STORY-011 | STORY-009            | None                            |
| STORY-012 | STORY-004, STORY-005 | None                            |

### Critical Path

The critical path for MVP completion:

1. **STORY-001** → Monorepo Setup (Day 1-2)
2. **STORY-002** → Docker Environment (Day 3-5)
3. **STORY-003** → Prisma Schema (Day 6-8)
4. **STORY-004** → Trade API (Day 9-14) _Sprint 1 ends_
5. **STORY-005** → Group API (Day 15-22)
6. **STORY-009** → Hierarchical List (Day 23-28) _Sprint 2 ends_
7. **STORY-010** → Dashboard (Day 29-31)
8. **STORY-011** → Sorting & Alerts (Day 32-34)
9. **STORY-012** → P&L Display (Day 35-37)

**Total Critical Path Duration**: ~37 days (~6 weeks at part-time pace)

Stories not on critical path (can be done in parallel):

- STORY-006 (Trade Form) - parallel with STORY-005
- STORY-007 (Group UI) - parallel with STORY-009
- STORY-008 (Deletion) - anytime after Sprint 2

---

## Risk Register

### High-Impact Risks

| Risk ID      | Risk Description                              | Probability | Impact | Mitigation Strategy                                                                   |
| ------------ | --------------------------------------------- | ----------- | ------ | ------------------------------------------------------------------------------------- |
| **RISK-001** | Solo developer illness/unavailability         | Medium      | High   | Keep detailed documentation; commit frequently; use git branches for work-in-progress |
| **RISK-003** | Docker environment issues on local machine    | Low         | High   | Use standard Node 24 Alpine images; document setup thoroughly; test early in Sprint 1 |
| **RISK-004** | Prisma schema migrations fail or corrupt data | Low         | High   | Use Prisma migrate in dev mode; seed script for test data; backup before migrations   |

### Medium-Impact Risks

| Risk ID      | Risk Description                                 | Probability | Impact | Mitigation Strategy                                                                  |
| ------------ | ------------------------------------------------ | ----------- | ------ | ------------------------------------------------------------------------------------ |
| **RISK-002** | Part-time schedule leads to missed sprint goals  | Medium      | Medium | Conservative sprint planning (20 pts/sprint); allow buffer in Sprint 3 (19 pts)      |
| **RISK-005** | Hierarchical list UI more complex than estimated | Medium      | Medium | Spike research in Sprint 2 start; consider simpler flat list as fallback             |
| **RISK-006** | P&L calculation performance <100ms unachievable  | Low         | Medium | Benchmark early; optimize query with Prisma includes; add caching if needed          |
| **RISK-008** | Scope creep beyond MVP                           | Medium      | Medium | Strict adherence to PRD; backlog for future enhancements; no new features in sprints |
| **RISK-010** | Frontend-backend integration issues              | Medium      | Medium | API-first design with Swagger; test endpoints with Supertest before frontend work    |

### Low-Impact Risks

| Risk ID      | Risk Description                         | Probability | Impact | Mitigation Strategy                                                       |
| ------------ | ---------------------------------------- | ----------- | ------ | ------------------------------------------------------------------------- |
| **RISK-007** | TypeScript strict mode slows development | Low         | Low    | Already accounted in estimates; benefits outweigh costs                   |
| **RISK-009** | Unfamiliarity with NestJS patterns       | Low         | Medium | Follow architecture document; reference NestJS docs; keep patterns simple |

### Risk Mitigation Timeline

**Sprint 1 Pre-emptive Actions**:

- Day 3: Validate Docker setup immediately (STORY-002)
- Day 6: Test Prisma migrations with seed data (STORY-003)
- Day 12: Generate Swagger docs and validate contract (STORY-004)

**Sprint 2 Pre-emptive Actions**:

- Day 16: Benchmark P&L calculation with 1000 trade seed data
- Day 23: Spike hierarchical list component before full implementation
- Day 24: Test frontend-backend integration early with Trade form

**Sprint 3 Pre-emptive Actions**:

- Day 30: Load test dashboard with full dataset (100 groups, 1000 trades)
- Day 36: Validate 1-2 minute overview goal with real-world usage simulation

---

## Definition of Done

### Story-Level DoD

A story is considered "Done" when ALL criteria are met:

#### Code Quality

- ✅ All acceptance criteria satisfied
- ✅ TypeScript strict mode enabled, no `any` types
- ✅ ESLint passes with no warnings or errors
- ✅ Prettier formatting applied
- ✅ Code reviewed (self-review for solo developer)
- ✅ No console.log or debug statements in production code

#### Testing

- ✅ Backend: E2E tests pass for all API endpoints (NestJS Supertest)
- ✅ Frontend: Manual testing completed for all user flows
- ✅ No unit tests required for MVP
- ✅ No frontend automated tests required for MVP

#### Documentation

- ✅ Backend: Swagger/OpenAPI documentation generated
- ✅ Code comments for complex logic only (self-documenting code preferred)
- ✅ README updated if setup process changed

#### Integration

- ✅ Code committed to git with descriptive message
- ✅ Merged to main branch (or feature branch if multi-day work)
- ✅ Works in Docker development environment
- ✅ No breaking changes to existing features

#### Functional

- ✅ Feature demonstrates correctly in local environment
- ✅ Error handling implemented
- ✅ Validation working (backend and frontend where applicable)
- ✅ UI matches shadcn/ui design system (frontend stories)

### Sprint-Level DoD

A sprint is considered "Done" when:

- ✅ All committed stories meet Story-Level DoD
- ✅ Sprint goal achieved
- ✅ No critical bugs blocking next sprint
- ✅ Docker environment still operational
- ✅ Database migrations applied successfully
- ✅ Sprint retrospective completed (personal notes for solo developer)

### Release-Level DoD (MVP Completion)

The MVP is ready for personal use when:

- ✅ All 12 stories completed
- ✅ All 15 functional requirements satisfied
- ✅ All 8 non-functional requirements met (or consciously deferred to backlog)
- ✅ 1-2 minute Friday portfolio overview achievable
- ✅ Unlimited leg grouping works
- ✅ Manual P&L tracking operational
- ✅ Docker Compose setup documented and reproducible
- ✅ Seed data available for testing
- ✅ No critical or high-severity bugs
- ✅ Personal acceptance testing passed

---

## Success Metrics

### Sprint-Level Metrics

#### Sprint 1

| Metric                   | Target     | Measurement Method                     |
| ------------------------ | ---------- | -------------------------------------- |
| Stories Completed        | 4/4 (100%) | All acceptance criteria met            |
| Story Points Delivered   | 21/21      | All stories done                       |
| Docker Setup Time        | <1 hour    | Time from clone to `docker-compose up` |
| Prisma Migration Success | 100%       | No migration failures                  |
| API Test Coverage        | 100% E2E   | All endpoints tested                   |
| Swagger Docs Generated   | Yes        | Accessible at /api                     |

#### Sprint 2

| Metric                        | Target                           | Measurement Method          |
| ----------------------------- | -------------------------------- | --------------------------- |
| Stories Completed             | 3/3 (100%)                       | All acceptance criteria met |
| Story Points Delivered        | 21/21                            | All stories done            |
| API Performance               | <200ms per request               | Backend logs                |
| Group Metrics Calculation     | <100ms for 20 trades             | Performance benchmark       |
| Hierarchical List Render Time | <2s for 100 groups + 1000 trades | Frontend performance        |
| Frontend-Backend Integration  | Zero blocking issues             | Manual testing              |

#### Sprint 3

| Metric                 | Target      | Measurement Method          |
| ---------------------- | ----------- | --------------------------- |
| Stories Completed      | 5/5 (100%)  | All acceptance criteria met |
| Story Points Delivered | 19/19       | All stories done            |
| Dashboard Load Time    | <2s         | Frontend performance        |
| Filtering Performance  | <500ms      | Client-side filtering       |
| Sorting Performance    | <500ms      | Client-side sorting         |
| Friday Overview Time   | 1-2 minutes | Real-world usage simulation |

### MVP-Level Metrics

#### Functional Completeness

| Metric                          | Target       | Actual |
| ------------------------------- | ------------ | ------ |
| Functional Requirements Covered | 15/15 (100%) | TBD    |
| User Stories Completed          | 12/12 (100%) | TBD    |
| Epics Delivered                 | 3/3 (100%)   | TBD    |

#### Performance (NFR-001)

| Metric                                          | Target           | Actual |
| ----------------------------------------------- | ---------------- | ------ |
| P&L Calculation Time                            | <100ms per group | TBD    |
| Page Load Time                                  | <2 seconds       | TBD    |
| API Response Time (95th percentile)             | <200ms           | TBD    |
| Dashboard Render Time (100 groups, 1000 trades) | <2 seconds       | TBD    |

#### Usability (NFR-002)

| Metric                             | Target        | Actual |
| ---------------------------------- | ------------- | ------ |
| Friday Portfolio Overview Time     | 1-2 minutes   | TBD    |
| Trade Entry Form Completion Time   | <30 seconds   | TBD    |
| Group Creation Time                | <15 seconds   | TBD    |
| Intuitive UI (Personal Assessment) | 4/5 or higher | TBD    |

#### Data Integrity (NFR-003)

| Metric                   | Target         | Actual |
| ------------------------ | -------------- | ------ |
| Data Validation Coverage | 100% of inputs | TBD    |
| ACID Transaction Support | Yes            | TBD    |
| Data Loss Incidents      | 0              | TBD    |

#### Code Quality (NFR-004)

| Metric                      | Target            | Actual |
| --------------------------- | ----------------- | ------ |
| TypeScript Strict Mode      | Enabled           | TBD    |
| ESLint Errors               | 0                 | TBD    |
| E2E Test Coverage (Backend) | 100% of endpoints | TBD    |

#### Scalability (NFR-005)

| Metric                   | Target | Actual |
| ------------------------ | ------ | ------ |
| Supported Groups         | ≥100   | TBD    |
| Supported Trades         | ≥1000  | TBD    |
| Unlimited Legs per Group | Yes    | TBD    |

#### Reliability (NFR-006)

| Metric                   | Target                   | Actual |
| ------------------------ | ------------------------ | ------ |
| Local Environment Uptime | 99% (during development) | TBD    |
| Data Backup Strategy     | Documented               | TBD    |

#### Security (NFR-007)

| Metric                   | Target                  | Actual |
| ------------------------ | ----------------------- | ------ |
| Input Validation         | 100% of user inputs     | TBD    |
| SQL Injection Prevention | Prisma parameterization | TBD    |

#### Maintainability (NFR-008)

| Metric             | Target            | Actual |
| ------------------ | ----------------- | ------ |
| Monorepo Structure | Documented        | TBD    |
| API Documentation  | Swagger generated | TBD    |

---

## Appendix

### Technology Stack Reference

**Frontend**:

- React 18
- TypeScript (strict mode)
- Vite
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- openapi-typescript

**Backend**:

- NestJS
- TypeScript (strict mode)
- Prisma ORM
- PostgreSQL 15
- class-validator
- class-transformer
- @nestjs/swagger
- compression

**Infrastructure**:

- Docker Compose
- Node 24 Alpine (LTS)
- pnpm 9+ workspaces

**Tooling**:

- ESLint
- Prettier

### Architectural Patterns

**Backend**:

- Layered Monolith (Controllers → Services → Data Access)
- Domain-Driven Design (Single "Trades" domain)
- DTO Pattern (Request/Response separation)
- API-First Design (Swagger contract)

**Frontend**:

- Component-Based Architecture
- Custom Hooks for business logic
- TanStack Query for server state
- Zod schemas for validation

### Key Design Decisions

1. **Calculate vs. Store**: Derived fields (closingExpiry, status, totalPnL) calculated on-demand rather than stored in database for guaranteed consistency
2. **TypeScript-Only Enums**: ItemType NOT in Prisma schema (not persisted), only in TypeScript for API discrimination
3. **Manual P&L for MVP**: No broker API integration initially; currentValue manually entered
4. **E2E Tests Only**: No unit tests for MVP; focus on end-to-end flows
5. **Client-Side Filtering/Sorting**: No backend pagination/filtering for MVP; acceptable for <1000 trades
6. **UUID Primary Keys**: Better security (no enumeration), future-proof for distributed systems
7. **ON DELETE SET NULL**: Deleting group doesn't delete trades; they become ungrouped
8. **No createdAt/updatedAt in DTOs**: Internal metadata not exposed to frontend

### Future Enhancement Backlog

**Phase 2 Enhancements** (Post-MVP):

- Broker API integration (Interactive Brokers, TD Ameritrade)
- Real-time portfolio updates (WebSocket streaming)
- Advanced charting and analytics
- Performance optimizations (caching, database indexing)
- Cloud deployment with CI/CD
- User authentication and multi-user support
- Mobile app (React Native)
- Historical data import
- Automated backtesting
- Tax reporting integration

**Technical Debt Backlog**:

- Unit test coverage
- Frontend automated tests (Vitest, React Testing Library)
- Backend pagination and filtering
- Database connection pooling
- Rate limiting and throttling
- Advanced error recovery
- Logging and monitoring
- Database backup automation

---

**Document End**

Generated by: BMAD Method v6 Sprint Planning Workflow
Reference Documents:

- Product Brief: `docs/product-brief-tradelog-2025-12-31.md`
- PRD: `docs/prd-tradelog-2025-12-31.md`
- Architecture: `docs/architecture-tradelog-2025-12-31.md`
- Workflow Status: `docs/bmm-workflow-status.yaml`
- Config: `bmad/config.yaml`
