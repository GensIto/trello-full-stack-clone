# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Trello clone built with a full-stack architecture running on Cloudflare Workers. The frontend is React with Vite, and the backend uses Hono with Cloudflare D1 (SQLite) database.

**Tech Stack:**
- **Frontend:** React 19, TanStack Router (file-based routing), TanStack Query, Tailwind CSS 4
- **Backend:** Hono framework, Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite), Drizzle ORM
- **Auth:** Better Auth with UI components
- **Validation:** Zod
- **Build:** Vite, TypeScript

## Development Commands

### Local Development
```bash
npm run dev                    # Start dev server on port 3000 (configured in vite.config.ts)
```

### Database Management
```bash
npm run db:gen                 # Generate Drizzle migrations from schema
npm run db:migrate             # Apply migrations locally
npm run db:migrate:remote      # Apply migrations to production
npm run db:studio              # Open Drizzle Studio for local DB
npm run db:studio:prod         # Open Drizzle Studio for production DB
```

### Build & Deploy
```bash
npm run build                  # TypeScript compile + Vite build
npm run check                  # Full check: TypeScript + build + dry-run deploy
npm run preview                # Build and preview production build locally
npm run deploy                 # Deploy to Cloudflare Workers
```

### Linting & Types
```bash
npm run lint                   # Run ESLint
npm run cf-typegen             # Generate Cloudflare Workers types from wrangler.json
```

### Monitoring
```bash
npx wrangler tail              # Monitor deployed worker logs
```

## Architecture

### Backend Architecture (Domain-Driven Design)

The backend follows **DDD principles** with clear separation of concerns:

**Layered Structure:**
- **Controllers** (`src/worker/controllers/`) - HTTP request handling with Hono routers, validation with Zod
- **Services** (`src/worker/service/`) - Business logic orchestration
- **Domain** (`src/worker/domain/`) - Core business entities and value objects
- **Infrastructure** (`src/worker/infrastructure/`) - Data persistence (repositories)
- **Middleware** (`src/worker/middleware/`) - Cross-cutting concerns (DI, auth)

**Key Patterns:**

1. **Value Objects** (`src/worker/domain/value-object/`): Type-safe primitives with validation
   - Each has `.of(value)` factory method that throws on invalid input
   - Each has `.tryOf(value)` that returns success/error result
   - Examples: `WorkspaceId`, `WorkspaceName`, `UserId`, `EmailAddress`
   - All use Zod for validation

2. **Entities** (`src/worker/domain/entities/`): Business domain objects
   - Immutable by design (readonly properties)
   - Created via static factory methods: `Entity.of(...)` or `Entity.tryOf(...)`
   - Include business logic methods (e.g., `Workspace.isOwnedBy(userId)`)
   - Validation through Zod schemas

3. **Dependency Injection** (`src/worker/di-container.ts`, `src/worker/container.ts`):
   - Custom DI container managing service lifetimes
   - `createContainer(db)` registers all dependencies
   - `injectDiContainer` middleware injects container into Hono context
   - Services accessed via `c.get('serviceName')` in controllers

4. **Repository Pattern** (`src/worker/infrastructure/`):
   - Each repository implements an interface (e.g., `IWorkspaceRepository`)
   - Handles data mapping between DB layer and domain entities
   - Uses Drizzle ORM for type-safe queries

### Frontend Architecture

**File-based Routing with TanStack Router:**
- Routes defined in `src/react-app/routes/`
- Route tree auto-generated to `src/react-app/routeTree.ts` (do not edit manually)
- Auto code-splitting enabled

**State Management:**
- TanStack Query for server state
- Better Auth for authentication state

**Styling:**
- Tailwind CSS 4 with Vite plugin

### Database Schema

Schema is split across multiple files in `src/worker/db/`:
- `auth-schema.ts` - Better Auth tables (users, sessions, etc.)
- `role-schema.ts` - User roles
- `workspace-schema.ts` - Workspaces and memberships
- `board-schema.ts` - Boards and memberships
- `card-schema.ts` - Cards, history, and activities
- `schema.ts` - Re-exports all schemas

**Drizzle Configuration:**
- `drizzle.config.ts` - Production config (uses D1 HTTP driver with env vars)
- Migrations output to `./drizzle/` directory

### Authentication

Better Auth is integrated at two levels:
1. **Worker level:** `/api/auth/*` routes handled in `src/worker/index.ts`
2. **Protected routes:** `injectAuth` middleware validates sessions (see `src/worker/middleware/index.ts`)

Frontend auth client configured in `src/react-app/lib/betterAuth.ts`.

### Cloudflare Bindings

Configured in `wrangler.json`:
- **DB:** D1 database binding (`torello-full-stack-clone`)
- **AI:** Cloudflare AI binding
- **Assets:** Serves built React app from `./dist/client` with SPA fallback

## Code Structure Patterns

### Adding a New Feature (Example: Adding Boards)

1. **Define Value Objects** in `src/worker/domain/value-object/board/`
2. **Create Entity** in `src/worker/domain/entities/Board.ts`
3. **Create Database Schema** in `src/worker/db/board-schema.ts`
4. **Generate Migration**: `npm run db:gen`
5. **Create Repository** in `src/worker/infrastructure/BoardRepository.ts`
6. **Create Service** in `src/worker/service/BoardService.ts`
7. **Register in DI Container** (`src/worker/container.ts`)
8. **Create Controller** in `src/worker/controllers/BoardController.ts`
9. **Register Routes** in `src/worker/index.ts`

### TypeScript Configuration

The project uses multiple TypeScript configs:
- `tsconfig.json` - Base config, references worker and app configs
- `tsconfig.worker.json` - Backend/worker specific
- `tsconfig.app.json` - Frontend React app specific
- `tsconfig.node.json` - Node tooling (Vite config, etc.)

## Important Notes

- **Immutability:** Domain entities are immutable with readonly properties
- **Factory Methods:** Always use `.of()` or `.tryOf()` to create value objects and entities
- **Validation:** Zod schemas validate at domain boundaries
- **DI Pattern:** Services are injected via middleware, never instantiated directly in controllers
- **Migration Workflow:** Update schema → `db:gen` → `db:migrate` (local) → test → `db:migrate:remote`
- **Route Generation:** TanStack Router auto-generates `routeTree.ts` during build
