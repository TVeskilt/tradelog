# TradeLog

Custom options trading portfolio manager with unlimited leg grouping capabilities and rapid portfolio overview.

## Prerequisites

### For Docker Development (Recommended)

- **Docker Desktop** or **Docker Engine**: 20.10+ ([Download Docker](https://www.docker.com/get-started))
- **Docker Compose**: 2.0+ (included with Docker Desktop)
- **Git**: For cloning the repository

### For Local Development (Alternative)

- **Node.js**: 22.0.0 or higher (LTS recommended)
- **pnpm**: 9.0.0 or higher
- **PostgreSQL**: 15+ (if not using Docker)

### Install pnpm

```bash
npm install -g pnpm
```

## Docker Development Setup

The recommended way to develop TradeLog is using Docker Compose, which provides a consistent development environment with PostgreSQL and the NestJS backend.

### Quick Start

1. **Clone the repository**

```bash
git clone <repository-url>
cd tradelog
```

2. **Set up environment variables**

```bash
cp .env.example .env
```

**Note:** The `.env.example` file contains sensible defaults for local development. You can use it as-is or customize the values.

3. **Start the development environment**

```bash
docker-compose up
```

This will:
- Pull Docker images (first run only, ~500MB total, 5-10 minutes)
- Start PostgreSQL 15 database
- Start NestJS backend API with hot-reloading
- Run health checks for both services

4. **Access the services**

- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **PostgreSQL**: localhost:5432 (connect via psql or database client)

### Docker Commands

| Command | Description |
| ------- | ----------- |
| `docker-compose up` | Start all services (PostgreSQL + API) |
| `docker-compose up -d` | Start services in detached mode (background) |
| `docker-compose down` | Stop services (keeps database data) |
| `docker-compose down -v` | Stop services and remove volumes (fresh start) |
| `docker-compose logs -f api` | View API logs in real-time |
| `docker-compose logs -f db` | View database logs in real-time |
| `docker-compose ps` | List running containers |
| `docker-compose restart api` | Restart API service |

### Environment Variables

The `.env` file contains all configuration for the Docker environment:

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

**⚠️ Security Note:** These are development-only credentials. Never use these values in production!

### Development Workflow with Docker

1. **Start services**: `docker-compose up`
2. **Make code changes** in the `api/` directory
3. **Hot-reload** automatically detects changes (no restart needed)
4. **View logs** to see your changes reflected
5. **Stop services** when done: `docker-compose down`

### Running the Seed Script

Once Prisma is set up (STORY-003), you can populate the database with sample data:

```bash
# Run seed script in the API container
docker-compose exec api pnpm run seed
```

Or run it directly:

```bash
cd api
pnpm run seed
```

### Troubleshooting Docker

**Port conflicts (ports 3000 or 5432 already in use):**

```bash
# Check what's using port 3000
lsof -i :3000

# Check what's using port 5432
lsof -i :5432

# Stop conflicting service or change ports in docker-compose.yml
```

**Services won't start:**

```bash
# Clean up and restart
docker-compose down -v
docker-compose up --build
```

**Database data persistence:**

- Database data persists in a Docker volume named `tradelog-postgres-data`
- To completely wipe data: `docker-compose down -v`
- To keep data: `docker-compose down` (without `-v`)

**Container networking issues:**

```bash
# Remove and recreate network
docker-compose down
docker network prune
docker-compose up
```

## Project Structure

```
tradelog/
├── web/                      # React frontend
│   ├── src/
│   └── package.json
├── api/                      # NestJS backend
│   ├── src/
│   └── package.json
├── packages/
│   └── shared/              # Shared TypeScript code
│       ├── src/
│       └── package.json
├── pnpm-workspace.yaml      # Workspace configuration
├── package.json             # Root workspace
└── tsconfig.json            # Base TypeScript config
```

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd tradelog
```

### 2. Install dependencies

```bash
pnpm install
```

This will install all dependencies for all workspaces (web, api, shared).

### 3. Development

Run both frontend and backend concurrently:

```bash
pnpm dev
```

Run only frontend:

```bash
pnpm --filter "@tradelog/web" dev
```

Run only backend:

```bash
pnpm --filter "@tradelog/api" dev
```

## Available Scripts

### Root Commands

| Script            | Description                           |
| ----------------- | ------------------------------------- |
| `pnpm dev`        | Start web and api in development mode |
| `pnpm build`      | Build all workspaces                  |
| `pnpm lint`       | Lint all workspaces                   |
| `pnpm format`     | Format all files with Prettier        |
| `pnpm type-check` | Type check all workspaces             |

### Workspace-Specific Commands

```bash
# Run script in specific workspace
pnpm --filter "@tradelog/web" <script>
pnpm --filter "@tradelog/api" <script>
pnpm --filter "@tradelog/shared" <script>
```

## Development Workflow

1. **Make changes** in web/, api/, or packages/shared/
2. **Format code**: `pnpm format`
3. **Check types**: `pnpm type-check`
4. **Lint code**: `pnpm lint`
5. **Commit changes**

## Code Quality

### TypeScript

All packages use TypeScript with strict mode enabled:

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`

### ESLint

Configured with TypeScript support and consistent rules across all packages.

### Prettier

Automatic code formatting with consistent style:

- Single quotes
- 2-space indentation
- 100 character line width
- Trailing commas (ES5)

### Tailwind CSS (Frontend)

Utility-first CSS framework configured for the web package:

- Configured in `web/tailwind.config.js`
- PostCSS integration via `web/postcss.config.js`
- Import in your main CSS: `@tailwind base; @tailwind components; @tailwind utilities;`
- Use utility classes directly in JSX/TSX components

## Workspace Dependencies

The shared package (`@tradelog/shared`) is used by both web and api:

```json
{
  "dependencies": {
    "@tradelog/shared": "workspace:*"
  }
}
```

Import from shared package:

```typescript
import { SomeType, someUtil } from '@tradelog/shared';
```

## Tech Stack

### Frontend (web)

- React 18
- TypeScript
- Vite
- Tailwind CSS (utility-first styling)

### Backend (api)

- NestJS
- TypeScript

### Shared

- TypeScript utilities and types

## License

Private
