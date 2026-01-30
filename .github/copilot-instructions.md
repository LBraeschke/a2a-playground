# Copilot Instructions (a2a-playground)

## What this repo does

This repository is a small A2A (Agent-to-Agent) playground:

- **agent1/** runs an Express server implementing the A2A server interface. Incoming user messages are handled by an A2A executor which calls an OpenAI Agents SDK “Cake Baker Assistant”.
- **client/** is a simple Node script that talks to the agent server via the A2A client SDK.
- A local **SQLite** database stores a cake “menu” as `cake_name -> description`.

## Tech stack

- **Node.js** (ESM)
- **TypeScript** (no build step; executed via `node --experimental-strip-types`)
- **Express** 5
- **@a2a-js/sdk** for A2A server/client
- **@openai/agents** (OpenAI Agents SDK)
- **better-sqlite3** (native module; requires build tooling in Docker)
- **Docker / Docker Compose** for containerized dev
- **MCP**: Context7 and DBHub configured under `.vscode/mcp.json`

## Project structure

- **agent1/**
  - `src/server.ts` — Express server, health endpoint (`/health`), A2A REST routes
  - `src/agent-route.ts` — A2A executor; extracts user text and calls `runAgentDbLookup()`
  - `src/agent/db-look-up.ts` — Cake Baker Assistant agent + tools (`cake_lookup`, `list_all_cakes`)
  - `src/db/setup.ts` — SQLite open/init/seed (creates `db/` directory, creates table, seeds cakes)
  - `src/db/key-value.ts` — DB access helpers (get/has/getAll/set/del)
  - `db/` — persisted SQLite database file is created here (`db/data.db`)
  - `docker-compose.yml`, `Dockerfile` — containerized dev
  - `.env` — provides `AI_API_KEY` for the OpenAI-compatible endpoint
- **client/**
  - `src/index.ts` — minimal A2A client example that sends a message to the agent

## Local development (minimize command failures)

Run commands from the correct folder — there are _two_ separate Node projects.

### Agent server (host)

From `agent1/`:

- Install: `npm install`
- Run once: `npm start` (listens on `http://localhost:4000`)
- Watch mode: `npm run start:watch`

### Client (host)

From `client/`:

- Install: `npm install`
- Run: `npm start` (sends a message to `http://localhost:4000`)

### Docker (agent1)

From `agent1/`:

- `docker compose up --build`

Notes:

- `better-sqlite3` is a **native** module. In Docker it needs `python3`, `make`, and `g++` (already installed in `agent1/Dockerfile`). Do not switch back to `npm ci --ignore-scripts` or the native bindings won’t compile.
- Compose exposes port **4000** and uses a healthcheck calling `http://localhost:4000/health`.

## Environment & configuration

- `agent1/src/agent/db-look-up.ts` configures an OpenAI-compatible endpoint:
  - `baseURL`: `https://api.genai.zeiss.com/openai/deployments/gpt-51`
  - `api-version`: `2024-10-21`
  - Header: `api-key` from `AI_API_KEY`
- `agent1/.env` is used by Docker Compose to pass `AI_API_KEY`.

## Database behavior

- SQLite file is created at `agent1/db/data.db`.
- Table: `store(cake_name TEXT PRIMARY KEY, description TEXT)`.
- `src/db/setup.ts`:
  - ensures `agent1/db/` exists
  - creates the table if missing
  - seeds cake rows **only if** the table is empty

Important ordering constraint:

- `src/db/key-value.ts` prepares SQL statements at module import time. That means `setup.ts` must initialize the schema before those statements are prepared.

Schema changes:

- If you rename columns/table, add a migration or delete the local `agent1/db/data.db` to allow reseeding.

## MCP servers (VS Code)

Configured in `.vscode/mcp.json`:

- `context7` uses an input prompt for the API key.
- `agent1-db` runs `@bytebase/dbhub` over stdio.
  - SQLite DSN uses a prompted `root_folder` input.
  - On Windows, prefer forward slashes (e.g. `C:/projects/...`) for SQLite DSNs.

## Coding guidelines for changes

- Prefer small, targeted diffs; don’t reformat unrelated code.
- Keep ESM + explicit `.ts` import extensions (the project relies on `--experimental-strip-types`).
- When adding new DB queries, keep them in `agent1/src/db/key-value.ts` and keep `setup.ts` as the single place that creates/initializes the DB.
- Avoid introducing additional build steps unless necessary.
- If you touch Docker, preserve:
  - native build toolchain for `better-sqlite3`
  - port 4000 mapping and `/health` healthcheck

## Useful entry points

- Agent server routes: `agent1/src/server.ts`
- A2A executor logic: `agent1/src/agent-route.ts`
- Cake agent/tools: `agent1/src/agent/db-look-up.ts`
- DB initialization/seed: `agent1/src/db/setup.ts`
- DB access helpers: `agent1/src/db/key-value.ts`
- Client example: `client/src/index.ts`
