---
name: cors-cookie-auth
description: Cookie-based auth from a different origin (e.g. frontend on 3001, backend on 3000) requires Access-Control-Allow-Credentials true and a specific Access-Control-Allow-Origin (not *). If framework middleware does not apply to API routes, add CORS headers in the route handler. Use when debugging cross-origin cookie/session issues.
---

# CORS and Cookie-Based Auth (Cross-Origin)

For **cookie-based auth** when the frontend is on a different origin than the backend (e.g. frontend port 3001, backend port 3000):

## Backend Must Send

- **`Access-Control-Allow-Credentials: true`**
- **Specific `Access-Control-Allow-Origin`** (e.g. `http://localhost:3001`) — **not** `*`. With credentials, `*` is not allowed.

## If Middleware Doesn't Apply to API Routes

- Framework middleware (e.g. Next.js middleware) may not apply to API route responses.
- **Fallback**: Set CORS headers **in the API route handler** (or in a wrapper around the handler) so they appear on the response.

## Verify

- Use `curl -v -H 'Origin: http://localhost:3001' http://localhost:3000/api/...` and confirm `Access-Control-*` headers are present in the response.

## Why This Matters

Tasks have spent many steps editing middleware before finding that middleware was not affecting API responses; moving CORS and credentials into the route handler fixed the issue.
