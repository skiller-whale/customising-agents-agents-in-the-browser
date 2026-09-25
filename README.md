# FinTech — banking for fish

A small, deliberately imperfect banking app, and a rig that lets a coding agent
drive it in a headless browser and show you what it saw.

## Start it

```bash
npm ci
npm run dev       # the app        → http://localhost:1002
npm run reports   # run reports    → http://localhost:1004
```

Log in with **finn@fintech.example** / **glub-glub-1** (there is an admin,
`gill@fintech.example` / `glub-glub-2`). The data lives in memory: restart the
server, or run `npm run seed`, and everything is back to how it started.

## Give the agent the browser

`.mcp.json` is already set up, so Claude Code picks up Playwright MCP on start.
The browser is **headless** (`--headless --isolated`) — nobody can watch it.
That is what the flight recorder is for.

Read the flags before you run anything. They decide what the agent can do, and
what it can show you.

## The flight recorder

`.claude/skills/flight-recorder/` tells the agent to leave a trail: a
**screenshot** of each meaningful step, logged with a one-line note by the
skill's own script:

```bash
node .claude/skills/flight-recorder/scripts/record.ts <run-id> <screenshot.png> "What this step shows"
```

That files the screenshot under `runs/<run-id>/`, appends a line to that run's
`steps.jsonl`, and rebuilds the report. Open **http://localhost:1004** and you
get a numbered screenshot trail for each run. Refresh while the agent works and
you can watch the run grow.

Ask for something and see:

> Log into FinTech and tell me what the app does.

## The app

| Page | |
|---|---|
| `/login` | log in with one of the test accounts above |
| `/` | balances and recent activity, with an Export CSV button |
| `/accounts/:id` | one account's full history |
| `/transfer` | move money between your own accounts |
| `/settings` | profile, and closing an account |

`POST /dev/reset` reseeds the data.

## Layout

```
app/server/     Hono app: routes, JSX views, in-memory store, seed data
app/client/     the two browser-side scripts (esbuild → public/js)
scripts/        client build and reseed helpers
.claude/skills/flight-recorder/
                the skill, and its recorder, report builder and report server
runs/           recorded runs (gitignored)
```

TypeScript throughout, ESM, no build step for the server — `tsx` runs it, and
the scripts run on Node's own type stripping (`node scripts/build-client.ts`).

## A warning worth taking seriously

This app is **deliberately buggy**, and one of its pages carries a harmless
prompt-injection payload for teaching purposes. Point agents at it on your own
machine, not at anything real.
