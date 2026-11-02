# Flashcards

Genera flashcard da appunti/PDF con Claude e ripassale con ripetizione spaziata (FSRS).

Stack: Next.js 16 (App Router) · TypeScript · Tailwind v4 · Drizzle ORM + libSQL (SQLite/Turso) · Auth.js v5 · ts-fsrs · Anthropic SDK.

## Setup locale

```bash
pnpm install
cp .env.example .env.local      # poi imposta AUTH_SECRET (openssl rand -base64 32) e ANTHROPIC_API_KEY
pnpm db:migrate                 # crea/aggiorna ./local.db
pnpm dev
```

## Script

| Script | |
|---|---|
| `pnpm dev` / `build` / `start` | Next.js |
| `pnpm lint` / `typecheck` / `test` | qualità |
| `pnpm db:generate` | genera una migrazione da `src/server/db/schema.ts` |
| `pnpm db:migrate` | applica le migrazioni al DB in `DATABASE_URL` |
| `pnpm db:studio` | Drizzle Studio |

Le istruzioni di deploy su Vercel + Turso verranno aggiunte allo step 7.
