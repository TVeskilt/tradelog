# Product Brief: tradelog

**Date:** 2025-12-31
**Author:** TristanVeskilt
**Version:** 1.0
**Project Type:** web-app
**Project Level:** 2

---

## Executive Summary

I am building an options trading trade log to solve the frustration with Interactive Brokers' confusing and rigid interface. The current IB app makes it difficult to manage multi-leg options combinations and doesn't allow editing of trade groups. This personal project will enable me to enter trades, create flexible options combinations with unlimited legs, and edit trade groups dynamically. The application will serve as a clear, intuitive reference for managing my calendar spread and ratio calendar spread strategies, ultimately preventing costly trading errors that can range from a few dollars to several hundred dollars.

---

## Problem Statement

### The Problem

Interactive Brokers' interface has critical limitations that make managing complex options strategies frustrating and error-prone:

**Concrete example:** When entering a 5-legged options trade, IB cannot combine them into a single group and instead displays 5 separate lines. Ironically, 4-legged trades work fine, revealing an arbitrary limitation. Additionally, when adding a hedge trade to an existing combination, IB doesn't allow incorporating it into the earlier group, even though the positions are logically connected. This fragmented view makes it nearly impossible to accurately track complex strategies or see the true P&L of related positions.

### Why Now?

I currently have free time and possess the technical skills (4 years as a software engineer) to build a solution that addresses this problem directly. Rather than continuing to work around IB's limitations, now is the opportune moment to create a tool that matches how I actually trade.

### Impact if Unsolved

Currently, I manually handle trade tracking, which is manageable at low volumes. However, as trading volume increases, this fragmented view becomes a nightmare for:

- **Decision-making:** Can't quickly assess position status
- **P&L tracking:** Can't see true profitability of multi-leg strategies
- **Risk management:** Can't evaluate overall exposure across related positions

Most critically, poor visibility increases the chance of faulty trades - mistakes that can cost anywhere from $10 to $500 per error.

---

## Target Audience

### Primary Users

**Tristan (myself):**

- **Trading experience:** 2 years trading options
- **Strategies:** Calendar spreads and ratio calendar spreads
  - Selling 1-month expiry options
  - Buying 2-month expiry options
  - Profiting from time decay (theta)
- **Trading schedule:** Weekly cycle - every Friday open new positions and close positions nearing expiration
- **Tech profile:** Software engineer with 4 years professional experience, highly comfortable with web applications and data entry
- **Trading volume:** Weekly position management with 1-2 month holding periods

### Secondary Users

**Trading friends:** Potential future users who also trade options. They would have medium influence on feature prioritization and design decisions if/when the application is shared.

### User Needs

1. **Good overview of trades/portfolio:** Instant visibility into current positions, what's expiring, and overall status
2. **Custom grouping:** Ability to create and modify trade combinations with unlimited legs, group related hedges
3. **P&L + basic info:** Clear display of profitability, strike prices, expiries, and position details

---

## Solution Overview

### Proposed Solution

A web application with an infinite scroll list of trades, providing instant clarity on portfolio status and flexible trade management. The interface will feature:

**Dashboard layer:** Portfolio-level metrics displayed in blocks at the top - total portfolio size, aggregate P&L, and summary Greeks (post-MVP)

**Trade list layer:** Infinite scroll view with hierarchical structure where trade combinations (groups) can contain unlimited individual leg trades. Each group can be expanded to show constituent trades, and new trades can be added to existing groups at any time.

**Manual entry:** Simple, fast forms for entering individual trades and creating combinations, with quick-entry templates for common patterns like calendar spreads and ratio spreads.

### Key Features

**MVP (Phase 1 - 2 days):**

- Manual trade entry with essential fields (strike, type, action, cost, expiry)
- Unlimited leg grouping/combinations
- Hierarchical display (combinations → individual legs)
- Basic dashboard with portfolio-level metrics (total value, P&L)
- Trade status tracking (open, active, closing soon, closed)
- Filters and sorting (by expiry date, strategy type, P&L, status)
- Quick-entry templates for calendar spreads and ratio spreads
- Trade notes/journal field for capturing strategy reasoning
- Expiry alerts to highlight positions expiring soon
- Automated P&L calculations

**Phase 2 (Enhancements):**

