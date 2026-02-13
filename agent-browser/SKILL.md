---
name: agent-browser
description: Automates browser interactions for web testing, form filling, screenshots, and data extraction. Use when the user needs to navigate websites, interact with web pages, fill forms, take screenshots, test web applications, or extract information from web pages.
allowed-tools: Bash(agent-browser:*)
---

# Browser Automation with agent-browser

## Quick start

```bash
agent-browser open <url>        # Navigate to page
agent-browser snapshot -i       # Get interactive elements with refs
agent-browser click @e1         # Click element by ref
agent-browser fill @e2 "text"   # Fill input by ref
agent-browser close             # Close browser
```

## Core workflow

1. Navigate: `agent-browser open <url>`
2. Snapshot: `agent-browser snapshot -i` (returns elements with refs like `@e1`, `@e2`)
3. Interact using refs from the snapshot
4. Re-snapshot after navigation or significant DOM changes

## Commands

### Navigation

```bash
agent-browser open <url>      # Navigate to URL (aliases: goto, navigate)
                              # Supports: https://, http://, file://, about:, data://
                              # Auto-prepends https:// if no protocol given
agent-browser back            # Go back
agent-browser forward         # Go forward
agent-browser reload          # Reload page
agent-browser close           # Close browser (aliases: quit, exit)
agent-browser connect 9222    # Connect to browser via CDP port
```

### Snapshot (page analysis)

```bash
agent-browser snapshot            # Full accessibility tree
agent-browser snapshot -i         # Interactive elements only (recommended)
agent-browser snapshot -c         # Compact output
agent-browser snapshot -d 3       # Limit depth to 3
agent-browser snapshot -s "#main" # Scope to CSS selector
```

### Interactions (use @refs from snapshot)

```bash
agent-browser click @e1           # Click
agent-browser dblclick @e1        # Double-click
agent-browser focus @e1           # Focus element
agent-browser fill @e2 "text"     # Clear and type
agent-browser type @e2 "text"     # Type without clearing
agent-browser press Enter         # Press key (alias: key)
agent-browser press Control+a     # Key combination
agent-browser keydown Shift       # Hold key down
agent-browser keyup Shift         # Release key
agent-browser hover @e1           # Hover
agent-browser check @e1           # Check checkbox
agent-browser uncheck @e1         # Uncheck checkbox
agent-browser select @e1 "value"  # Select dropdown option
agent-browser select @e1 "a" "b"  # Select multiple options
agent-browser scroll down 500     # Scroll page (default: down 300px)
agent-browser scrollintoview @e1  # Scroll element into view (alias: scrollinto)
agent-browser drag @e1 @e2        # Drag and drop
agent-browser upload @e1 file.pdf # Upload files
```

### Get information

```bash
agent-browser get text @e1        # Get element text
agent-browser get html @e1        # Get innerHTML
agent-browser get value @e1       # Get input value
agent-browser get attr @e1 href   # Get attribute
agent-browser get title           # Get page title
agent-browser get url             # Get current URL
agent-browser get count ".item"   # Count matching elements
agent-browser get box @e1         # Get bounding box
agent-browser get styles @e1      # Get computed styles (font, color, bg, etc.)
```

### Check state

```bash
agent-browser is visible @e1      # Check if visible
agent-browser is enabled @e1      # Check if enabled
agent-browser is checked @e1      # Check if checked
```

### Screenshots & PDF

**CRITICAL: ALL screenshots MUST be saved to the `screenshots/` folder. Saving screenshots to the project root is FORBIDDEN.**

**Before capturing screenshots:**
1. Load the `screenshot-handling` skill: `load_skill("screenshot-handling")`
2. Create the `screenshots/` folder: `mkdir -p screenshots/`
3. Always include `screenshots/` in the screenshot path

```bash
# Create screenshots folder first (MANDATORY)
mkdir -p screenshots/

# Screenshot to stdout
agent-browser screenshot

# Save to file in screenshots/ folder (CORRECT)
agent-browser screenshot screenshots/verification.png
agent-browser screenshot screenshots/mainmenu-test.png
agent-browser screenshot screenshots/ui-validation.png

# Full page screenshot (also in screenshots/ folder)
agent-browser screenshot --full screenshots/full-page.png

# PDF output
agent-browser pdf output.pdf      # Save as PDF
```

