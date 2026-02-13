---
name: dev-server-lifecycle-management
description: Standardized patterns for detecting, starting, monitoring, and maintaining development server connections. Use when connecting to dev servers, managing server lifecycle, or when connection losses occur during browser automation. Eliminates 2-3 minutes of server management overhead per task.
---

# Dev Server Lifecycle Management

## Overview

Standardized patterns for detecting, starting, monitoring, and maintaining development server connections. Prevents connection losses and reduces server management overhead.

**Problem**: Connection losses during browser automation cause retries and delays, port detection requires multiple attempts, no health checks before critical browser operations, server restart logic is inconsistent.

**Solution**: Port detection strategy, health check patterns, connection resilience, startup verification.

**Impact**: Eliminate 2-3 minutes of server management overhead per task, reduce connection-related failures.

## Port Detection Strategy

### Pattern 1: Check Configuration Files

**Check common ports or read from config files (package.json, vite.config, etc.):**

```typescript
// Check vite.config.ts
const viteConfig = read_file('vite.config.ts');
const port = extractPortFromViteConfig(viteConfig);
// Example: server: { port: 5173 }

// Check package.json
const packageJson = read_file('package.json');
const port = extractPortFromPackageJson(packageJson);
// Example: "dev": "vite --port 5173"
```

### Pattern 2: Use Process Inspection

**Use `lsof` or process inspection to find running dev servers:**

```bash
# Check for running processes on common ports
lsof -i :3000
lsof -i :5173
lsof -i :8080

# Or check for node/vite processes
ps aux | grep -E "(vite|node|npm)" | grep -v grep
```

### Pattern 3: Cache Port Information

**Cache port information for subsequent operations:**

```typescript
// Cache port for session
let cachedPort: number | null = null;

function getDevServerPort(): number {
  if (cachedPort) {
    return cachedPort;
  }
  
  // Detect port (check config, processes, etc.)
  cachedPort = detectPort();
  return cachedPort;
}
```

## Health Check Patterns

### Pattern 1: Verify HTTP Response

**Verify server responds to HTTP requests before browser operations:**

```bash
# Health check with curl
curl -f http://localhost:5173 > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "Server is ready"
else
  echo "Server not ready"
fi
```

### Pattern 2: Check DOM Elements

**Check for specific DOM elements or API endpoints indicating readiness:**

```bash
# Check for specific DOM element
agent-browser open "http://localhost:5173"
agent-browser eval "
  const ready = document.querySelector('#app') !== null;
  ready
"

# Or check for API endpoint
curl -f http://localhost:5173/api/health
```

### Pattern 3: Exponential Backoff

**Implement exponential backoff for readiness checks (1s, 2s, 4s):**

```typescript
async function waitForServerReady(url: string, maxAttempts = 5): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, 8s, 16s
    await sleep(delay);
    
    const isReady = await checkServerHealth(url);
    if (isReady) {
      return true;
    }
  }
  return false;
}
```

## Connection Resilience

### Pattern 1: Track Server State

**Track dev server PID/port in agent state:**

```typescript
// Track server state
const serverState = {
  pid: null as number | null,
  port: null as number | null,
  startTime: null as Date | null,
};

function startDevServer(): void {
  const process = spawn('npm', ['run', 'dev']);
  serverState.pid = process.pid;
  serverState.port = detectPort();
  serverState.startTime = new Date();
}
```

### Pattern 2: Automatic Restart

**Implement automatic restart on connection failure:**

```typescript
async function ensureServerRunning(): Promise<void> {
  const isRunning = await checkServerHealth(`http://localhost:${serverState.port}`);
  
  if (!isRunning) {
    console.log('Server not running, restarting...');
    stopDevServer();
    startDevServer();
    await waitForServerReady(`http://localhost:${serverState.port}`);
  }
}
```

### Pattern 3: Cache Browser Session State

**Cache browser session state to resume after connection loss:**

```typescript
// Cache browser session state
const browserState = {
  url: null as string | null,
  viewport: null as { width: number; height: number } | null,
  cookies: null as any,
};

function saveBrowserState(): void {
  browserState.url = getCurrentUrl();
  browserState.viewport = getViewport();
  browserState.cookies = getCookies();
}

function restoreBrowserState(): void {
  if (browserState.url) {
    agent-browser open browserState.url;
    agent-browser viewport browserState.viewport.width browserState.viewport.height;
    // Restore cookies if needed
  }
}
```

## Startup Verification

### Pattern 1: Wait for Full Readiness

**Wait for server to be fully ready (not just started):**

```typescript
async function startDevServerWithVerification(): Promise<void> {
  // Start server
  startDevServer();
  
  // Wait for full readiness
  const isReady = await waitForServerReady(`http://localhost:${serverState.port}`);
  
  if (!isReady) {
    throw new Error('Server failed to become ready');
  }
  
  console.log('Server is ready');
}
```

### Pattern 2: Verify Test Seam Commands

**Verify test seam commands are available before proceeding:**

```bash
# Verify test seam is available
agent-browser open "http://localhost:5173?scene=GameScene"
agent-browser eval "
  const hasTestSeam = typeof window.__TEST__ !== 'undefined' && 
                      typeof window.__TEST__.commands !== 'undefined';
  hasTestSeam
