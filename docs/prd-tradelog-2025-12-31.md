# Product Requirements Document: tradelog

**Date:** 2025-12-31
**Author:** TristanVeskilt
**Version:** 1.0
**Project Type:** web-app
**Project Level:** 2
**Status:** Draft

---

## Document Overview

This Product Requirements Document (PRD) defines the functional and non-functional requirements for tradelog. It serves as the source of truth for what will be built and provides traceability from requirements through implementation.

**Related Documents:**

- Product Brief: `docs/product-brief-tradelog-2025-12-31.md`

---

## Executive Summary

tradelog is an options trading trade log application designed to solve the frustration with Interactive Brokers' confusing and rigid interface. The current IB app makes it difficult to manage multi-leg options combinations and doesn't allow editing of trade groups. This personal project will enable flexible trade entry, unlimited leg grouping, and dynamic group management for calendar spread and ratio calendar spread strategies, ultimately preventing costly trading errors and enabling a fast Friday workflow for weekly position management.

---

## Product Goals

### Business Objectives

1. **Time Savings:** Reduce weekly trade management overhead, especially Friday position reviews
2. **Enhanced Overview:** Achieve instant, intuitive portfolio visibility - see expiring groups with P&L at a glance (1-2 minutes)
3. **Error Prevention:** Eliminate trade closing errors through clear visualization
4. **Future Analytics:** Enable better trading decisions through analytics (post-MVP)

### Success Metrics

- **Time saved:** Portfolio overview completed in 1-2 minutes (vs. current manual process)
- **Error reduction:** Zero trade closing errors due to poor visibility
- **Visibility improvement:** Instant identification of positions requiring action
- **Usage frequency:** Weekly usage for Friday trade management
- **Adoption:** Regular use as primary trade reference when working in Interactive Brokers

### Success Signal

The project succeeds when the user stops opening IB to check portfolio overview and instead uses tradelog as the primary reference, only accessing IB for actual trade execution.

---

## Functional Requirements

Functional Requirements (FRs) define **what** the system does - specific features and behaviors.

Each requirement includes:

- **ID**: Unique identifier (FR-000, FR-001, etc.)
- **Priority**: Must Have / Should Have / Could Have (MoSCoW)
- **Description**: What the system should do
- **Acceptance Criteria**: How to verify it's complete
- **Dependencies**: Related requirements

---

### FR-000: Project Setup & Infrastructure

**Priority:** Must Have

**Description:**
Set up monorepo project structure with React frontend, NestJS backend, PostgreSQL database, Prisma ORM, Docker containerization, and development tooling.

**Acceptance Criteria:**

- [ ] Monorepo structure created (apps/frontend, apps/backend, packages/shared)
- [ ] React app initialized with TypeScript, shadcn UI, ESLint, Prettier
- [ ] NestJS API initialized with TypeScript, Prisma ORM, class-validator, ESLint, Prettier
- [ ] Swagger/OpenAPI configured for API documentation (@nestjs/swagger)
- [ ] PostgreSQL database running in Docker (Node Alpine)
- [ ] Shared package for common TypeScript types/interfaces
- [ ] Development environment runs locally with hot reload
- [ ] Database migrations system configured (Prisma)
- [ ] React Hook Form + Zod installed for frontend validation
- [ ] Environment variables configured (.env files)

**Dependencies:** None (Phase 0)

---

### FR-001: Create Individual Trade

**Priority:** Must Have

**Description:**
User can manually create a new individual options trade by entering: strike price, option type (PUT/CALL), trade action (BUY/SELL), cost, current value (for P&L), expiry date, and optional notes.

**Acceptance Criteria:**

- [ ] Form accepts all required fields (strike, type, action, cost, current value, expiry)
- [ ] Form uses React Hook Form for state management
- [ ] Form validates with Zod schema (client-side)
- [ ] API validates with NestJS DTOs (server-side)
- [ ] Form accepts optional notes field (multi-line text)
- [ ] Trade is saved to database with timestamp
- [ ] User sees confirmation of successful creation
- [ ] Invalid data shows clear error messages
- [ ] Current value field enables manual P&L tracking

**Dependencies:** FR-000

---