**❌ FORBIDDEN - Never save to project root:**
```bash
# WRONG - Missing screenshots/ folder in path
agent-browser screenshot verification.png  # ❌ Saves to project root
agent-browser screenshot test.png            # ❌ Saves to project root
```

**✅ CORRECT - Always include screenshots/ in path:**
```bash
# RIGHT - Includes screenshots/ folder in path
mkdir -p screenshots/                        # ✅ Create folder first
agent-browser screenshot screenshots/verification.png  # ✅ Saves to screenshots/
```

**Reference**: See `screenshot-handling` skill for complete screenshot handling requirements and best practices.

**Screenshot path**: Use **project root or absolute path** for the screenshot directory so CWD does not cause wrong locations (e.g. ensure CWD is project root when saving to `screenshots/`).

#### Pre-completion (web tasks)

For **frontend/web tasks**: Do not skip browser verification. If you load agent-browser, you must use it for **at least one flow** that matches the task (open, navigate, submit, or capture) before the task can be marked complete, unless explicitly documented as impossible (e.g. backend down) with fallback. For **scaffold-only tasks**, at least open the app URL and capture one screenshot to confirm the shell renders.

### Video recording

```bash
agent-browser record start ./demo.webm    # Start recording (uses current URL + state)
agent-browser click @e1                   # Perform actions
agent-browser record stop                 # Stop and save video
agent-browser record restart ./take2.webm # Stop current + start new recording
```

Recording creates a fresh context but preserves cookies/storage from your session. If no URL is provided, it
automatically returns to your current page. For smooth demos, explore first, then start recording.

### Wait

```bash
agent-browser wait @e1                     # Wait for element
agent-browser wait 2000                    # Wait milliseconds
agent-browser wait --text "Success"        # Wait for text (or -t)
agent-browser wait --url "**/dashboard"    # Wait for URL pattern (or -u)
agent-browser wait --load networkidle      # Wait for network idle (or -l)
agent-browser wait --fn "window.ready"     # Wait for JS condition (or -f)
```

### Mouse control

```bash
agent-browser mouse move 100 200      # Move mouse
agent-browser mouse down left         # Press button
agent-browser mouse up left           # Release button
agent-browser mouse wheel 100         # Scroll wheel
```

### Semantic locators (alternative to refs)

```bash
agent-browser find role button click --name "Submit"
agent-browser find text "Sign In" click
agent-browser find text "Sign In" click --exact      # Exact match only
agent-browser find label "Email" fill "user@test.com"
agent-browser find placeholder "Search" type "query"
agent-browser find alt "Logo" click
agent-browser find title "Close" click
agent-browser find testid "submit-btn" click
agent-browser find first ".item" click
agent-browser find last ".item" click
agent-browser find nth 2 "a" hover
```

### Browser settings

```bash
agent-browser set viewport 1920 1080          # Set viewport size
agent-browser set device "iPhone 14"          # Emulate device
agent-browser set geo 37.7749 -122.4194       # Set geolocation (alias: geolocation)
agent-browser set offline on                  # Toggle offline mode
agent-browser set headers '{"X-Key":"v"}'     # Extra HTTP headers
agent-browser set credentials user pass       # HTTP basic auth (alias: auth)
agent-browser set media dark                  # Emulate color scheme
agent-browser set media light reduced-motion  # Light mode + reduced motion
```

### Cookies & Storage

```bash
agent-browser cookies                     # Get all cookies
agent-browser cookies set name value      # Set cookie
agent-browser cookies clear               # Clear cookies
agent-browser storage local               # Get all localStorage
agent-browser storage local key           # Get specific key
agent-browser storage local set k v       # Set value
agent-browser storage local clear         # Clear all
```

### Network

```bash
agent-browser network route <url>              # Intercept requests
agent-browser network route <url> --abort      # Block requests
agent-browser network route <url> --body '{}'  # Mock response
agent-browser network unroute [url]            # Remove routes
agent-browser network requests                 # View tracked requests
agent-browser network requests --filter api    # Filter requests
```

### Tabs & Windows

```bash
agent-browser tab                 # List tabs
agent-browser tab new [url]       # New tab
agent-browser tab 2               # Switch to tab by index
agent-browser tab close           # Close current tab
agent-browser tab close 2         # Close tab by index
agent-browser window new          # New window
```

