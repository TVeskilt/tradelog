# STORY-002: Docker Compose Development Environment

**Epic:** EPIC-001: Project Infrastructure & Setup
**Priority:** Critical
**Story Points:** 5
**Status:** Not Started
**Assigned To:** Unassigned
**Created:** 2026-01-02
**Sprint:** 1

---

## User Story

As a **developer**
I want to **have a Docker Compose development environment with PostgreSQL and NestJS backend**
So that **I can develop locally without manual environment setup and ensure consistency across different machines**

---

## Description

Setting up a consistent development environment is critical for productivity and reducing "works on my machine" issues. This story establishes the Docker-based development environment that will support all future development work on TradeLog MVP. The environment must support hot-reloading for rapid development iteration and include all necessary services (database, backend API).

The Docker Compose setup will orchestrate a PostgreSQL 15 database and NestJS backend API, with proper networking, health checks, and volume management to create a reliable and developer-friendly local environment.

---

## Scope

### In Scope

- Docker Compose configuration with PostgreSQL 15 service
- Backend service using Node 24 Alpine image
- Volume mounts for hot-reloading during development
- Environment variable configuration via .env file
- Health checks for database and backend services
- Comprehensive documentation for setup workflow
- Development seed script for sample data

### Out of Scope

- Production deployment configuration (future phase)
- Frontend Docker service (runs locally via Vite for now)
- CI/CD pipeline integration (future enhancement)
- Multi-environment configuration (staging, production)
- SSL/TLS configuration for local development

---

## User Flow

1. Developer clones the repository
2. Developer copies `.env.example` to `.env`
3. Developer runs `docker-compose up`
4. Docker Compose pulls images (PostgreSQL 15, Node 24 Alpine)
5. PostgreSQL container starts with health checks
6. Backend container starts, connects to database
7. Backend performs health checks
8. Developer sees confirmation that all services are healthy
9. Developer accesses backend API at http://localhost:3000
10. Developer makes code changes, sees hot-reload in action
11. Developer runs seed script to populate development data

---

## Acceptance Criteria

- [ ] `docker-compose.yml` file created with PostgreSQL 15 service configured
- [ ] PostgreSQL service uses official postgres:15-alpine image
- [ ] PostgreSQL exposed on port 5432 (host → container mapping)
- [ ] Backend service configured with Node 24 Alpine image
- [ ] Backend service exposed on port 3000 (host → container mapping)
- [ ] Volume mounts configured for backend source code to enable hot-reloading
- [ ] Named volume configured for PostgreSQL data persistence across container restarts
- [ ] `.env.example` file created with all required environment variables documented
- [ ] `.env` file in `.gitignore` (not committed to repository)
- [ ] Environment variables loaded from `.env` file into both services
- [ ] Health check configured for PostgreSQL (checks database is accepting connections)
- [ ] Health check configured for backend service (checks API is responding)
- [ ] `docker-compose up` starts both services successfully
- [ ] Backend successfully connects to PostgreSQL on first startup
- [ ] README.md updated with Docker setup instructions
- [ ] Seed script created (can be run to populate development data)
- [ ] Seed script executable via npm script (e.g., `pnpm run seed`)
- [ ] Hot-reload verified: code changes in backend reflected without container restart
- [ ] `docker-compose down` cleanly shuts down all services
- [ ] `docker-compose down -v` removes volumes for clean restart
- [ ] Total setup time from clone to running services <1 hour for new developer

---

## Technical Notes

### Components

- **Docker Compose**: Orchestration for local development environment
- **PostgreSQL Service**: Database container (postgres:15-alpine)
- **Backend Service**: NestJS API container (node:24-alpine)
- **Volumes**: Source code mounts + database persistence

### Docker Compose Configuration