"

# Wait for test seam with retry
for i in {1..5}; do
  if agent-browser eval "typeof window.__TEST__ !== 'undefined'"; then
    echo "Test seam ready"
    break
  fi
  sleep $((2 ** $i))  # Exponential backoff: 2s, 4s, 8s, 16s, 32s
done
```

### Pattern 3: Event-Based Readiness Checks

**Use event-based readiness checks instead of fixed polling:**

```typescript
// Event-based readiness check
function waitForServerReadyEvent(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const maxWait = 30000; // 30 seconds
    const startTime = Date.now();
    
    const checkInterval = setInterval(async () => {
      if (Date.now() - startTime > maxWait) {
        clearInterval(checkInterval);
        reject(new Error('Server readiness timeout'));
        return;
      }
      
      const isReady = await checkServerHealth(url);
      if (isReady) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 1000); // Check every second
  });
}
```

## Hot Module Replacement (HMR) Verification Patterns

### Verify HMR Has Applied Changes

**After code changes, verify HMR has applied changes before testing:**

```bash
# Step 1: Wait for compilation success
# Check terminal output or build status
# (This is done outside browser)

# Step 2: Verify browser has reloaded
agent-browser eval "
  const lastReload = window.__HMR_LAST_RELOAD__ || 0;
  const now = Date.now();
  const timeSinceReload = now - lastReload;
  timeSinceReload < 5000 ? 'Recently reloaded' : 'Stale state'
"

# Step 3: Wait for scene/component initialization if needed
agent-browser eval "
  window.__TEST__?.ready ? 'Ready' : 'Not ready'
"

# Step 4: THEN capture screenshots or run tests
agent-browser screenshot screenshots/verification.png
```

### HMR Verification Patterns

**Pattern 1: Check HMR Status**

```bash
# Check if HMR is working
agent-browser eval "
  if (import.meta.hot) {
    'HMR available'
  } else {
    'HMR not available'
  }
"
```

**Pattern 2: Wait for HMR Completion**

```bash
# Wait for HMR to apply changes
wait_for_hmr() {
  local max_wait=20  # 20 seconds max
  local elapsed=0
  
  while [ $elapsed -lt $max_wait ]; do
    # Check if page has reloaded
    if agent-browser eval "window.__HMR_LAST_RELOAD__ && (Date.now() - window.__HMR_LAST_RELOAD__) < 5000"; then
      echo "HMR applied"
      return 0
    fi
    
    sleep 1
    elapsed=$((elapsed + 1))
  done
  
  echo "HMR timeout"
  return 1
}
```

**Pattern 3: Verify HMR Before Testing**

```typescript
async function verifyHMRBeforeTesting(url: string): Promise<boolean> {
  // Step 1: Check HMR availability
  const hasHMR = await checkHMRStatus(url);
  if (!hasHMR) {
    console.warn('HMR not available, forcing refresh');
    await forceBrowserRefresh(url);
    return true;
  }
  
  // Step 2: Wait for HMR completion
  const hmrApplied = await waitForHMRCompletion(url);
  if (!hmrApplied) {
    console.warn('HMR timeout, forcing refresh');
    await forceBrowserRefresh(url);
    return true;
  }
  
  // Step 3: Verify changes applied
  const changesApplied = await verifyChangesApplied(url);
  return changesApplied;
}
```

### How to Wait for HMR Completion Before Testing

**Workflow for HMR verification:**

1. **Wait for compilation success**:
   ```bash
   # Check terminal output or build status
   # Wait for "compiled successfully" message
   ```

2. **Verify browser has reloaded**:
   ```bash
   agent-browser eval "
     const lastReload = window.__HMR_LAST_RELOAD__ || 0;
     const now = Date.now();
     const timeSinceReload = now - lastReload;
     timeSinceReload < 5000 ? 'Recently reloaded' : 'Stale state'
   "
   ```

3. **Wait for scene/component initialization**:
   ```bash
   agent-browser eval "
     window.__TEST__?.ready ? 'Ready' : 'Not ready'
   "
   ```

4. **Then capture screenshots or run tests**:
   ```bash
   agent-browser screenshot screenshots/verification.png
   ```

### Fallback When HMR Isn't Available

**If HMR isn't working:**

1. **Force browser refresh**:
   ```bash
   agent-browser reload
   agent-browser wait 5000  # Wait for reload
   ```

2. **Restart dev server if needed**:
   ```bash
   # Restart dev server
   pkill -f "vite\|npm.*dev"
   npm run dev &
   sleep 5
   ```

3. **Verify changes are in codebase**:
   ```bash
   # Check file was actually modified
   grep -r "expected change" src/
   ```

### HMR Verification in Complete Workflow

**Add HMR verification to server startup workflow:**

```typescript
// Step 1: Detect or start server
const port = getDevServerPort();
if (!isServerRunning(port)) {
  startDevServer();
  await waitForServerReady(`http://localhost:${port}`);
}

