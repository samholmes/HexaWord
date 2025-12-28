# HexaWord

A hexagonal word puzzle game where players trace paths through a honeycomb-style grid of letters to discover hidden words. Features a playful, colorful UI inspired by games like Wordle and Duolingo, with satisfying micro-interactions and a competitive leaderboard.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: Wouter

## Prerequisites

- Node.js 20.19+ or 22.12+
- Docker (for local development)

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hexaword
PORT=3000
```

### 3. Start the database and app

```bash
npm run dev
```

This will:
1. Start PostgreSQL via Docker Compose
2. Start the development server with hot reload

The app will be available at `http://localhost:3000`

### 4. Push the database schema

On first run (or after schema changes):

```bash
npm run dev:db:push
```

### Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Docker DB + dev server |
| `npm run dev:app` | Start dev server only (if DB is already running) |
| `npm run dev:db:start` | Start PostgreSQL container |
| `npm run dev:db:stop` | Stop PostgreSQL container |
| `npm run dev:db:push` | Push schema to local database |

## Production

### Environment Variables

Set these environment variables in your production environment:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | Set to `production` |

### Build and Run

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Production Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build client and server for production |
| `npm run start` | Run production build |
| `npm run db:push` | Push schema (uses DATABASE_URL from environment) |
| `npm run check` | TypeScript type checking |

## Replit Deployment

This project is configured for Replit. Simply:

1. Import the repository to Replit
2. Add `postgresql-16` to your Replit modules (auto-provisions DATABASE_URL)
3. Click Run

## Project Structure

```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   └── lib/          # Utilities
│   └── public/           # Static assets
├── server/           # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── db.ts             # Database connection
├── shared/           # Shared types and schemas
│   ├── schema.ts         # Drizzle database schema
│   └── routes.ts         # API route definitions
└── docker-compose.yml    # Local PostgreSQL setup
```

## License

MIT

