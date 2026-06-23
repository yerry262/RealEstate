# CLAUDE.md

Guidance for Claude Code (and the Ultracode GitHub workflow) when working in this repo.

## What this project is

Real Estate "deal finder" web app.

- **Frontend** — React 18 + Vite, Zustand for state, Tailwind CSS, Deck.GL + Mapbox
  for the map. Lives in `src/`. Deployed to GitHub Pages via
  `.github/workflows/deploy.yml`.
- **Backend** — Python FastAPI (async), SQLAlchemy 2.0 + GeoAlchemy2, asyncpg,
  Pandas/NumPy. Lives in `backend/`. Deployed to Railway.
- **Database** — PostgreSQL 16 + PostGIS. Local stack in `docker-compose.yml`.

## Commands

Frontend (Node 20):

```bash
npm ci            # install
npm run dev       # local dev server
npm run build     # production build -> dist/
npm run lint      # eslint (fails on warnings)
```

Backend (Python):

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload     # run API
pytest                        # tests
```

There is currently **no frontend test suite** — validate frontend changes with
`npm run build` and `npm run lint`.

## Ultracode orchestration

This repo runs an agentic GitHub workflow called **Ultracode**
(`.github/workflows/ultracode.yml`). It is triggered by `@ultracode` in
issues/PRs, or manually with a free-form task.

When you act as Ultracode, work **dynamically**: don't do everything in one
linear pass. Instead:

1. **Plan first.** Restate the task and break it into independent units of work.
2. **Delegate in parallel.** Spawn the specialized subagents in `.claude/agents/`
   for the parts that map cleanly onto them, launching independent subagents in
   the same turn so they run concurrently:
   - `frontend-react` — React/Vite/Tailwind/Deck.GL UI work under `src/`.
   - `backend-fastapi` — FastAPI/SQLAlchemy/Postgres work under `backend/`.
   - `repo-explorer` — read-only fan-out searches to locate code and answer
     "where / how" questions before editing.
   - `code-reviewer` — review the resulting diff for bugs and cleanups.
3. **Integrate and verify.** Assemble subagent output, then run the relevant
   build/lint/test commands above before declaring done.
4. **Report** what changed and what was verified.

Scale the number of subagents to the task — a one-line fix doesn't need a fleet;
a multi-surface feature does. Prefer giving each subagent a self-contained,
non-overlapping slice so their file edits don't collide.

## Conventions

- Match surrounding code style; don't introduce new frameworks or formatters.
- Keep frontend (`src/`) and backend (`backend/`) changes scoped to their area
  unless the task explicitly spans both.
- Never commit secrets. Frontend reads `VITE_MAPBOX_TOKEN` / `VITE_API_URL` from
  CI secrets; backend reads its config from environment variables.