### FR-002: Create Trade Group/Combination

**Priority:** Must Have

**Description:**
User can create a trade group (combination) with unlimited legs, allowing grouping of related options positions (e.g., calendar spread, ratio spread, hedges). Group names are suggested based on strategy type and closest expiry date, with option for custom names.

**Acceptance Criteria:**

- [ ] User can create empty group with name/label
- [ ] Suggested group name format: "{Strategy Type} {Closest Expiry Date}"
  - Format: "MMM-DD-YYYY"
  - Example: "Calendar Spread Feb-15-2026"
  - Example: "Ratio Spread Mar-20-2025"
- [ ] User can accept suggested name or type custom name (freeform text)
- [ ] User can add unlimited individual trades to a group
- [ ] No arbitrary leg limits (must support 5+ leg strategies)
- [ ] Group displays aggregate P&L of all constituent trades
- [ ] Group can be created before or after individual trades exist
- [ ] Group accepts optional notes field

**Dependencies:** FR-001

---

### FR-003: Modify Trade Groups

**Priority:** Must Have

**Description:**
User can add trades to existing groups or remove trades from groups, enabling dynamic regrouping as strategies evolve (e.g., adding hedges to existing positions).

**Acceptance Criteria:**

- [ ] User can add existing trades to any group
- [ ] User can remove trades from groups
- [ ] User can move trades between groups
- [ ] Changes update group P&L immediately
- [ ] Ungrouped trades remain accessible
- [ ] Group status updates automatically based on children (per FR-007)

**Dependencies:** FR-002

---

### FR-004: View Hierarchical Trade List

**Priority:** Must Have

**Description:**
User can view trades in a hierarchical list where groups are expandable/collapsible, showing constituent leg trades when expanded.

**Acceptance Criteria:**

- [ ] Groups display as parent rows with summary info (name, aggregate P&L, status)
- [ ] Individual trades display as child rows under groups when expanded
- [ ] User can expand/collapse groups (▶/▼ icon)
- [ ] Ungrouped trades display at top level
- [ ] List uses infinite scroll for performance with many trades
- [ ] Expanded/collapsed state persists during session
- [ ] Visual indentation or nesting indicates hierarchy
- [ ] Trade details show: strike, type, action, expiry, P&L, status

**Dependencies:** FR-002

---

### FR-005: Dashboard Portfolio Metrics

**Priority:** Must Have

**Description:**
Dashboard displays portfolio-level metrics: total portfolio size, aggregate P&L, and count of open positions.

**Acceptance Criteria:**

- [ ] Dashboard shows total portfolio value (sum of all positions)
- [ ] Dashboard shows total P&L (aggregate across all positions)
- [ ] Dashboard shows count of Open positions
- [ ] Dashboard shows count of Closing Soon positions (expiring ≤7 days)
- [ ] Dashboard shows count of Closed positions
- [ ] Metrics update in real-time as trades change
- [ ] Dashboard is visible above trade list
- [ ] Dashboard is responsive (stacks vertically on mobile)

**Dependencies:** FR-001, FR-011 (P&L calculations)

---

### FR-006: Filter Trades

**Priority:** Must Have

**Description:**
User can filter the trade list by expiry date, status (Open/Closing Soon/Closed), option type (PUT/CALL), and P&L (profitable/losing).

**Acceptance Criteria:**

- [ ] Filter by expiry date range (date picker)
- [ ] Filter by status (Open / Closing Soon / Closed)
- [ ] Filter by option type (PUT / CALL)
- [ ] Filter by P&L status (profitable / losing / breakeven)
- [ ] Multiple filters can be applied simultaneously
- [ ] Filters apply to both groups and individual trades
- [ ] Clear filters button resets all filters
- [ ] Filter state persists during session

**Dependencies:** FR-004, FR-007

---

### FR-007: Trade Status Tracking

**Priority:** Must Have

**Description:**
System tracks and displays trade status for individual trades (Open, Closing Soon, Closed) and automatically derives group status from constituent trades. User manually updates status as positions are closed in IB.

**Acceptance Criteria:**

**Individual Trades:**

