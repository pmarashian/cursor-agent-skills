---
name: create-next-app-existing-dir
description: When running create-next-app in an existing directory (e.g. backend/): remove or rename existing package.json if the tool refuses to overwrite; prefer absolute path for target; for API-only setups, strip UI (layout, page, globals, public) and clear .next before re-running type-check. Use when scaffolding Next.js in an existing folder.
---

# Create-Next-App in Existing Directory

When running create-next-app **inside an existing directory** (e.g. `backend/`):

## Checklist

1. **Existing package.json**: If the tool refuses to overwrite, remove or rename the existing `package.json` in that directory before re-running.
2. **Target path**: Prefer an **absolute path** for the target directory to avoid `cd`/sandbox issues.
3. **API-only setup**: For API-only backends, after scaffolding: strip UI (layout, page, globals, public) as needed and clear `.next` before re-running type-check.

## Optional

- Link to **monorepo-backend-layout** so the agent treats the backend directory as the app root.

## Why This Matters

Tasks have lost ~20–25 seconds to create-next-app retries (existing package.json, then path issues). A short checklist prevents repeated failures.