### Frames

```bash
agent-browser frame "#iframe"     # Switch to iframe
agent-browser frame main          # Back to main frame
```

### Dialogs

```bash
agent-browser dialog accept [text]  # Accept dialog
agent-browser dialog dismiss        # Dismiss dialog
```

### JavaScript

```bash
agent-browser eval "document.title"   # Run JavaScript
```

## Global options

```bash
agent-browser --session <name> ...    # Isolated browser session
agent-browser --json ...              # JSON output for parsing
agent-browser --headed ...            # Show browser window (not headless)
agent-browser --full ...              # Full page screenshot (-f)
agent-browser --cdp <port> ...        # Connect via Chrome DevTools Protocol
agent-browser --proxy <url> ...       # Use proxy server
agent-browser --headers <json> ...    # HTTP headers scoped to URL's origin
agent-browser --executable-path <p>   # Custom browser executable
agent-browser --extension <path> ...  # Load browser extension (repeatable)
agent-browser --help                  # Show help (-h)
agent-browser --version               # Show version (-V)
agent-browser <command> --help        # Show detailed help for a command
```

### Proxy support

```bash
agent-browser --proxy http://proxy.com:8080 open example.com
agent-browser --proxy http://user:pass@proxy.com:8080 open example.com
agent-browser --proxy socks5://proxy.com:1080 open example.com
```

## Environment variables

```bash
AGENT_BROWSER_SESSION="mysession"            # Default session name
AGENT_BROWSER_EXECUTABLE_PATH="/path/chrome" # Custom browser path
AGENT_BROWSER_EXTENSIONS="/ext1,/ext2"       # Comma-separated extension paths
AGENT_BROWSER_STREAM_PORT="9223"             # WebSocket streaming port
AGENT_BROWSER_HOME="/path/to/agent-browser"  # Custom install location (for daemon.js)
```

## Example: Form submission

```bash
agent-browser open https://example.com/form
agent-browser snapshot -i
# Output shows: textbox "Email" [ref=e1], textbox "Password" [ref=e2], button "Submit" [ref=e3]

agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --load networkidle
agent-browser snapshot -i  # Check result
```

## Example: Authentication with saved state

```bash
# Login once
agent-browser open https://app.example.com/login
agent-browser snapshot -i
agent-browser fill @e1 "username"
agent-browser fill @e2 "password"
agent-browser click @e3
agent-browser wait --url "**/dashboard"
agent-browser state save auth.json

# Later sessions: load saved state
agent-browser state load auth.json
agent-browser open https://app.example.com/dashboard
```

## Sessions (parallel browsers)

```bash
agent-browser --session test1 open site-a.com
agent-browser --session test2 open site-b.com
agent-browser session list
```

## JSON output (for parsing)

Add `--json` for machine-readable output:

```bash
agent-browser snapshot -i --json
agent-browser get text @e1 --json
```

## Debugging

```bash
agent-browser --headed open example.com   # Show browser window
agent-browser --cdp 9222 snapshot         # Connect via CDP port
agent-browser connect 9222                # Alternative: connect command
agent-browser console                     # View console messages
agent-browser console --clear             # Clear console
agent-browser errors                      # View page errors
agent-browser errors --clear              # Clear errors
agent-browser highlight @e1               # Highlight element
agent-browser trace start                 # Start recording trace
agent-browser trace stop trace.zip        # Stop and save trace
agent-browser record start ./debug.webm   # Record video from current page
agent-browser record stop                 # Save recording
```

## Deep-dive documentation

For detailed patterns and best practices, see:

| Reference | Description |
|-----------|-------------|
| [references/snapshot-refs.md](references/snapshot-refs.md) | Ref lifecycle, invalidation rules, troubleshooting |
| [references/session-management.md](references/session-management.md) | Parallel sessions, state persistence, concurrent scraping |
| [references/authentication.md](references/authentication.md) | Login flows, OAuth, 2FA handling, state reuse |
| [references/video-recording.md](references/video-recording.md) | Recording workflows for debugging and documentation |
| [references/proxy-support.md](references/proxy-support.md) | Proxy configuration, geo-testing, rotating proxies |