- [ ] User can manually set status for individual trades
- [ ] System auto-sets "Closing Soon" for trades expiring ≤7 days
- [ ] Status values: Open, Closing Soon, Closed
- [ ] Status is visually distinct (color coding or badges)
- [ ] Status changes are logged with timestamp
- [ ] Default status for new trades: Open

**Group Status (Derived):**

- [ ] Group status = "Closed" if ALL children are Closed
- [ ] Group status = "Closing Soon" if ANY child is Closing Soon (and not all Closed)
- [ ] Group status = "Open" if all children are Open (none Closing Soon or Closed)
- [ ] Group status updates automatically when child status changes
- [ ] Derived status is clearly indicated (not manually editable for groups)

**Future Enhancement (Could Have):**

- [ ] Auto-close trades after expiry date + auto-note "Expired without manual closure"

**Dependencies:** FR-001, FR-002

---

### FR-008: Sort Trades

**Priority:** Must Have

**Description:**
User can sort trades by expiry date, P&L, entry date, or strike price in ascending/descending order.

**Acceptance Criteria:**

- [ ] Sort by expiry date (nearest first / furthest first)
- [ ] Sort by P&L (most profitable / least profitable)
- [ ] Sort by entry date (newest / oldest)
- [ ] Sort by strike price (low to high / high to low)
- [ ] Sort applies to top-level items (groups + ungrouped trades)
- [ ] Sort direction toggle (ascending/descending)
- [ ] Sort persists during session
- [ ] Clear visual indicator of active sort

**Dependencies:** FR-004

---

### FR-009: Expiry Alerts

**Priority:** Must Have

**Description:**
System highlights trades/groups expiring within 7 days with visual alerts, enabling quick identification during Friday reviews.

**Acceptance Criteria:**

- [ ] Trades expiring ≤7 days are visually highlighted (color, icon, or badge)
- [ ] Groups with ANY child expiring ≤7 days are highlighted
- [ ] Highlighted trades appear at top of list (when no other sort applied)
- [ ] Dashboard shows count of expiring positions
- [ ] Alert threshold is configurable (default 7 days)
- [ ] Visual distinction from normal "Closing Soon" status

**Dependencies:** FR-004, FR-007

---

### FR-010: Quick Entry Templates

**Priority:** Should Have

**Description:**
User can use pre-configured templates for common strategies (calendar spread, ratio calendar spread) that auto-populate trade fields based on strategy pattern.

**Acceptance Criteria:**

- [ ] Template for calendar spread (sell 1-month, buy 2-month)
- [ ] Template for ratio calendar spread
- [ ] Templates pre-fill option type, action, relative expiries
- [ ] Templates suggest group name: "{Strategy} {Expiry}"
- [ ] User can customize template values before saving
- [ ] Templates create group + constituent trades in one action
- [ ] Templates save time vs. manual entry

**Dependencies:** FR-001, FR-002

---

### FR-011: Automated P&L Calculation

**Priority:** Must Have

**Description:**
System automatically calculates P&L for individual trades and groups based on cost basis. For MVP, current value is manually entered by user. Future enhancement will use live market data.

**Acceptance Criteria:**

- [ ] Individual trade has "current value" field (manually entered by user)
- [ ] Individual trade P&L = current value - cost
- [ ] Group P&L = sum of constituent trade P&Ls
- [ ] P&L displays as dollar amount and percentage
- [ ] P&L updates when current value is manually changed
- [ ] Calculations account for BUY (debit) vs. SELL (credit)
- [ ] Negative P&L (loss) visually distinct from positive P&L (profit)

**Future Enhancement:**

- [ ] Real-time P&L with live market data integration (requires separate planning)

**Dependencies:** FR-001, FR-002

---

### FR-012: Trade Notes/Journal

**Priority:** Should Have

**Description:**
User can add, edit, and view notes on individual trades and groups to capture strategy reasoning, market outlook, or adjustment rationale.

**Acceptance Criteria:**

- [ ] Notes field available on trades and groups
- [ ] Notes support multi-line text (textarea)
- [ ] Notes are timestamped on creation/edit
- [ ] Notes display in trade detail view
- [ ] Notes are editable after creation
- [ ] Empty notes are visually distinct (placeholder text)