- Advanced calculations
- Enhanced filters and templates
- Alert refinements

**Post-MVP Backlog:**

- Analytics (performance over time, win rate by strategy)
- Live market data integration
- Automated trade import from IB API
- Multi-user authentication
- Real-time broker integration (very low priority - licensing complexity)
- Automated Greeks calculation

**Never Implement:**

- Mobile app
- Backtesting (too complex for active management strategies)
- Tax reporting features

### Value Proposition

Unlike spreadsheets and IB's interface, this solution provides:

- **Readability:** Clean, intuitive interface designed for options traders
- **Flexibility:** Unlimited legs per combination, dynamic regrouping
- **Automation:** Calculated P&L, expiry tracking, status management
- **Speed:** Instant portfolio overview in 1-2 minutes vs. manual reconciliation
- **Accuracy:** Reduced errors through clear visualization and automated calculations

The "magic" is combining the clarity of a purpose-built tool with the flexibility that spreadsheets and broker platforms lack.

---

## Business Objectives

### Goals

- **Time savings:** Reduce weekly trade management overhead, especially Friday position reviews
- **Enhanced overview:** Achieve instant, intuitive portfolio visibility - see expiring groups with P&L at a glance
- **Future improved decisions:** Enable better trading decisions through analytics (post-MVP)

### Success Metrics

- **Time saved:** Portfolio overview completed in 1-2 minutes (vs. current manual process)
- **Error reduction:** Zero trade closing errors
- **Visibility improvement:** Instant identification of positions requiring action
- **Usage frequency:** Weekly usage for Friday trade management
- **Adoption:** Regular use as primary trade reference when working in IB

### Business Value

**Primary value - Fast Friday workflow:**
Every Friday, quickly identify:

- Which positions are expiring this week
- P&L status of each combination
- Which positions need closing
- Where to open new positions

**Risk mitigation:**
Even one prevented trading error (value: $10-500) justifies the development investment. At increased trading volumes, the error prevention value multiplies significantly.

---

## Scope

### In Scope

**MVP Features:**

- Manual trade entry (strike, option type, trade type, cost, expiry, notes)
- Unlimited leg grouping/combinations
- Hierarchical display and management
- Dashboard with portfolio-level metrics (size, total P&L)
- Filters and sorting (expiry, type, P&L, status)
- Trade status tracking (open, active, closing soon, closed)
- Quick-entry templates for calendar and ratio spreads
- Trade notes/journal
- Expiry alerts
- Automated P&L calculations
- Web-only interface
- Single-user (no authentication)
- PostgreSQL database with Prisma ORM
- React frontend with shadcn UI components
- NestJS backend
- Docker containerization with Node Alpine
- TypeScript throughout
- ESLint code quality

### Out of Scope

**Not in MVP (moved to backlog):**

- Live market data integration
- Automated trade import from Interactive Brokers API
- Multi-user capabilities and authentication
- Automated Greeks calculation
- Research broker data validation/import

**Future Backlog (post-MVP):**

- Analytics (performance over time, strategy win rates)
- Real-time broker integration (very low priority due to licensing complexity)

**Never Implement:**

- Mobile app (web-only by design)
- Backtesting (active management makes accurate backtesting too complex)
- Tax reporting features

### Future Considerations

Post-MVP enhancements will be evaluated based on actual usage patterns. Priority will be given to features that directly improve the Friday workflow or prevent trading errors.

---

## Key Stakeholders

- **Tristan (Primary User, Developer, Decision-Maker)** - High influence. Sets all requirements, priorities, and technical decisions.

- **Trading Friends (Potential Future Users)** - Medium influence. May use the application if shared; their feedback could influence future feature prioritization and UX decisions.

---

## Constraints and Assumptions

### Constraints

**Budget:**

- Zero-cost project
- Local development environment initially
- Potential migration to free tier hosting (Vercel, Railway, etc.) post-MVP

**Time:**

- No hard deadlines
- Free time project with flexible timeline
- Target: 2-day MVP with Claude Code assistance

**Technology:**

- **Frontend:** React, TypeScript, shadcn UI components
- **Backend:** NestJS, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Containerization:** Docker with Node Alpine image
- **Code Quality:** ESLint
- **Architecture:** Monorepo structure
- **Deployment:** Self-hosted initially