## Ready-to-use templates

Executable workflow scripts for common patterns:

| Template | Description |
|----------|-------------|
| [templates/form-automation.sh](templates/form-automation.sh) | Form filling with validation |
| [templates/authenticated-session.sh](templates/authenticated-session.sh) | Login once, reuse state |
| [templates/capture-workflow.sh](templates/capture-workflow.sh) | Content extraction with screenshots |

Usage:
```bash
./templates/form-automation.sh https://example.com/form
./templates/authenticated-session.sh https://app.example.com/login
./templates/capture-workflow.sh https://example.com ./output
```

## Command Batching Patterns

### Pattern 1: Batch Multiple Eval Commands

**Group related eval commands into single browser calls:**

```bash
# ❌ INEFFICIENT: Multiple separate browser calls
agent-browser eval "window.__TEST__.commands.gameState()"
agent-browser eval "window.__TEST__.commands.setLevel(2)"
agent-browser eval "window.__TEST__.commands.setScore(100)"

# ✅ EFFICIENT: Single eval block
agent-browser eval "
  const state = window.__TEST__.commands.gameState();
  window.__TEST__.commands.setLevel(2);
  window.__TEST__.commands.setScore(100);
  return state;
"
```

### Pattern 2: URL Handling

**Always quote URLs in shell commands:**

```bash
# ❌ WRONG: Unquoted URL (may break with query params)
agent-browser open http://localhost:5173?scene=GameScene

# ✅ CORRECT: Quoted URL
agent-browser open "http://localhost:5173?scene=GameScene"
```

## Test Seam Discovery Patterns

### Pattern 1: Standard Readiness Check

**Check for test seam availability with exponential backoff:**

```bash
# Standard readiness check
wait_for_test_seam() {
  for i in {1..5}; do
    if agent-browser eval "typeof window.__TEST__ !== 'undefined' && typeof window.__TEST__.commands !== 'undefined'"; then
      echo "Test seam ready"
      return 0
    fi
    sleep $((2 ** $i))  # Exponential backoff: 2s, 4s, 8s, 16s, 32s
  done
  return 1
}
```

### Pattern 2: Test Seam Command Discovery

**Discover available test seam commands:**

```bash
# Discover available commands
agent-browser eval "
  if (window.__TEST__ && window.__TEST__.commands) {
    Object.keys(window.__TEST__.commands).join(', ')
  } else {
    'Test seam not available'
  }
"
```

## Viewport Testing Strategies

### Pattern 1: Minimum and Maximum First

**Test minimum and maximum viewport sizes first, intermediate only if issues found:**

```bash
# ✅ EFFICIENT: Test critical sizes first
agent-browser open "http://localhost:5173?scene=GameScene"
agent-browser viewport 500 400      # Minimum
agent-browser snapshot
agent-browser viewport 1920 1080    # Maximum
agent-browser snapshot

# Only test intermediate if issues found
if [ "$issues_found" = "true" ]; then
  agent-browser viewport 1024 768
  agent-browser snapshot
fi
```

### Pattern 2: Single Session for Multiple Viewports

**Reuse single browser session for multiple viewport tests:**

```bash
# ✅ EFFICIENT: Single session
agent-browser open "http://localhost:5173?scene=GameScene"
agent-browser viewport 500 400
agent-browser snapshot
agent-browser viewport 1024 768
agent-browser snapshot
agent-browser viewport 1920 1080
agent-browser snapshot
agent-browser close
```

## Connection Resilience Patterns

### Pattern 1: Health Check Before Operations

**Verify server health before browser operations:**

```bash
# Health check before opening browser
curl -f http://localhost:5173 > /dev/null 2>&1
if [ $? -eq 0 ]; then
  agent-browser open "http://localhost:5173?scene=GameScene"
else
  echo "Server not ready, waiting..."
  sleep 2
  # Retry or start server
fi
```

### Pattern 2: Retry on Connection Failure

**Retry browser operations on connection failure:**

```bash
# Retry pattern
max_retries=3
attempt=0

while [ $attempt -lt $max_retries ]; do
  if agent-browser open "http://localhost:5173?scene=GameScene"; then
    break
  fi
  attempt=$((attempt + 1))
  sleep $((2 ** $attempt))  # Exponential backoff
done
```