// Step 2: Health check
const isHealthy = await checkServerHealth(`http://localhost:${port}`);
if (!isHealthy) {
  throw new Error('Server health check failed');
}

// Step 3: Verify HMR (if applicable)
const hasHMR = await verifyHMRStatus(`http://localhost:${port}`);
if (hasHMR) {
  console.log('HMR available');
} else {
  console.warn('HMR not available, will use full refresh');
}

// Step 4: Verify test seam (if applicable)
const hasTestSeam = await verifyTestSeam(`http://localhost:${port}`);
if (!hasTestSeam) {
  console.warn('Test seam not available, proceeding anyway');
}

// Step 5: Cache state
serverState.port = port;
serverState.startTime = new Date();
serverState.hmrAvailable = hasHMR;

// Step 6: Proceed with browser operations
agent-browser open `http://localhost:${port}?scene=GameScene`;
```

## Complete Workflow Example

### Example: Start and Verify Dev Server

```typescript
// Step 1: Detect or start server
const port = getDevServerPort();
if (!isServerRunning(port)) {
  startDevServer();
  await waitForServerReady(`http://localhost:${port}`);
}

// Step 2: Health check
const isHealthy = await checkServerHealth(`http://localhost:${port}`);
if (!isHealthy) {
  throw new Error('Server health check failed');
}

// Step 3: Verify test seam (if applicable)
const hasTestSeam = await verifyTestSeam(`http://localhost:${port}`);
if (!hasTestSeam) {
  console.warn('Test seam not available, proceeding anyway');
}

// Step 4: Cache state
serverState.port = port;
serverState.startTime = new Date();

// Step 5: Proceed with browser operations
agent-browser open `http://localhost:${port}?scene=GameScene`;
```

## Best Practices

1. **Detect port first**: Check config files before assuming defaults
2. **Health check**: Verify server responds before browser operations
3. **Exponential backoff**: Use 1s, 2s, 4s delays for readiness checks
4. **Cache port**: Store port for session reuse
5. **Track state**: Monitor PID/port in agent state
6. **Auto-restart**: Restart on connection failure
7. **Verify readiness**: Wait for full server readiness
8. **Event-based checks**: Use event-based instead of fixed polling
9. **Verify HMR**: Check HMR status and wait for completion before testing
10. **Fallback to refresh**: Force browser refresh if HMR isn't available

## Common Pitfalls

### Pitfall 1: Assuming Default Port

**Problem**: Assuming port 3000 without checking

**Solution**: Check config files first

```bash
# ❌ WRONG: Assume port 3000
agent-browser open "http://localhost:3000"

# ✅ CORRECT: Detect port first
PORT=$(detect_port.sh)
agent-browser open "http://localhost:$PORT"
```

### Pitfall 2: No Health Check

**Problem**: Opening browser before server is ready

**Solution**: Health check before browser operations

```bash
# ❌ WRONG: No health check
agent-browser open "http://localhost:5173"

# ✅ CORRECT: Health check first
curl -f http://localhost:5173 > /dev/null 2>&1
if [ $? -eq 0 ]; then
  agent-browser open "http://localhost:5173"
fi
```

### Pitfall 3: Fixed Polling

**Problem**: Using fixed polling intervals

**Solution**: Use exponential backoff

```typescript
// ❌ WRONG: Fixed polling
for (let i = 0; i < 10; i++) {
  await sleep(1000); // Fixed 1s delay
  if (isReady()) break;
}

// ✅ CORRECT: Exponential backoff
for (let i = 0; i < 5; i++) {
  await sleep(Math.pow(2, i) * 1000); // 1s, 2s, 4s, 8s, 16s
  if (isReady()) break;
}
```

## Integration with Other Skills

- **`dev-server-port-detection`**: Uses port detection patterns
- **`agent-browser`**: Coordinates with browser automation
- **`phaser-game-testing`**: Verifies test seam availability

## Related Skills

- `dev-server-port-detection` - Port detection strategies
- `agent-browser` - Browser automation patterns
- `phaser-game-testing` - Test seam verification

## Remember

1. **Detect port**: Check config files before assuming defaults
2. **Health check**: Verify server responds before browser operations
3. **Exponential backoff**: Use 1s, 2s, 4s for readiness checks
4. **Cache port**: Store for session reuse
5. **Track state**: Monitor PID/port in agent state
6. **Auto-restart**: Restart on connection failure
7. **Verify readiness**: Wait for full server readiness
8. **Event-based**: Use event-based instead of fixed polling
