#!/bin/bash
# Detect development server port from multiple sources
# Returns port number or exits with error code

# Common ports to try (in order)
COMMON_PORTS=(3000 5173 8080 5174)

# Check vite.config.ts for server.port
if [ -f "vite.config.ts" ] || [ -f "vite.config.js" ]; then
    PORT=$(grep -E "port\s*:" vite.config.* 2>/dev/null | head -1 | grep -oE "[0-9]+" | head -1)
    if [ -n "$PORT" ]; then
        echo "$PORT"
        exit 0
    fi
fi

# Check package.json for PORT in scripts
if [ -f "package.json" ]; then
    PORT=$(grep -E "PORT[=:][0-9]+" package.json 2>/dev/null | grep -oE "[0-9]+" | head -1)
    if [ -n "$PORT" ]; then
        echo "$PORT"
        exit 0
    fi
fi

# Check running processes
for port in "${COMMON_PORTS[@]}"; do
    if lsof -i :$port >/dev/null 2>&1 || netstat -an 2>/dev/null | grep -q ":$port.*LISTEN"; then
        echo "$port"
        exit 0
    fi
done

# Try common ports with connectivity test
for port in "${COMMON_PORTS[@]}"; do
    if curl -s --max-time 1 "http://localhost:$port" >/dev/null 2>&1; then
        echo "$port"
        exit 0
    fi
done

# Not found
exit 1
