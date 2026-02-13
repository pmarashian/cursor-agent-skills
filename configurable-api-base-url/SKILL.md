---
name: configurable-api-base-url
description: Configurable API base URL in frontend (e.g. Vite): single env variable (e.g. VITE_API_URL), shared API client that reads it, and all call sites use that client. Do not hardcode host/port in multiple files; do not create or commit .env—only .env.example and documentation. Use when adding or changing frontend API calls.
---

# Configurable API Base URL (Frontend)

Use a **single source of truth** for the API base URL in the frontend so port/host changes don't require editing many files.

## Steps

1. **Add** `VITE_API_URL` (or equivalent) to **`.env.example`** with a placeholder (e.g. `http://localhost:3000`).
2. **Create a shared client** (e.g. `src/utils/api.ts` or `api.ts`) that uses `import.meta.env.VITE_API_URL` for the base URL.
3. **Replace** direct `fetch`/axios calls with this client so all requests go through one place.
4. **Do not create or modify `.env`** in the repo. Document that users should copy `.env.example` to `.env` for local use.

## Do Not

- Hardcode the host/port in multiple files.
- Create or commit `.env` (only `.env.example` and docs).

## Integration

- Works with `environment-files` skill (no `.env` in repo, only `.env.example`).
