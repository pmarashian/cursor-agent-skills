---
name: monorepo-backend-layout
description: For repos with a backend/ (or similar) directory, treat that as the app root. Create all API routes and library code under backend/src/app/... and backend/src/lib/... Never create src/ at the repository root for backend routes. Use before creating any API or lib file to prevent 404s and wrong-path creation.
---

# Monorepo / Backend Layout

For repositories with a `backend/` (or similar) directory, that directory is the backend app root.

## Checklist Before Creating Any API or Lib File

1. **Identify the backend app root** (e.g. `backend/`).
2. **Create files only under that root**:
   - API routes: `backend/src/app/api/...`
   - Library code: `backend/src/lib/...`
   - (Or the project's actual layout—e.g. `backend/src/app/...` for Next.js App Router.)

## Rules

- **Never** create `src/` at the repository root for backend routes or libs.
- **Never** put routes under `backend/lib/` if the project uses `backend/src/lib/`.
- Confirm the path convention (e.g. `backend/src/lib/` not `backend/lib/`) before creating files.

## Why This Matters

Creating routes or libs in the wrong place leads to 404s, repeated server restarts, and long debugging cycles. A single explicit layout rule prevents wrong-path creation.

## Integration

- Reference in pre-implementation-check or progress when working in monorepos.
- Link from `create-next-app-existing-dir` when scaffolding backend in an existing directory.
