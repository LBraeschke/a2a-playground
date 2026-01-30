# a2a-playground

Small Agent-to-Agent (A2A) playground with:

- `agent1/`: an Express-based A2A server that runs a “Cake Baker Assistant” powered by `@openai/agents`.
- `client/`: a minimal Node client that sends a message to the server.
- `agent1/db/data.db`: a local SQLite database holding the cake menu as `cake_name -> description`.

## Quick start (host)

### 1) Start the agent server

```bash
cd agent1
npm install
npm run start:watch
```

Server listens on `http://localhost:4000` and exposes `GET /health`.

### 2) Run the client

```bash
cd client
npm install
npm start
```

## Docker

From `agent1/`:

```bash
docker compose up --build
```

## Configuration

- `agent1/.env`: set `AI_API_KEY` (used as the `api-key` header for the Zeiss GenAI OpenAI-compatible endpoint).
- VS Code MCP: `.vscode/mcp.json` configures Context7 and a DBHub SQLite connection.

## Notes

- There are **two** Node projects (`agent1/` and `client/`). Run `npm` commands from the correct folder.
- `better-sqlite3` is a **native** module. Docker builds must include build tooling (already handled in `agent1/Dockerfile`).
