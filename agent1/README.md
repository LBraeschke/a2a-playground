# agent1

Express-based A2A server that hosts the “Cake Baker Assistant”.

## Run (host)

From the repo root you can run:

```bash
npm install
npm run install:all
npm run agent
```

Or run directly from this folder:

```bash
npm install
npm start
```

Watch mode:

```bash
npm run start:watch
```

- Server URL: `http://localhost:4000`
- Healthcheck: `GET /health`
- A2A REST interface: `http://localhost:4000/a2a/rest`

## Database

- SQLite file: `db/data.db`
- Schema/seed: `src/db/setup.ts` (creates `db/`, creates table, seeds cakes if empty)
- Access helpers: `src/db/key-value.ts`

Important: `src/db/key-value.ts` prepares statements at import time, so `src/db/setup.ts` must run before it.

## Environment

Create `./.env` with:

```bash
AI_API_KEY=...
```

## Docker

```bash
docker compose up --build
```

Notes:

- `better-sqlite3` requires native compilation in Docker (see `Dockerfile`).
- Compose maps port `4000:4000` and uses a `/health` healthcheck.
