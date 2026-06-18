# Murmur

**An AI notetaker for real-world conversations.** Hit record in your browser, or
upload an audio file. Murmur transcribes it, labels who said what, and turns it
into a clean summary, a list of action items, and a mind map. Everything you
capture becomes searchable, and you can ask Murmur questions about it — then have
it draft the follow-ups, always behind an approval step.

Murmur is **software only**: capture is the browser microphone and file upload.
There is no hardware anywhere.

> **Brand & legal.** Murmur is its own brand with original copy and design. It
> clones product _functionality and UX patterns_, never another product's name,
> words, or assets. Recording-consent rules vary by location — Murmur shows a
> reminder before your first recording and you are responsible for obtaining
> consent. Summaries are information, not medical/legal/financial advice. Every
> outbound action (email/message/calendar) is approval-gated and never
> auto-sent.

## Build philosophy — mock-first, keys-last

Every external dependency (auth, database, object storage, STT, LLM, embeddings,
jobs, email, payments, calendar) sits behind an interface with a **mock/local
implementation**. The product is fully functional with deterministic local data
through Phase 17 and needs **no secrets**. Phases 18–20 swap the mocks for real
providers via `.env`. See [`MURMUR_BUILD_PLAN.md`](./MURMUR_BUILD_PLAN.md).

## Tech stack

| Layer             | Choice                                          |
| ----------------- | ----------------------------------------------- |
| Framework         | Next.js 15 (App Router) · React 19 · TypeScript |
| Styling / UI      | Tailwind CSS · shadcn/ui · Radix · lucide-react |
| Auth              | mock (dev) → Clerk                              |
| Database          | Postgres + pgvector (local Docker → Neon)       |
| ORM               | Drizzle                                         |
| Object storage    | local filesystem → Cloudflare R2                |
| Jobs + cron       | Inngest (local dev server → Inngest Cloud)      |
| STT + diarization | mock → Deepgram                                 |
| LLM               | mock → Anthropic Claude (+ OpenAI / Gemini)     |
| Embeddings        | mock → Voyage / OpenAI → pgvector               |
| Payments / email  | Stripe · Resend (approval-gated)                |

## Monorepo layout

```
murmur/
  apps/
    web/            # Next.js — marketing site, app, API routes, server actions
  packages/
    db/             # Drizzle schema, migrations, seed, db client
    ai/             # provider abstractions (STT/LLM/embeddings), prompts, templates
    jobs/           # Inngest functions: processing pipeline + cron
    mcp/            # OpenSwarm MCP server (Phase 20)
  .env.example
```

## Local development

**Prerequisites:** Node 20+, [pnpm](https://pnpm.io) 10+, and Docker (for the
local Postgres + pgvector database, added in Phase 4).

```bash
pnpm install                       # install the workspace
cp .env.example apps/web/.env.local  # local defaults run on mocks — no secrets
pnpm dev                           # start the Next.js app on http://localhost:3000
```

Later phases add: `docker compose up -d` (Postgres + pgvector), `pnpm db:migrate`
and `pnpm db:seed` (schema + deterministic fake recordings), and the Inngest dev
server for the background pipeline. The whole product runs locally with mock STT,
LLM, and embeddings returning deterministic data.

## Scripts (root)

| Script           | What it does                         |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Run the web app (`@murmur/web`)      |
| `pnpm build`     | Production build of the web app      |
| `pnpm typecheck` | `tsc --noEmit` across all workspaces |
| `pnpm lint`      | ESLint across all workspaces         |
| `pnpm format`    | Prettier write across the repo       |

## Provider modes

The mock vs. real adapter for each provider is chosen by env switches
(`AUTH_PROVIDER`, `STORAGE_PROVIDER`, `STT_PROVIDER`, `LLM_PROVIDER`,
`EMBEDDINGS_PROVIDER`). They default to `mock`/`local`. If a real provider is
selected but its key is missing, Murmur falls back to the mock adapter and logs a
TODO, so the app always boots.

## License

To be determined.