## Phaser Game Testing

**PRIMARY METHOD**: Use test seam commands (`window.__TEST__.commands`)

For Phaser games:
- DOM text search doesn't work with canvas-rendered text
- Keyboard events may not register with canvas focus
- Always check for test seam availability first
- Test seams are the ONLY reliable way to interact with Phaser canvas games

**Pattern**:
```bash
# Check for test seam
agent-browser eval "window.__TEST__ && window.__TEST__.commands"

# Use test seam commands
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser eval "window.__TEST__.commands.setTimer(5)"
```

**If test seam sceneKey doesn't update on transitions**, use console logs as fallback verification.

**Command Batching Examples**:
```bash
# Batch related commands in single eval
agent-browser eval "
  window.__TEST__.commands.setTimer(5);
  window.__TEST__.commands.collectAnyCoin();
  window.__TEST__.gameState();
"

# Or use sequential commands with minimal waits
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser wait 500  # Minimal wait for transition
agent-browser eval "window.__TEST__.commands.setTimer(5)"
agent-browser eval "window.__TEST__.gameState()"
```

**Efficient Waiting Strategies**:
- **Avoid fixed sleeps**: Use polling with timeout instead
- **Poll for readiness**: `agent-browser eval "new Promise(r => { const c = () => window.__TEST__?.ready ? r(true) : setTimeout(c, 100); c(); })"`
- **Wait for specific state**: `agent-browser eval "new Promise(r => { const c = () => window.__TEST__?.gameState().scene === 'GameScene' ? r(true) : setTimeout(c, 100); c(); })"`
- **Use minimal waits**: 500ms for scene transitions, 100ms for state checks

**Port Detection Helpers**:
- Reference `dev-server-port-detection` skill for port discovery patterns
- Check `vite.config.ts` for `server.port` before opening browser
- Use discovered port in browser URL: `http://localhost:${PORT}`

**Common Test Workflow Templates**:

**Template 1: Scene Navigation**
```bash
# Navigate to scene
agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"
agent-browser wait 500
agent-browser eval "window.__TEST__.gameState()"
```

**Template 2: Game State Verification**
```bash
# Get initial state
agent-browser eval "const state = window.__TEST__.gameState(); JSON.stringify(state)"
# Perform action
agent-browser eval "window.__TEST__.commands.collectAnyCoin()"
# Verify state change
agent-browser eval "const newState = window.__TEST__.gameState(); JSON.stringify(newState)"
```

**Template 3: Timer Testing**
```bash
# Set timer to low value
agent-browser eval "window.__TEST__.commands.setTimer(3)"
# Wait for expiration (or fast forward)
agent-browser eval "window.__TEST__.commands.fastForwardTimer(5)"
# Verify game over
agent-browser eval "window.__TEST__.gameState().gameOver"
```

See `references/phaser-testing.md` for detailed test seam patterns.
See `phaser-test-seam-patterns` skill for complete command reference by scene.

### Phaser Drag Simulation

**PREFERRED METHOD**: Use test seam drag commands when available.

```bash
# Drag slider using test seam (recommended)
agent-browser eval "window.__TEST__.commands.simulateDragSlider('music', 0, 1, 10)"
```

**Alternative**: Use mouse commands when test seam unavailable.

**Mouse Command Pattern for Slider Dragging**:
```bash
# Step 1: Get slider handle position via test seam
HANDLE_POS=$(agent-browser eval "window.__TEST__.commands.getMusicSliderHandlePosition()" --json)

# Step 2: Extract coordinates (adjust JSON parsing based on actual structure)
# Note: May need to convert scene coordinates to screen coordinates
START_X=$(echo $HANDLE_POS | jq -r '.x')
START_Y=$(echo $HANDLE_POS | jq -r '.y')

# Step 3: Calculate end position (example: move 100 pixels right)
END_X=$((START_X + 100))

# Step 4: Simulate drag sequence with intermediate steps
agent-browser mouse move $START_X $START_Y
agent-browser mouse down left
agent-browser mouse move $((START_X + 25)) $START_Y  # Step 1
agent-browser mouse move $((START_X + 50)) $START_Y  # Step 2
agent-browser mouse move $((START_X + 75)) $START_Y  # Step 3
agent-browser mouse move $END_X $START_Y              # Final
agent-browser mouse up left
```