**Could Have:**

- [ ] Notes are searchable

**Dependencies:** FR-001, FR-002

---

### FR-013: Edit/Delete Trades

**Priority:** Must Have

**Description:**
User can edit trade details (strike, cost, current value, expiry, notes) or delete trades that were entered incorrectly.

**Acceptance Criteria:**

- [ ] User can edit all trade fields (strike, type, action, cost, current value, expiry, notes, status)
- [ ] User can delete individual trades
- [ ] Deleting a trade updates group P&L immediately
- [ ] Deletion requires confirmation modal
- [ ] Confirmation shows trade details being deleted
- [ ] Edit uses same form/validation as create

**Could Have:**

- [ ] Edit history tracking

**Dependencies:** FR-001

---

### FR-014: Delete Trade Groups

**Priority:** Must Have

**Description:**
User can delete trade groups while choosing to preserve or delete constituent trades.

**Acceptance Criteria:**

- [ ] User can delete group only (trades become ungrouped)
- [ ] User can delete group and all constituent trades
- [ ] Deletion requires confirmation modal with clear options
- [ ] Confirmation shows group name + number of trades
- [ ] Cascade deletion is explicit (user chooses behavior via checkbox/radio)
- [ ] Ungrouped trades after group deletion remain visible in list

**Dependencies:** FR-002

---

## Non-Functional Requirements

Non-Functional Requirements (NFRs) define **how** the system performs - quality attributes and constraints.

---

### NFR-001: Performance - Dashboard Load Time

**Priority:** Must Have

**Description:**
Dashboard and trade list must load quickly to support the 1-2 minute portfolio overview goal.

**Acceptance Criteria:**

- [ ] Initial dashboard load < 2 seconds (localhost)
- [ ] Trade list renders first 50 items < 1 second
- [ ] Infinite scroll loads next batch < 500ms
- [ ] Filter/sort operations complete < 300ms
- [ ] P&L calculations update in real-time (< 100ms after data change)

**Measurement:**
Use browser DevTools Performance tab to measure load times.

**Rationale:**
Fast Friday workflow requires instant visibility. Slow loading defeats the purpose of replacing IB's interface.

---

### NFR-002: Usability - Intuitive Interface

**Priority:** Must Have

**Description:**
Interface must be intuitive enough to use without documentation or training, supporting the "no training required" success criterion.

**Acceptance Criteria:**

