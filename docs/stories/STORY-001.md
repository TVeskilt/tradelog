# STORY-001: Monorepo Setup with pnpm Workspaces

**Epic:** EPIC-001 - Project Infrastructure & Setup
**Priority:** Critical (Must Have)
**Story Points:** 3
**Status:** Not Started
**Assigned To:** Solo Developer
**Created:** 2025-01-02
**Sprint:** Sprint 1

---

## User Story

As a **full-stack developer**
I want to **establish a monorepo project structure with pnpm workspaces**
So that **I can develop the React frontend and NestJS backend in a single repository with shared code and consistent tooling**

---

## Description

### Background

TradeLog is a custom options trading portfolio manager that requires both a React frontend (web) and NestJS backend (api). A monorepo structure enables:

- Shared TypeScript types and utilities between frontend and backend
- Consistent tooling (ESLint, Prettier, TypeScript config)
- Atomic commits across frontend and backend
- Simplified dependency management
- Single repository clone for development

This story establishes the foundational project structure that all subsequent development depends on.

### Scope

**In scope:**

- pnpm workspace configuration with three packages:
  - `web/` - React frontend at project root
  - `api/` - NestJS backend at project root
  - `packages/shared/` - Shared TypeScript code
- TypeScript configuration with strict mode for all packages
- ESLint and Prettier setup with consistent rules across packages
- Root package.json with workspace scripts (dev, build, lint, test)
- Initial package.json files for each workspace
- Basic README with setup instructions

**Out of scope:**

- Docker configuration (STORY-002)
- Application code or components
- Database setup (STORY-003)
- CI/CD pipeline configuration
- Production deployment configuration

### Developer Flow

1. Developer clones repository
2. Developer runs `pnpm install` at root (installs all workspace dependencies)
3. Developer runs `pnpm dev` to start both frontend and backend concurrently
4. Developer can import shared types/utilities using workspace protocol
5. Developer commits changes with consistent formatting (Prettier auto-formats)
6. Developer runs `pnpm lint` to check all packages before committing
7. Developer runs `pnpm build` to verify all packages build successfully

---

## Acceptance Criteria

### Workspace Configuration

- [ ] pnpm-workspace.yaml exists at project root
- [ ] pnpm-workspace.yaml includes: web, api, packages/\*
- [ ] Root package.json exists with workspace scripts
- [ ] pnpm version 9+ documented as requirement

### Package Structure

- [ ] web/ directory created at project root
- [ ] api/ directory created at project root
- [ ] packages/shared/ directory created
- [ ] Each workspace has its own package.json
- [ ] Workspace names follow convention: @tradelog/web, @tradelog/api, @tradelog/shared

### TypeScript Configuration

- [ ] Root tsconfig.json with strict mode enabled
- [ ] web/tsconfig.json extends root config, configured for React
- [ ] api/tsconfig.json extends root config, configured for NestJS
- [ ] packages/shared/tsconfig.json extends root config
- [ ] All configs use strict: true, noImplicitAny: true, strictNullChecks: true

### Code Quality Tools

- [ ] ESLint configured at root with TypeScript support
- [ ] ESLint extends recommended configs (@typescript-eslint, react for web)
- [ ] Prettier configured at root with consistent rules
- [ ] .eslintignore and .prettierignore files present
- [ ] All packages pass linting with zero errors/warnings

### Scripts & Automation

- [ ] Root package.json has `dev` script (runs web + api concurrently)
- [ ] Root package.json has `build` script (builds all workspaces)
- [ ] Root package.json has `lint` script (lints all workspaces)
- [ ] Root package.json has `format` script (Prettier formatting)
- [ ] Scripts use workspace filtering where appropriate

### Validation

- [ ] `pnpm install` completes successfully from fresh clone
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm format` runs without errors
- [ ] All packages can import from @tradelog/shared using workspace protocol
- [ ] No conflicting dependencies between workspaces

### Documentation

- [ ] README.md with setup instructions
- [ ] Prerequisites documented (Node 24 LTS, pnpm 9+)
- [ ] Available scripts documented
- [ ] Project structure explained

---

## Technical Notes

### Project Structure

```
tradelog/
├── web/                          # React frontend
│   ├── src/
│   ├── package.json             # @tradelog/web
│   ├── tsconfig.json
│   └── vite.config.ts
├── api/                          # NestJS backend
│   ├── src/
│   ├── package.json             # @tradelog/api
│   └── tsconfig.json
├── packages/
│   └── shared/                   # Shared TypeScript code
│       ├── src/
│       ├── package.json         # @tradelog/shared
│       └── tsconfig.json
├── pnpm-workspace.yaml
├── package.json                 # Root workspace
├── tsconfig.json                # Base TypeScript config
├── .eslintrc.js
├── .prettierrc
├── .gitignore
└── README.md
```

### pnpm Workspace Configuration

**pnpm-workspace.yaml:**

```yaml
packages:
  - 'web'
  - 'api'
  - 'packages/*'