**Coordinate Conversion Considerations**:
- Phaser uses scene coordinates, browser uses screen coordinates
- Canvas may be scaled/positioned (Phaser.Scale.FIT mode)
- Account for canvas offset and scale when converting
- Test seam commands handle conversion automatically

**Best Practices**:
1. **Prefer test seam commands** - No coordinate conversion needed
2. **Use appropriate step count** - 5-10 steps for most cases
3. **Test edge cases** - 0% to 100%, reverse drags, rapid drags
4. **Verify during drag** - Check intermediate values and UI updates

**Example: Testing Slider Drag**:
```bash
# Navigate to settings
agent-browser eval "window.__TEST__.commands.clickSettings()"
agent-browser wait 500

# Drag music slider from 0% to 100%
agent-browser eval "window.__TEST__.commands.simulateDragSlider('music', 0, 1, 10)"

# Verify final value
agent-browser eval "window.__TEST__.commands.getMusicVolume()"
```

See `phaser-test-seam-patterns/references/drag-simulation.md` for comprehensive guide.

## Connection Health Checks

### Verify Connection Before Operations

**Always verify browser connection before critical operations**:

```bash
# Health check before opening browser
check_browser_connection() {
  # Check if browser process is running
  if ! pgrep -f "agent-browser" > /dev/null; then
    echo "Browser not running, starting..."
    # Start browser or reconnect
  fi
  
  # Check if browser responds
  if ! agent-browser get url > /dev/null 2>&1; then
    echo "Browser not responding, reconnecting..."
    agent-browser connect 9222
  fi
}
```

### Connection Verification Patterns

**Pattern 1: Pre-Operation Health Check**

```bash
# Verify connection before operation
if agent-browser get url > /dev/null 2>&1; then
  echo "Connection healthy"
  agent-browser open "http://localhost:5173"
else
  echo "Connection lost, reconnecting..."
  agent-browser connect 9222
  agent-browser open "http://localhost:5173"
fi
```

**Pattern 2: Retry on Connection Failure**

```bash
# Retry connection with exponential backoff
connect_with_retry() {
  local max_retries=3
  local attempt=0
  
  while [ $attempt -lt $max_retries ]; do
    if agent-browser open "http://localhost:5173"; then
      echo "Connected successfully"
      return 0
    fi
    
    attempt=$((attempt + 1))
    local delay=$((2 ** $attempt))  # 2s, 4s, 8s
    echo "Retry $attempt after $delay seconds"
    sleep $delay
  done
  
  echo "Connection failed after $max_retries attempts"
  return 1
}
```

### Connection Recovery Strategies

**Strategy 1: Automatic Reconnection**

```bash
# Auto-reconnect on connection loss
ensure_connection() {
  if ! agent-browser get url > /dev/null 2>&1; then
    echo "Reconnecting..."
    agent-browser connect 9222
    sleep 2
  fi
}
```

**Strategy 2: Connection State Tracking**

```bash
# Track connection state
CONNECTION_STATE="unknown"

check_connection() {
  if agent-browser get url > /dev/null 2>&1; then
    CONNECTION_STATE="connected"
  else
    CONNECTION_STATE="disconnected"
  fi
}
```

## Timeout Handling

**Default timeout**: 10 seconds for all commands

**Configurable timeout per command type**:
- Text search: 10s
- Element interaction: 10s
- Navigation: 15s
- Test seam commands: 5s

**Expected wait times for different operations**:
- Simple page load: 10-30 seconds
- Complex page load with assets: 30-60 seconds
- Scene initialization (Phaser): 5-15 seconds
- Test seam readiness: 5-10 seconds
- Complex interactions: 15-45 seconds
- Screenshot capture: 2-5 seconds
- Form submission: 10-30 seconds
- Navigation transitions: 5-20 seconds

### Timeout Configuration Examples

**For Complex Operations (60-90 seconds)**:

```bash
# Complex browser operation with 90 second timeout
agent-browser wait 90000
agent-browser eval "window.__TEST__.commands.complexOperation()"
```

**For Standard Operations (30-60 seconds)**:

```bash
# Standard operation with 60 second timeout
agent-browser wait 60000
agent-browser eval "window.__TEST__.commands.standardOperation()"
```

