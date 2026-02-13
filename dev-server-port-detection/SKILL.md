---
name: dev-server-port-detection
description: Automatically detect development server ports from configuration files, running processes, or terminal output. Use when starting browser testing, connecting to dev servers, or when port configuration is unclear. Checks vite.config.ts, package.json, running processes, and terminal output to find the actual port in use.
---

# Dev Server Port Detection

## Overview

Detect the development server port before opening browser connections. Prevents wasted time from port confusion and failed connection attempts.

## Detection Workflow

1. **Check configuration files** (fastest)
   - `vite.config.ts`: Look for `server.port` configuration
   - `package.json`: Check scripts for `PORT` environment variable

2. **Check running processes**
   - Use `lsof -i :PORT` or `netstat` to find listening ports
   - Check `ps` output for node/vite processes

3. **Parse terminal output**
   - Look for "Local:" or "Network:" lines in terminal output
   - Extract port from URLs like `http://localhost:3000`

4. **Try common ports sequentially** (fallback)
   - Try 3000, 5173, 8080, 5174 with timeout
   - Use curl or similar to test connectivity

5. **Cache discovered port** for session reuse

## Quick Detection Script

Use `scripts/detect_port.sh` for automated detection:

```bash
./scripts/detect_port.sh
```

Returns port number or exits with error code if not found.

## Port Detection Patterns

See `references/port-detection-patterns.md` for detailed patterns for:
- Vite (default 5173, configurable)
- Webpack (default 8080)
- Next.js (default 3000)
- Create React App (default 3000)
- Other build tools

## Best Practices

- Always detect port before opening browser
- Don't assume default ports (3000, 5173, etc.)
- Cache port for session to avoid repeated detection
- Use timeout when testing ports to avoid hanging

## Resources

- `scripts/detect_port.sh` - Executable port detection script
- `references/port-detection-patterns.md` - Detailed patterns for different build tools