```

**Root package.json (key sections):**

```json
{
  "name": "tradelog",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel --filter \"@tradelog/web\" --filter \"@tradelog/api\" dev",
    "build": "pnpm --recursive build",
    "lint": "pnpm --recursive lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "pnpm --recursive type-check"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.3.0"
  }
}
```

### TypeScript Configuration

**Root tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

**web/tsconfig.json (React-specific):**

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**api/tsconfig.json (NestJS-specific):**

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "test"]
}
```

### ESLint Configuration

**.eslintrc.js:**

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [
      './tsconfig.json',
      './web/tsconfig.json',
      './api/tsconfig.json',
      './packages/*/tsconfig.json',
    ],
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist/', 'node_modules/'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

### Prettier Configuration

**.prettierrc:**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Workspace Dependencies

**packages/shared/package.json:**

```json
{
  "name": "@tradelog/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "lint": "eslint \"src/**/*.ts\"",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

**Example usage in web/package.json:**

```json
{
  "dependencies": {
    "@tradelog/shared": "workspace:*"
  }
}
```

### Barrel Exports Setup

**packages/shared/src/index.ts:**

```typescript
// Example barrel export structure (will be populated in later stories)
export * from './types';
export * from './utils';
export * from './constants';
```

### .gitignore

```
# Dependencies
node_modules/
.pnp.*
.yarn/*

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
pnpm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/
.nyc_output/

# Misc
*.tgz
.cache/
```

### Implementation Steps

1. **Initialize root workspace:**

   ```bash
   pnpm init
   ```

2. **Create pnpm-workspace.yaml** with workspace packages

3. **Create directory structure:**

   ```bash
   mkdir -p web api packages/shared
   ```

4. **Initialize each workspace:**

   ```bash
   cd web && pnpm init
   cd ../api && pnpm init
   cd ../packages/shared && pnpm init
   ```

5. **Set package names** (@tradelog/web, @tradelog/api, @tradelog/shared)

6. **Create TypeScript configs** (root + per-workspace)

7. **Install shared dev dependencies** at root:

   ```bash
   pnpm add -D -w typescript eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
   ```

8. **Create ESLint and Prettier configs**

9. **Add workspace scripts** to root package.json

10. **Create .gitignore and .prettierignore**

11. **Test installation and scripts:**

    ```bash
    pnpm install
    pnpm lint
    pnpm format
    ```

12. **Create README.md** with setup instructions

### Edge Cases & Considerations

- **Workspace hoisting**: pnpm hoists common dependencies to root node_modules, but keeps workspace-specific deps isolated
- **Version conflicts**: If web and api depend on different versions of a package, pnpm handles this correctly
- **Circular dependencies**: Avoid circular workspace dependencies (shared should not depend on web or api)
- **Path aliases**: If using path aliases, configure both TypeScript and build tools (Vite, Webpack)
- **ESM vs CommonJS**: React (web) uses ESM, NestJS (api) uses CommonJS - configured in respective tsconfig.json files

### Performance Considerations

- Use `--filter` flag for pnpm commands to run tasks only in specific workspaces
- Use `--parallel` for independent tasks (dev, lint)
- Use `--recursive` for dependent tasks (build)
- pnpm is faster than npm/yarn due to content-addressable storage

---

## Dependencies

### Prerequisite Stories

**None** - This is the first story in the project (no blockers)

### Blocks Stories

**All other stories** - The entire project depends on this monorepo setup:

- STORY-002: Docker Compose Development Environment
- STORY-003: Prisma ORM Setup & Database Schema
- STORY-004: Trade CRUD API Endpoints
- STORY-005: Group CRUD API Endpoints
- STORY-006: Trade Entry Form UI
- STORY-007: Group Management UI
- STORY-008: Trade & Group Deletion
- STORY-009: Hierarchical Trade List View
- STORY-010: Dashboard Metrics & Filtering
- STORY-011: Sorting & Expiry Alerts
- STORY-012: P&L Calculation & Status Display

### External Dependencies

- **Node.js 24 LTS**: Must be installed on developer machine
- **pnpm 9+**: Must be installed globally (`npm install -g pnpm`)
- **Git**: For version control

### Technical Dependencies

None - this story has no technical dependencies within the project.

---

## Definition of Done

### Code Quality

- [ ] All TypeScript files pass type checking with strict mode
- [ ] ESLint runs with zero errors and zero warnings
- [ ] Prettier formatting applied to all files
- [ ] No `any` types in code
- [ ] All workspace scripts execute successfully

### Functionality

- [ ] Fresh clone + `pnpm install` completes without errors
- [ ] `pnpm dev` script defined (will be functional after STORY-002, STORY-003)
- [ ] `pnpm build` builds all workspaces successfully (may be empty builds initially)
- [ ] `pnpm lint` passes for all workspaces
- [ ] `pnpm format` formats all files correctly
- [ ] Workspaces can import from @tradelog/shared using workspace protocol

### Documentation

- [ ] README.md created with:
  - [ ] Prerequisites (Node 24, pnpm 9+)
  - [ ] Installation steps
  - [ ] Available scripts
  - [ ] Project structure diagram
  - [ ] Development workflow
- [ ] All configuration files have comments explaining key settings
- [ ] .gitignore includes all necessary patterns

### Testing

- [ ] Manual validation: Clone repo, run `pnpm install`, verify no errors
- [ ] Manual validation: Run `pnpm lint`, verify zero errors
- [ ] Manual validation: Run `pnpm format`, verify files formatted
- [ ] Manual validation: Create test file in shared/, import in web and api, verify workspace protocol works

### Integration

- [ ] Code committed to git with descriptive message
- [ ] .gitignore prevents node_modules, dist, .env from being committed
- [ ] All configuration files (tsconfig, eslint, prettier) committed
- [ ] README committed

### Verification Checklist

Run these commands to verify completion:

```bash
# Clean install test
rm -rf node_modules web/node_modules api/node_modules packages/*/node_modules
pnpm install