**File: `docker-compose.yml`**

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: tradelog-db
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER} -d ${DB_NAME}']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - tradelog-network

  api:
    image: node:24-alpine
    container_name: tradelog-api
    working_dir: /app
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      NODE_ENV: development
    volumes:
      - ./api:/app
      - /app/node_modules # Prevents overwriting node_modules from host
    command: sh -c "pnpm install && pnpm run start:dev"
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test:
        ['CMD-SHELL', 'wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - tradelog-network

volumes:
  postgres_data:
    name: tradelog-postgres-data

networks:
  tradelog-network:
    name: tradelog-network
```

### Environment Variables

**File: `.env.example`**

```bash
# Database Configuration
DB_USER=tradelog_user
DB_PASSWORD=tradelog_dev_password_change_in_production
DB_NAME=tradelog_dev
DB_HOST=localhost
DB_PORT=5432

# Backend Configuration
NODE_ENV=development
PORT=3000

# Prisma Configuration
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
```

### Port Mappings

- **PostgreSQL**: Host `5432` → Container `5432`
- **Backend API**: Host `3000` → Container `3000`

### Volume Strategy

- **Named volume** (`postgres_data`): Persists database data across container restarts
- **Bind mount** (`./api:/app`): Maps local source code for hot-reloading
- **Anonymous volume** (`/app/node_modules`): Prevents host from overwriting container's node_modules

### Seed Script

**File: `api/src/seed.ts`**

Will include:

- 2 sample groups (Calendar Spread, Ratio Calendar Spread)
- 6 sample trades (3 per group)
- Realistic options data (SPY, QQQ symbols)

**Execution**: `pnpm run seed` (from api directory)

### Health Check Details

**PostgreSQL Health Check**:

- Command: `pg_isready -U ${DB_USER} -d ${DB_NAME}`
- Interval: 10 seconds
- Timeout: 5 seconds
- Retries: 5

**Backend Health Check**:

- Command: `wget --spider http://localhost:3000/health`
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3
- Start period: 40 seconds (allows time for pnpm install + app startup)

### Development Workflow

1. **Initial Setup**:

   ```bash
   git clone <repo>
   cd tradelog
   cp .env.example .env
   docker-compose up
   ```

2. **Accessing Services**:
   - Backend API: http://localhost:3000
   - PostgreSQL: localhost:5432 (via psql or database client)
   - Swagger Docs: http://localhost:3000/api

3. **Making Changes**:
   - Edit files in `api/` directory
   - NestJS hot-reload detects changes automatically
   - No container restart needed

4. **Stopping Services**:
   ```bash
   docker-compose down          # Stop, keep volumes
   docker-compose down -v       # Stop, remove volumes (clean slate)
   ```

### Security Considerations

- `.env` file excluded from git via `.gitignore`
- Default passwords only for local development (document warning in README)
- PostgreSQL not exposed to internet (Docker network isolation)
- Health check endpoints don't expose sensitive information

### Edge Cases

- **First run**: Container downloads images (~500MB total), takes 5-10 minutes
- **node_modules conflict**: Anonymous volume prevents host-container conflict
- **Database persistence**: Named volume survives `docker-compose down`
- **Clean restart**: Use `docker-compose down -v` to wipe database
- **Port conflicts**: Error if ports 3000 or 5432 already in use on host

### Performance Targets

- **Container startup**: <60 seconds (after images cached)
- **Hot-reload**: <3 seconds to reflect code changes
- **Setup time** (new developer): <60 minutes from clone to running

---

## Dependencies

### Prerequisite Stories

- **STORY-001**: Monorepo Setup with pnpm Workspaces
  - Required: Monorepo structure must exist before Docker configuration
  - Reason: Docker Compose references `api/` directory and pnpm commands

### Blocked Stories

This story blocks the following stories (they require a working development environment):

- **STORY-003**: Prisma ORM Setup & Database Schema (needs running PostgreSQL)
- **STORY-004**: Trade CRUD API Endpoints (needs backend development environment)
- **STORY-005**: Group CRUD API Endpoints (needs backend development environment)
- **All Sprint 2 & 3 stories**: Indirectly dependent on having a functional dev environment

### External Dependencies

**Software Requirements** (developer machine):

- Docker Desktop or Docker Engine (v20.10+)
- Docker Compose (v2.0+)
- Git (for cloning repository)
- Text editor (for editing .env file)

**Network Dependencies**:

- Docker Hub access (to pull postgres:15-alpine, node:24-alpine images)
- Internet connection for first-time image download (~500MB total)

**No blocking external dependencies**:

- No third-party APIs required
- No external services needed
- No design assets required

### Risk Dependencies

- **RISK-003**: Docker environment issues on local machine
  - Mitigation: Use standard Alpine images, test early in Sprint 1
  - Impact: High (blocks all development if Docker doesn't work)

---

## Definition of Done

- [ ] Code implemented and committed to feature branch
- [ ] All acceptance criteria validated (all ✓)
- [ ] docker-compose.yml created and functional
- [ ] .env.example created with all variables documented
- [ ] .env added to .gitignore
- [ ] Health checks operational for both services
- [ ] Seed script created and tested
- [ ] README.md updated with setup instructions
- [ ] Manual testing completed:
  - [ ] Fresh clone → docker-compose up works
  - [ ] Services start and pass health checks
  - [ ] Backend connects to PostgreSQL successfully
  - [ ] Hot-reload verified (make code change, see update without restart)
  - [ ] Seed script populates data correctly
  - [ ] docker-compose down cleans up properly
  - [ ] docker-compose down -v removes all volumes
- [ ] Setup time tested (should be <1 hour)
- [ ] Code reviewed (self-review for solo developer)
- [ ] No console.log or debug statements
- [ ] Merged to main branch
- [ ] Works on clean Docker installation

---

## Story Points Breakdown

- **Docker Compose Configuration**: 2 points
  - Services configuration (db, api)
  - Networking setup
  - Volume configuration
- **Environment Setup**: 1 point
  - .env.example creation
  - .gitignore update
  - Variable documentation
- **Health Checks & Reliability**: 1 point
  - PostgreSQL health check
  - Backend health check
  - Startup dependencies
- **Documentation & Seed Script**: 1 point
  - README update
  - Seed script implementation
  - Setup workflow documentation

**Total**: 5 points

**Rationale**: Moderate complexity. Docker Compose configuration is straightforward but requires attention to detail for volume mounts, health checks, and environment variables. The seed script adds minor complexity. Estimated at 8-10 hours of work for a developer familiar with Docker.

---

## Additional Notes

### Testing Checklist

- [ ] Test on fresh Docker installation
- [ ] Test with no existing containers/volumes
- [ ] Test port conflicts (start something on 3000, verify error message)
- [ ] Test hot-reload with sample code change
- [ ] Test database persistence (create data, restart containers, verify data persists)
- [ ] Test clean slate (docker-compose down -v, verify all data removed)
- [ ] Time the setup process (should complete in <1 hour)

### Documentation Requirements

README.md must include:

- Prerequisites (Docker, Docker Compose versions)
- Step-by-step setup instructions
- How to run seed script
- How to access services (URLs, ports)
- Troubleshooting section (common issues like port conflicts)
- How to stop/clean up services

### Future Enhancements (Post-MVP)

- Production docker-compose.production.yml
- Multi-stage Docker builds for optimized images
- Docker secrets management
- CI/CD integration (GitHub Actions with Docker)
- Frontend Docker service for consistent frontend environment

---

## Progress Tracking

**Status History:**

- 2026-01-02: Created

**Actual Effort:** TBD (will be filled during/after implementation)

---

**This story was created using BMAD Method v6 - Phase 4 (Implementation Planning)**