**For Quick Operations (10-30 seconds)**:

```bash
# Quick operation with 30 second timeout
agent-browser wait 30000
agent-browser eval "window.__TEST__.commands.quickOperation()"
```

### Progress Indicators for Long-Running Operations

**Log progress during long operations**:

```bash
# Long operation with progress logging
echo "Starting complex operation (may take 60-90 seconds)..."
agent-browser eval "
  new Promise((resolve) => {
    const maxWait = 90000;
    const start = Date.now();
    const logInterval = 10000;  // Log every 10 seconds
    
    const check = () => {
      const elapsed = Date.now() - start;
      
      // Log progress every 10 seconds
      if (elapsed % logInterval < 1000) {
        console.log(`Progress: ${Math.floor(elapsed / 1000)}s / ${maxWait / 1000}s`);
      }
      
      if (window.__TEST__?.ready) {
        resolve(true);
      } else if (elapsed > maxWait) {
        resolve(false);
      } else {
        setTimeout(check, 1000);
      }
    };
    check();
  })
"
```

Set explicit timeout for commands to prevent hanging:
```bash
agent-browser wait 10000  # 10 second timeout
```

## Hot Module Replacement (HMR) Verification

### Verify HMR Has Applied Changes

**After code changes, verify HMR has applied changes before testing**:

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

**Pattern 3: Force Refresh if HMR Not Working**

```bash
# If HMR isn't working, force browser refresh
if ! agent-browser eval "import.meta.hot"; then
  echo "HMR not available, forcing refresh"
  agent-browser reload
  agent-browser wait 5000  # Wait for reload
fi
```

### Fallback When HMR Isn't Available

**If HMR isn't working**:

1. **Force browser refresh**:
   ```bash
   agent-browser reload
   agent-browser wait 5000
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

## Browser Lifecycle Management

### When to Reload vs Restart Browser

**Reload browser when**:
- HMR didn't apply changes
- Page state is stale
- Need fresh page load
- Cache issues suspected

**Restart browser when**:
- Browser crashes or hangs
- Connection lost
- Multiple reload attempts failed
- Browser state is corrupted

### Detect Stale Browser State

**Check for stale browser state**:

```bash
# Check if browser state is stale
check_browser_state() {
  # Check last reload time
  local last_reload=$(agent-browser eval "window.__HMR_LAST_RELOAD__ || 0")
  local now=$(date +%s)000  # Convert to milliseconds
  local age=$((now - last_reload))
  
  # If last reload was more than 30 seconds ago, state may be stale
  if [ $age -gt 30000 ]; then
    echo "Browser state may be stale (last reload: ${age}ms ago)"
    return 1
  fi
  
  return 0
}
```

### Cleanup Patterns for Browser Sessions

**Pattern 1: Clean Session Before Testing**

```bash
# Clean browser session before testing
clean_browser_session() {
  agent-browser storage local clear
  agent-browser cookies clear
  agent-browser reload
  agent-browser wait 2000
}
```

**Pattern 2: Save and Restore State**

```bash
# Save browser state
save_browser_state() {
  agent-browser storage local > browser-state.json
  agent-browser cookies > browser-cookies.json
}

