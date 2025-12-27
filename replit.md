# Hexa Word

## Overview

Hexa Word is a hexagonal word puzzle game built as a full-stack web application. Players trace paths through a honeycomb-style grid of letters to discover hidden words. The game features a playful, colorful UI inspired by games like Wordle and Duolingo, with a purple-focused theme and satisfying micro-interactions. Players compete on a leaderboard based on completion time.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled with Vite
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React hooks for local state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme extending CSS variables for colors
- **Animations**: Framer Motion for game animations and transitions
- **Fonts**: Fredoka (display/game text), Nunito (body), JetBrains Mono (monospace)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx
- **API Pattern**: REST endpoints defined in shared route schemas with Zod validation
- **Build System**: Vite for client, esbuild for server bundling

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` - contains game types and scores table
- **Migrations**: Drizzle Kit with migrations output to `./migrations`

### Game Logic
- **Grid Generation**: Server-side word placement on hexagonal coordinate system (axial coordinates q, r)
- **Word Pool**: Large categorized word list (technology, animals, food) in `server/routes.ts`
- **Validation**: Words validated against placed words when player traces paths

### Key Design Patterns
- **Shared Types**: `shared/` directory contains schemas and route definitions used by both client and server
- **Path Aliases**: `@/` maps to client source, `@shared/` to shared directory
- **Component Structure**: UI primitives in `components/ui/`, game-specific components at top level

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### UI Libraries
- **Radix UI**: Headless accessible component primitives (dialogs, tooltips, etc.)
- **shadcn/ui**: Pre-styled component collection using Radix + Tailwind
- **Framer Motion**: Animation library for game interactions
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Frontend dev server and bundler with HMR
- **esbuild**: Server bundling for production
- **Replit Plugins**: Dev banner and cartographer for Replit environment

### Utilities
- **TanStack Query**: Server state management and caching
- **Zod**: Runtime type validation for API contracts
- **date-fns**: Date formatting for leaderboard display
- **canvas-confetti**: Win celebration effects