---
name: vite-agent
description: Guide for configuring Vite projects for AI agents. Use when setting up Vite development servers for agent-browser, Playwright, or other automated browser tools. Ensures proper server configuration to prevent unwanted browser windows from opening during agent automation.
---

# Vite Configuration for AI Agents

## Overview

When configuring Vite for use with AI agents (agent-browser, Playwright, or other automated browser tools), set `server.open: false` to prevent the development server from automatically opening browser windows during agent automation.

## Agent Browser Configuration

**Critical**: If the agent is using agent-browser or other agent browser tools, the Vite config **must** set `server.open: false` to prevent the server from continually opening browser windows.

### Example Configuration

```typescript
import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: false, // Required for agent browsers
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
```

## OS-Agnostic Configuration

For consistent agent automation across different operating systems, use OS-agnostic settings and avoid platform-specific commands.

### Required Server Settings

```typescript
server: {
  port: 3000,
  strictPort: true, // Required: fail fast if port occupied
  open: false // Required for agent browsers
}
```

**Why `strictPort: true` is critical:**
- Prevents "port hunting" behavior where Vite tries multiple ports
- Fails fast if the port is occupied, making issues immediately visible
- Essential for consistent agent automation that expects a specific port
- Without it, agents may connect to the wrong port or wait indefinitely

### Avoiding OS-Specific Commands

When writing scripts or automation that works with Vite:

- ❌ **Don't use**: GNU-specific `timeout` command (Linux-only)
- ✅ **Do use**: Node-based scripts or OS-agnostic alternatives
- ✅ **Example**: Use `wait-on` package instead of shell `timeout`:
  ```bash
  npm install -D wait-on
  # In package.json:
  "scripts": {
    "wait-for-dev": "wait-on http://localhost:3000"
  }
  ```

## Key Points

- **`server.open: false`** - Prevents automatic browser opening, essential for agent automation
- **`server.port`** - Specify a port for consistent agent access
- **`server.strictPort: true`** - Fail fast if port is occupied, prevents port hunting
- **`build.sourcemap: true`** - Helpful for debugging agent interactions
- **Path aliases** - Configure as needed for the project structure

## Port Configuration

**Default port**: 5173

**This project uses port 3000** - check `vite.config.ts` for actual port configuration.

**Always verify actual port** before browser connection:
- Check `vite.config.ts` for `server.port` configuration
- Check `package.json` for `PORT` environment variable
- Don't assume default ports (3000, 5173, etc.)

## Port Detection Patterns

**Reference**: See `dev-server-port-detection` skill for comprehensive port discovery patterns.

**Standard workflow**:
1. Check `vite.config.ts` for `server.port` configuration
2. Check `package.json` for `PORT` environment variable
3. Check running processes or terminal output for actual port
4. Use discovered port in browser commands

**Pattern**:
```bash
# Check vite.config.ts
grep -A 5 "server:" vite.config.ts

# Check package.json
grep -i "port" package.json

# Check running processes
lsof -i :3000 || lsof -i :5173
```

## Port Conflict Resolution

**If port is occupied**:
1. Check what process is using the port
2. Kill the process if it's an old dev server
3. Or use a different port in `vite.config.ts`

**Pattern**:
```bash
# Find process using port
lsof -i :3000

# Kill process (if it's an old dev server)
kill -9 <PID>
```

## Server Health Check Utilities

**Poll server until ready**:
```bash
# Wait for server to be ready
for i in {1..10}; do
  if curl -s http://localhost:3000 > /dev/null; then break; fi
  sleep 2
done
```

**Check server health endpoint** (if available):
```bash
curl http://localhost:3000/health
```

## Server Startup Verification Patterns

**Wait for "Local:" message** in terminal output before proceeding with browser testing.

**Pattern**:
```bash
# Start server
npm run dev &

# Wait for server ready message
# Look for "Local: http://localhost:3000" in output
```

**Implement retry logic with timeout** (max 30 seconds):
```bash
TIMEOUT=30
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  if curl -s http://localhost:3000 > /dev/null; then
    echo "Server is ready"
    break
  fi
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done
```

## Server Readiness

**Don't assume server is ready after `npm run dev`**

**Poll server health endpoint** until ready:
```bash
# Wait for server to be ready
for i in {1..10}; do
  if curl -s http://localhost:3000 > /dev/null; then break; fi
  sleep 2
done
```

**Wait for "Local:" message** in terminal output before proceeding with browser testing.

**Implement retry logic with timeout** (max 30 seconds).

## When to Apply

Always set `server.open: false` when:
- Using agent-browser for automation
- Using Playwright or other headless browser tools
- Running Vite in CI/CD environments
- Any scenario where automatic browser opening would interfere with agent workflows