# Restore browser state
restore_browser_state() {
  # Restore cookies
  while IFS= read -r cookie; do
    agent-browser cookies set $(echo $cookie | cut -d'=' -f1) $(echo $cookie | cut -d'=' -f2)
  done < browser-cookies.json
  
  # Restore localStorage
  # (Implementation depends on agent-browser capabilities)
}
```

**Pattern 3: Session Cleanup After Testing**

```bash
# Cleanup after testing
cleanup_after_test() {
  # Close browser if needed
  agent-browser close
  
  # Or just clear state
  agent-browser storage local clear
  agent-browser cookies clear
}
```

## Retry Logic

Retry failed commands up to 3 times with exponential backoff:
- First retry: 1 second delay
- Second retry: 2 second delay
- Third retry: 4 second delay

**Pattern**:
```bash
# Retry with delays
agent-browser click @e1 || sleep 1 && agent-browser click @e1 || sleep 2 && agent-browser click @e1
```

## Fallback Strategies

When primary method fails, use fallback methods in order:

1. **Primary**: Test seam commands (for Phaser games)
2. **Secondary**: Console log verification
3. **Tertiary**: Screenshot comparison
4. **Last resort**: Code review + TypeScript compilation

**Don't abandon testing on first failure** - try alternative methods.

## Cache Management

**Always use hard refresh in development:**

```bash
# Use hard refresh to bypass cache
agent-browser open http://localhost:3000
agent-browser reload  # Hard refresh
```

**Clear cache before testing code changes:**

```bash
# Clear browser cache
agent-browser storage local clear
agent-browser cookies clear
agent-browser reload
```

**Use cache-busting URL parameters when needed:**

```bash
# Add cache-busting parameter
agent-browser open "http://localhost:3000?v=$(date +%s)"
```

**Document Vite caching behavior:**

```markdown
# Vite Development Server Caching
- Vite caches modules in development
- Use hard refresh (Cmd+Shift+R / Ctrl+Shift+R) to clear cache
- Or add ?v=timestamp to URL for cache-busting
```

## Viewport Testing Patterns

**Test at minimum 3 viewport sizes:**

```bash
# Test at different viewport sizes
agent-browser set viewport 1920 1080  # Desktop
agent-browser set viewport 1366 768   # Laptop
agent-browser set viewport 375 667    # Mobile
```

**Use window.innerWidth/innerHeight for viewport detection:**

```bash
# Check viewport dimensions
agent-browser eval "window.innerWidth"
agent-browser eval "window.innerHeight"
```

**Distinguish between canvas dimensions and viewport size:**

```bash
# Canvas dimensions (game world)
agent-browser eval "window.__TEST__?.gameState().canvasWidth"

# Viewport size (browser window)
agent-browser eval "window.innerWidth"
```

**Document Phaser-specific viewport patterns:**

```markdown
# Phaser Viewport Patterns
- Canvas size: Game world dimensions (e.g., 800x600)
- Viewport size: Browser window size (e.g., 1920x1080)
- Use window.innerWidth/innerHeight for viewport
- Use camera dimensions for canvas size
```

## Wait Strategy Optimization

**Use simple property checks instead of Promise polling:**

```bash
# ❌ INEFFICIENT: Promise-based polling
agent-browser eval "
  new Promise((resolve) => {
    const check = () => {
      if (window.__TEST__?.ready) {
        resolve(true);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  })
"

# ✅ EFFICIENT: Simple property check
agent-browser eval "window.__TEST__?.ready || false"
```

**Implement timeout-based checks (max 5 seconds):**

```bash
# Timeout-based check
agent-browser eval "
  (() => {
    const maxWait = 5000;
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      if (window.__TEST__?.ready) return true;
    }
    return false;
  })()
"
```

**Avoid complex Promise chains in eval:**

```bash
# ❌ AVOID: Complex Promise chains
agent-browser eval "
  new Promise((resolve) => {
    // Complex chain...
  }).then(...).catch(...)
"

# ✅ PREFER: Simple checks
agent-browser eval "window.__TEST__?.sceneKey === 'GameScene'"
```

**Document efficient test seam interaction:**

```markdown
# Efficient Test Seam Interaction
- Use direct property checks: window.__TEST__?.sceneKey
- Avoid Promise polling for readiness
- Use Object.keys() for command verification
- Minimal waits: 500ms for transitions, 100ms for checks
```

## Fallback Testing Methods

**Manual browser verification checklists:**

```markdown
# Manual Browser Verification Checklist
1. Open browser manually
2. Navigate to http://localhost:3000
3. Open console (F12)
4. Verify window.__TEST__ exists
5. Test commands manually
6. Document results
```

**Console log verification patterns:**

```bash
# Check console logs
agent-browser console

# Filter for specific logs
agent-browser console | grep -i "error\|warn"
```

**Screenshot comparison utilities:**

```bash
# Create screenshots folder first
mkdir -p screenshots/

# Take screenshots for comparison (in screenshots/ folder)
agent-browser screenshot screenshots/before.png
# Make changes
agent-browser screenshot screenshots/after.png
# Compare visually or with imgdiff
```

**Error detection workflows:**

```bash
# Check for errors
agent-browser errors

# Clear and check again
agent-browser errors --clear
agent-browser reload
agent-browser errors
```
