---
name: backend-server-verification
description: Canonical flow for starting and verifying a backend dev server. Use before running API tests: check port, start from correct directory, confirm readiness via short-timeout health request. Prevents 60–90+ second curl timeouts and port-conflict misdiagnosis.
---

# Backend Server Verification

Before running any API tests against a backend, verify the server is actually running and reachable.

## Before Starting

1. **Check if target port is in use**: `lsof -i :PORT` (or equivalent).
2. **If in use**: Kill the process or document using an alternate port. Do not assume "server stuck" or blame Redis/OpenAI—port conflict is a common cause of failures.

## Start Command

- **Always use an explicit directory** so CWD is unambiguous across tool invocations.
- Example: `cd /absolute/path/to/backend && npm run dev` (prefer absolute path).

## After Start

1. **Wait briefly** (e.g. a few seconds for the process to bind).
2. **Confirm readiness**: `curl -f http://localhost:PORT/api/health --max-time 5`.
3. **If curl fails**: Read the terminal output for "port in use" or bind errors before retrying with long timeouts.

## Two-Step Pattern (Recommended)

- **Invocation 1**: Start the server (background or in a separate terminal).
- **Invocation 2**: Run curl with `--max-time 5` to verify; do not run long curls until health succeeds.

## Integration

- Use with `dev-server-lifecycle-management` and `port-conflict-resolution` for port detection and conflict handling.
- Use with `pre-flight-checklist` / `pre-implementation-check` for backend tasks.