**Resources:**

- Solo developer (Tristan)
- AI assistance via Claude Code
- No team, no external contributors for MVP

### Assumptions

- **Manual data entry is acceptable:** No need for automated broker integration in MVP
- **Web-only is sufficient:** No mobile app required; desktop/laptop browser access is adequate
- **Single-user for MVP:** No authentication, user management, or multi-tenancy needed initially
- **Self-hosted deployment:** Developer will handle hosting, deployment, and infrastructure
- **User responsible for data accuracy:** No validation against broker data; manual entry assumed correct
- **Localhost is adequate initially:** Production deployment can wait until MVP is validated through real usage

---

## Success Criteria

**Usage Indicators:**

- Using tradelog as primary tool for portfolio overview and trade logging
- Referencing tradelog when navigating Interactive Brokers for trade execution
- Consistently maintaining trade notes for decision tracking
- Weekly usage during Friday position management sessions

**Quality Benchmarks:**

- **Zero trade closing errors** due to poor visibility or confusion
- **Portfolio overview in 1-2 minutes** from app open to full understanding
- **Intuitive interface** requiring no documentation or training

**Satisfaction Indicators:**

- **Enjoy using it** - positive experience vs. current frustration with IB
- **Clearer overview** - demonstrably better visibility than current manual methods
- **Confidence boost** - feeling more in control of position management

**Concrete Success Signal:**
The project succeeds when I stop opening IB to check my portfolio overview and instead use tradelog as my primary reference, only accessing IB for actual trade execution.

---

## Timeline and Milestones

### Target Launch

**MVP Target:** 2 days (with Claude Code assistance)

Goal: Move as fast as possible to get a usable version for real trading

### Key Milestones

**Phase 1 - Minimum Viable (Target: 2 days):**

- Basic CRUD operations for trades and groups
- Basic dashboard with portfolio metrics
- **Status:** Usable for real trading

**Milestone Definition:** Phase 1 is complete when I can enter my current positions, view them grouped correctly, and get a quick P&L overview.

**Phase 2 - Enhancements (post-MVP, timeline flexible):**

- Automated calculations refinements
- Advanced filters, templates, and alerts
- Feature additions based on real usage

**Deployment Milestones:**

1. Local development environment (Day 0)
2. MVP complete, tested with real trades (Day 2 target)
3. Production hosting on free tier (post-MVP, when validated)
4. Share with trading friends (post-validation, timeline TBD)

---

## Risks and Mitigation

### Risk 1: Complexity Underestimation

**Description:** P&L calculations or grouping logic may be more complex than anticipated, especially for multi-leg positions with different costs and expiries.

**Likelihood:** Medium

**Mitigation:**

- Research and leverage existing libraries for options calculations
- Start with simple P&L (cost basis only, no Greeks)
- If Greeks calculations prove too complex, push to post-MVP backlog
- Focus on manual entry correctness rather than automated calculation accuracy for MVP
- Validate calculations against IB data during testing

### Risk 2: Time Availability

**Description:** Free time might disappear due to work demands, personal obligations, or other priorities.

**Likelihood:** Low

**Mitigation:**

- Aggressive 2-day timeline to capture MVP before potential interruptions
- Scope simplification if time becomes constrained - can cut features to reach "usable" state faster
- Flexible long-term approach - if interrupted, can resume development when time permits
- No external commitments or deadlines to create pressure

### Risk 3: Feature Incompleteness

**Description:** MVP might be missing a critical feature that prevents actual usage for real trading, requiring a return to development before validation.

**Likelihood:** Medium

**Mitigation:**

- Iterative deployment approach - test with real trades as soon as basic CRUD works
- Keep Interactive Brokers as backup during transition period
- Add features incrementally as needs are discovered through actual use
- Prioritize "good enough" over "perfect" for MVP features
- Weekly trading cycle provides natural checkpoints to validate feature completeness

---

## Next Steps

1. Create Product Requirements Document (PRD) - `/prd`
2. Conduct user research (optional) - `/research`
3. Create UX design (if UI-heavy) - `/create-ux-design`

---

**This document was created using BMAD Method v6 - Phase 1 (Analysis)**

_To continue: Run `/workflow-status` to see your progress and next recommended workflow._