# Lint test
pnpm lint

# Format test
pnpm format

# Type check test
pnpm type-check

# Workspace import test
# Create packages/shared/src/test.ts with: export const test = 'hello';
# Import in api/src/main.ts: import { test } from '@tradelog/shared/test';
# Verify no TypeScript errors
```

---

## Story Points Breakdown

**Complexity Analysis:**

- **Configuration Setup**: 1 point
  - Create workspace files (pnpm-workspace.yaml, package.json)
  - Configure TypeScript (4 tsconfig files)
- **Tooling Setup**: 1 point
  - ESLint configuration with TypeScript support
  - Prettier configuration
  - Script definitions
- **Documentation & Validation**: 1 point
  - Write README with setup instructions
  - Test all scripts and workspace imports
  - Verify clean installation

**Total: 3 points**

**Rationale:**

- Straightforward configuration work
- Well-documented patterns (pnpm workspaces, TypeScript, ESLint)
- No complex logic or algorithms
- Estimated at 4-6 hours total (3 points × 2 hours/point for senior developer)
- Fits well within Sprint 1 Day 1-2 timeline

---

## Additional Notes

### Why pnpm over npm/yarn?

- **Speed**: 2x faster than npm, faster than yarn
- **Disk efficiency**: Content-addressable storage (shared cache)
- **Strict**: Better handling of peer dependencies
- **Monorepo support**: First-class workspace support with filtering

### Why strict TypeScript mode?

- Catch bugs at compile time
- Better IDE autocomplete and refactoring
- Self-documenting code (types as documentation)
- Easier to maintain and scale
- Aligns with project NFR-004 (Code Quality)

### Why consistent tooling?

- Prevents "works on my machine" issues
- Automated formatting reduces code review overhead
- Enforces code quality standards (no `any`, unused vars, etc.)
- Enables confident refactoring

### Future Enhancements (Post-MVP)

- Husky pre-commit hooks for lint/format
- Commitlint for conventional commits
- lint-staged for faster pre-commit linting
- Turbo or Nx for build caching
- Renovate for automated dependency updates

---

## Progress Tracking

**Status History:**

- 2025-01-02: Story created and documented
- TBD: Story started
- TBD: Code review
- TBD: Story completed

**Actual Effort:** TBD (will be filled during/after implementation)

**Notes During Implementation:**
(Add notes here as you work on the story)

---

## References

- **Sprint Plan**: `docs/sprint-plan-tradelog-2025-01-02.md`
- **Architecture**: `docs/architecture-tradelog-2025-12-31.md` (Section 12: Development & Deployment)
- **PRD**: `docs/prd-tradelog-2025-12-31.md` (FR-000: Monorepo & Deployment)
- **pnpm Workspace Docs**: https://pnpm.io/workspaces
- **TypeScript Config Reference**: https://www.typescriptlang.org/tsconfig
- **ESLint TypeScript Plugin**: https://typescript-eslint.io/

---

**This story was created using BMAD Method v6 - Phase 4 (Implementation Planning)**
**Created by:** Scrum Master
**Ready for:** Developer Implementation
