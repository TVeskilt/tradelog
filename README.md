# TradeLog

Custom options trading portfolio manager with unlimited leg grouping capabilities and rapid portfolio overview.

## Prerequisites

- **Node.js**: 22.0.0 or higher (LTS recommended)
- **pnpm**: 9.0.0 or higher

### Install pnpm

```bash
npm install -g pnpm
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
