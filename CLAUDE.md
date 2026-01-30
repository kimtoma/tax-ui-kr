# Taxes

Tax return PDF parser using Claude API and Bun.

## Stack

- Bun with HTML imports (React frontend)
- Anthropic SDK for PDF parsing
- Tailwind CSS v4
- Zod for schema validation

## Commands

- `bun run dev` — Start dev server with HMR
- `bun run build` — Production build

## Architecture

- `src/index.ts` — Bun.serve() routes
- `src/lib/parser.ts` — Claude API PDF parsing
- `src/lib/storage.ts` — Local file persistence
- `src/App.tsx` — React frontend entry

## Verification

After changes, run:
- `bun run build` — Verify build succeeds
- `bun test` — Run tests (if any)