- [ ] First-time user can create a trade within 1 minute without instructions
- [ ] Trade grouping is discoverable (clear UI affordances like buttons, drag-drop indicators)
- [ ] Expiring positions are immediately visible (visual prominence via color/badges)
- [ ] Forms use clear labels and validation messages
- [ ] Error messages are actionable (explain what's wrong + how to fix)

**Could Have:**

- [ ] Keyboard shortcuts for common actions

**Rationale:**
As a solo user building for yourself, time spent learning the tool is wasted time. Intuitive design is critical.

---

### NFR-003: Usability - Responsive Design

**Priority:** Must Have

**Description:**
Application must be responsive and adapt to different viewport sizes including desktop, tablet, and mobile browsers.

**Acceptance Criteria:**

- [ ] Works on Chrome/Chromium (latest version)
- [ ] Works on Firefox (latest version)
- [ ] Works on Safari (latest version)
- [ ] Responsive design adapts to mobile viewport (320px+)
- [ ] Responsive design adapts to tablet viewport (768px+)
- [ ] Responsive design adapts to desktop viewport (1024px+)
- [ ] Trade list remains usable on small screens (scrollable, readable text)
- [ ] Dashboard metrics stack vertically on mobile
- [ ] Forms are usable on touch devices
- [ ] No native mobile app required (web-only)

**Rationale:**
While primary use is desktop (Friday workflow), being able to check positions on mobile browser adds flexibility for on-the-go portfolio checks.

---

### NFR-004: Data Integrity - No Data Loss

**Priority:** Must Have

**Description:**
User data must be persisted reliably with no risk of loss during normal operations.

**Acceptance Criteria:**

- [ ] All trade/group operations are transactional (atomic)
- [ ] Database writes are durable (Prisma transactions)
- [ ] Failed operations rollback cleanly
- [ ] Data validation prevents invalid states (e.g., negative strike prices)
- [ ] No silent data corruption
- [ ] Foreign key constraints prevent orphaned data

**Rationale:**
Trading data is financial data. Loss of trade records could result in costly errors or tax issues.

---

### NFR-005: Maintainability - Code Quality

**Priority:** Should Have

**Description:**
Codebase must be maintainable for solo developer with clear structure, type safety, and consistent formatting.

**Acceptance Criteria:**

- [ ] TypeScript strict mode enabled (frontend + backend)
- [ ] ESLint configured and passing with 0 errors
- [ ] Prettier configured for consistent code formatting
- [ ] Prettier integrated with ESLint (no conflicts)
- [ ] Pre-commit hooks run Prettier + ESLint (recommended)
- [ ] Shared types package for frontend-backend consistency
- [ ] Swagger/OpenAPI documentation for all API endpoints
- [ ] Generated TypeScript types from Swagger spec for frontend API client
- [ ] Clear separation: UI components, API routes, business logic, data access

**Rationale:**
Solo developer project that may be picked up after interruptions. Good code quality and automatic formatting prevent technical debt and reduce cognitive load.

---

### NFR-006: Scalability - Handle Expected Volume

**Priority:** Should Have

**Description:**
System must handle expected trade volume without performance degradation.

**Acceptance Criteria:**

- [ ] Support 500+ individual trades without slowdown
- [ ] Support 100+ trade groups without slowdown
- [ ] Infinite scroll handles large datasets efficiently (virtualization)
- [ ] Database queries use appropriate indexes (strike, expiry, status, groupId)
- [ ] No N+1 query problems in group/trade relationships (use Prisma includes/joins)

**Rationale:**
Weekly trading over 1-2 years = ~100-200 trades. System should handle 2-3x expected volume comfortably for future growth.

---

### NFR-007: Availability - Local Development

**Priority:** Must Have

**Description:**
Application must run reliably in local development environment (localhost).

**Acceptance Criteria:**

- [ ] Docker compose brings up full stack (DB + API + Frontend) with single command
- [ ] Hot reload works for development (React + NestJS)
- [ ] Database persists data between container restarts (volumes)
- [ ] Clear error messages when services fail to start
- [ ] Setup documented in README with step-by-step instructions

**Rationale:**
MVP runs localhost-only. Deployment comes later. Local reliability is critical for daily use.

---

### NFR-008: Security - Single User MVP

**Priority:** Should Have (for MVP), Must Have (for sharing)

**Description:**
For MVP, minimal security is acceptable (localhost single-user). For future sharing, basic authentication required.

**Acceptance Criteria (MVP):**

- [ ] No authentication required (single-user localhost)
- [ ] Database credentials stored in .env file (not committed to git)
- [ ] SQL injection prevented by Prisma ORM (parameterized queries)
- [ ] Input validation on both frontend (Zod) and backend (class-validator)

**Acceptance Criteria (Future - when shared):**

- [ ] User authentication (username/password or OAuth)
- [ ] Session management with secure cookies
- [ ] Data isolation between users (row-level security)
- [ ] HTTPS in production

**Rationale:**
MVP is personal use only. Security becomes critical when sharing with trading friends.

---

## Epics

Epics are logical groupings of related functionality that will be broken down into user stories during sprint planning (Phase 4).

Each epic maps to multiple functional requirements and will generate 2-10 stories.

---

### EPIC-001: Project Infrastructure & Setup

**Description:**
Establish the foundational monorepo architecture with React frontend, NestJS backend, PostgreSQL database, and development tooling. This epic delivers a working skeleton that other features build upon.

**Functional Requirements:**

- FR-000: Project Setup & Infrastructure

**Non-Functional Requirements:**

- NFR-005: Code Quality (TypeScript, ESLint, Prettier)
- NFR-007: Local Development Reliability

**Story Count Estimate:** 3-4 stories

**Priority:** Must Have

**Business Value:**
Enables all other development. Without solid infrastructure, nothing else can be built. Sets up maintainability and developer experience for the entire project.

**Example Stories:**

- Set up monorepo structure with apps/backend, apps/frontend, packages/shared
- Configure Docker Compose for PostgreSQL + NestJS + React
- Set up Prisma ORM with initial schema and migrations
- Configure ESLint + Prettier with pre-commit hooks

---

### EPIC-002: Trade & Group Management

**Description:**
Core CRUD functionality for creating, editing, and organizing individual trades and trade groups (combinations). Includes quick-entry templates and note-taking capabilities for strategy documentation.

**Functional Requirements:**

- FR-001: Create Individual Trade
- FR-002: Create Trade Group/Combination
- FR-003: Modify Trade Groups
- FR-010: Quick Entry Templates
- FR-012: Trade Notes/Journal
- FR-013: Edit/Delete Trades
- FR-014: Delete Trade Groups

**Non-Functional Requirements:**

- NFR-004: Data Integrity (transactional operations)

**Story Count Estimate:** 6-8 stories

**Priority:** Must Have

**Business Value:**
This is the core value proposition - flexible grouping with unlimited legs that IB doesn't provide. Without this, the entire project fails to solve the core problem.

**Example Stories:**

- Create trade entry form with validation (strike, type, action, cost, expiry)
- Create group with suggested naming
- Add/remove trades from groups
- Implement quick entry templates for calendar spreads
- Add notes field to trades and groups
- Implement edit/delete with confirmation modals

---

### EPIC-003: Portfolio Dashboard & Visualization

**Description:**
Comprehensive portfolio overview with hierarchical trade list, dashboard metrics, filtering, sorting, status tracking, expiry alerts, and automated P&L calculations. Delivers the "instant 1-2 minute overview" goal.

**Functional Requirements:**

- FR-004: View Hierarchical Trade List
- FR-005: Dashboard Portfolio Metrics
- FR-006: Filter Trades
- FR-007: Trade Status Tracking
- FR-008: Sort Trades
- FR-009: Expiry Alerts
- FR-011: Automated P&L Calculation

**Non-Functional Requirements:**

- NFR-001: Dashboard Load Time Performance
- NFR-002: Intuitive Interface
- NFR-003: Responsive Design
- NFR-006: Scalability (handle expected volume)

**Story Count Estimate:** 5-7 stories

**Priority:** Must Have

**Business Value:**
Delivers the fast Friday workflow and prevents trading errors. This epic provides the enhanced overview that solves the visibility problem with IB.

**Example Stories:**

- Implement hierarchical trade list with expand/collapse
- Build dashboard with portfolio metrics (value, P&L, counts)
- Implement trade filtering (status, expiry, type, P&L)
- Implement trade sorting (expiry, P&L, strike)
- Add status tracking with auto-derived group status
- Implement expiry alerts (≤7 days highlighting)
- Add manual current value field + P&L calculation

---

## User Stories (High-Level)

Detailed user stories will be created during sprint planning (Phase 4).

User stories follow the format: "As a [user type], I want [goal] so that [benefit]."

---

## User Personas

### Primary User: Tristan

**Demographics:**

- Software engineer with 4 years professional experience
- 2 years trading options
- Highly comfortable with web applications and data entry

**Trading Profile:**

- **Strategies:** Calendar spreads and ratio calendar spreads
- **Time Horizon:** 1-2 month expiries (short 1-month, long 2-month)
- **Trading Focus:** Profiting from time decay (theta)
- **Trading Schedule:** Weekly cycle - every Friday open new positions and close expiring ones
- **Trading Volume:** Weekly position management with 1-2 month holding periods

**Pain Points:**

- IB's interface cannot group 5+ leg trades
- Cannot add trades to existing groups
- Poor visibility into multi-leg strategy P&L
- Manual tracking is error-prone at scale

**Goals:**

- Fast Friday workflow (1-2 minute portfolio overview)
- Zero trade closing errors
- Clear visualization of expiring positions
- Flexible grouping for complex strategies

**Tech Savviness:** Very high - can handle sophisticated interfaces

---

### Secondary Users: Trading Friends

**Demographics:**

- Options traders (skill level varies)
- Potential future users if application is shared

**Influence:**

- Medium influence on feature prioritization
- May provide feedback on UX and features
- Not involved in MVP phase

---

## User Flows

### 1. Friday Position Review Flow

**Goal:** Quickly identify expiring positions and decide which to close

**Steps:**

1. User opens tradelog in browser
2. Dashboard loads showing portfolio metrics
3. User scans for "Closing Soon" badge or expiry alerts
4. User expands groups with expiring positions
5. User reviews P&L for each expiring position
6. User identifies positions to close in IB
7. Total time: 1-2 minutes

**Success Criteria:**

- All expiring positions visible at a glance
- P&L is accurate and up-to-date
- No need to click through multiple pages

---

### 2. Create New Calendar Spread Flow

**Goal:** Quickly enter a new calendar spread strategy

**Steps:**

1. User clicks "Quick Entry: Calendar Spread"
2. Template pre-fills form with strategy pattern
3. User enters strikes and specific expiries
4. User enters costs and current values
5. System suggests group name: "Calendar Spread Feb-15-2026"
6. User accepts or customizes name
7. User clicks Save
8. New group appears in trade list with 2 legs
9. Total time: <1 minute

**Success Criteria:**

- Template saves time vs manual entry
- Group is correctly created with both trades
- P&L calculates correctly

---

### 3. Add Hedge to Existing Position Flow

**Goal:** Add a hedge trade to an existing multi-leg strategy

**Steps:**

1. User creates new individual trade (hedge)
2. User clicks "Add to Group" on the trade
3. Modal shows list of existing groups
4. User selects target group (e.g., "Iron Condor Mar-15-2026")
5. Trade moves from ungrouped to nested under selected group
6. Group P&L updates to include hedge
7. Group status may change if hedge affects expiry timeline

**Success Criteria:**

- Trade successfully added to group
- Group P&L updates immediately
- Visual hierarchy shows trade nested under group

---

## Dependencies

### Internal Dependencies

None - greenfield project with no existing internal systems.

### External Dependencies

**Frontend:**

- React (UI framework)
- React Hook Form (form state management)
- Zod (client-side schema validation)
- shadcn UI (component library)
- TypeScript
- Vite or Create React App (build tool)

**Backend:**

- NestJS (backend framework)
- Prisma ORM (database ORM and migrations)
- class-validator (server-side validation via NestJS DTOs)
- @nestjs/swagger (OpenAPI/Swagger documentation)
- PostgreSQL driver
- TypeScript

**Infrastructure:**

- PostgreSQL (database)
- Docker (containerization)
- Node.js runtime (v18+ recommended)
- npm or pnpm (package manager)

**Development:**

- ESLint (linting)
- Prettier (code formatting)
- Git (version control)

**Future Dependencies (post-MVP):**

- Market data API (for real-time pricing and Greeks)
- Authentication library (for multi-user)

---

## Assumptions

1. **Manual data entry is acceptable:** No need for automated broker integration in MVP
2. **Web-only is sufficient:** No mobile app required; desktop/laptop browser access is adequate
3. **Single-user for MVP:** No authentication, user management, or multi-tenancy needed initially
4. **Self-hosted deployment:** Developer will handle hosting, deployment, and infrastructure
5. **User responsible for data accuracy:** No validation against broker data; manual entry assumed correct
6. **Localhost is adequate initially:** Production deployment can wait until MVP is validated through real usage
7. **Manual P&L updates are acceptable:** User will manually enter current values; automated pricing is post-MVP
8. **PostgreSQL is available:** Docker can run PostgreSQL container on development machine
9. **Modern browser usage:** User has access to Chrome, Firefox, or Safari (latest versions)
10. **Weekly trading volume:** System designed for ~1-2 trades per week, scaling to ~100-200 trades per year

---

## Out of Scope

### Out of Scope for MVP (moved to backlog):

- Live market data integration
- Automated trade import from Interactive Brokers API
- Multi-user capabilities and authentication
- Automated Greeks calculation
- Research broker data validation/import
- Export functionality (CSV, PDF)
- Real-time broker integration (very low priority - licensing complexity)

### Future Backlog (post-MVP):

- Analytics (performance over time, strategy win rates, trend analysis)
- Automated expiry handling (auto-close + auto-notes)
- Advanced filtering (by tags, notes content)
- Trade history and audit log
- Backup and restore functionality
- Portfolio performance charting
- Tax reporting features

### Never Implement:

- **Mobile app** (native iOS/Android) - web-only by design
- **Backtesting** - active management makes accurate backtesting too complex
- **Tax reporting features** - complexity and legal liability

---

## Open Questions

No open questions at this time. All requirements have been clarified.

---

## Approval & Sign-off

### Stakeholders

- **Tristan (Primary User, Developer, Decision-Maker)** - High influence. Sets all requirements, priorities, and technical decisions.

- **Trading Friends (Potential Future Users)** - Medium influence. May use the application if shared; their feedback could influence future feature prioritization and UX decisions.

### Approval Status

- [x] Product Owner (Tristan) - Approved
- [ ] Engineering Lead (N/A - solo developer)
- [ ] Design Lead (N/A - solo developer)
- [ ] QA Lead (N/A - solo developer)

---

## Revision History

| Version | Date       | Author         | Changes     |
| ------- | ---------- | -------------- | ----------- |
| 1.0     | 2025-12-31 | TristanVeskilt | Initial PRD |

---

## Next Steps

### Phase 3: Architecture

Run `/architecture` to create system architecture based on these requirements.

The architecture will address:

- All functional requirements (FRs)
- All non-functional requirements (NFRs)
- Technical stack decisions
- Data models and database schema
- API design and endpoints
- System components and communication
- Monorepo structure details

### Phase 4: Sprint Planning

After architecture is complete, run `/sprint-planning` to:

- Break epics into detailed user stories
- Estimate story complexity
- Plan sprint iterations
- Begin implementation

---

**This document was created using BMAD Method v6 - Phase 2 (Planning)**

_To continue: Run `/workflow-status` to see your progress and next recommended workflow._

---

## Appendix A: Requirements Traceability Matrix

| Epic ID  | Epic Name                           | Functional Requirements                                | Story Count (Est.) |
| -------- | ----------------------------------- | ------------------------------------------------------ | ------------------ |
| EPIC-001 | Project Infrastructure & Setup      | FR-000                                                 | 3-4 stories        |
| EPIC-002 | Trade & Group Management            | FR-001, FR-002, FR-003, FR-010, FR-012, FR-013, FR-014 | 6-8 stories        |
| EPIC-003 | Portfolio Dashboard & Visualization | FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-011 | 5-7 stories        |

**Total Estimated Stories:** 14-19 stories

---

## Appendix B: Prioritization Details

### Functional Requirements Summary

**Must Have (13):**

- FR-000: Project Setup
- FR-001: Create Trade
- FR-002: Create Group
- FR-003: Modify Groups
- FR-004: Hierarchical List
- FR-005: Dashboard
- FR-006: Filter Trades
- FR-007: Status Tracking
- FR-008: Sort Trades
- FR-009: Expiry Alerts
- FR-011: P&L Calculation
- FR-013: Edit/Delete Trades
- FR-014: Delete Groups

**Should Have (2):**

- FR-010: Quick Entry Templates
- FR-012: Trade Notes

**Could Have (0):**

- None explicitly defined

**Total FRs:** 15

---

### Non-Functional Requirements Summary

**Must Have (5):**

- NFR-001: Performance - Dashboard Load Time
- NFR-002: Usability - Intuitive Interface
- NFR-003: Usability - Responsive Design
- NFR-004: Data Integrity
- NFR-007: Availability - Local Development

**Should Have (3):**

- NFR-005: Maintainability - Code Quality
- NFR-006: Scalability - Handle Volume
- NFR-008: Security (MVP = Should Have, Future = Must Have)

**Total NFRs:** 8

---

### Priority Distribution

- **Must Have FRs:** 13/15 (87%)
- **Should Have FRs:** 2/15 (13%)
- **Could Have FRs:** 0/15 (0%)

- **Must Have NFRs:** 5/8 (62%)
- **Should Have NFRs:** 3/8 (38%)

**Analysis:** Heavy Must Have focus appropriate for lean MVP with 2-day timeline. Should Have items (templates, notes, code quality, scalability) provide nice-to-have enhancements but don't block core functionality.
