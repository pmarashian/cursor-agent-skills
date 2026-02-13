---
name: phaser-test-seam-patterns
description: Comprehensive guide to Phaser game test seam usage, including discovery, common commands, troubleshooting, and best practices. Use when testing Phaser games, interacting with canvas-rendered content, or when DOM-based testing fails. Test seams are the PRIMARY method for Phaser game testing - DOM text search does not work with canvas-rendered text.
---

# Phaser Test Seam Patterns

## Overview

Test seams (`window.__TEST__`) are the PRIMARY method for testing Phaser games. DOM-based interactions (text search, keyboard simulation) do not work reliably with canvas-rendered content.

## Discovery

**Always check for test seam before attempting DOM interactions**:

```javascript
if (window.__TEST__ && window.__TEST__.commands) {
  // Test seam available - use it
} else {
  // Test seam not available - check source code or add it
}
```

**Where to find test seams**:
- Check scene `create()` methods for `window.__TEST__` setup
- Look for `window.__TEST__.commands` in scene files
- Document discovered commands in progress.txt

## Direct Property Access Patterns (Preferred)

### Prefer Direct Property Checks Over Polling

**PREFERRED: Use direct property checks instead of polling readiness flags**

```bash
# ✅ CORRECT: Direct property check (immediate)
agent-browser eval "window.__TEST__?.sceneKey === 'GameScene'"
agent-browser eval "window.__TEST__?.commands?.clickStartGame"

# ❌ INEFFICIENT: Polling readiness flag
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
```

**Why Direct Property Access is Better**:
- **Immediate check**: No polling delay
- **More reliable**: Readiness flags may not be reliable
- **Simpler code**: No Promise chains
- **Faster execution**: No async overhead

### Direct Property Access Examples

**Example 1: Check Scene Key**

```bash
# ✅ CORRECT: Direct property check
agent-browser eval "window.__TEST__?.sceneKey || 'unknown'"

# ❌ INEFFICIENT: Polling ready flag
agent-browser eval "
  new Promise((resolve) => {
    const check = () => {
      if (window.__TEST__?.ready) {
        resolve(window.__TEST__.sceneKey);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  })
"
```

**Example 2: Check Command Availability**

```bash
# ✅ CORRECT: Direct property check
agent-browser eval "Object.keys(window.__TEST__?.commands || {}).includes('clickStartGame')"

# ❌ INEFFICIENT: Polling ready flag
agent-browser eval "
  new Promise((resolve) => {
    const check = () => {
      if (window.__TEST__?.ready) {
        resolve('clickStartGame' in window.__TEST__.commands);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  })
"
```

**Example 3: Get Game State**

```bash
# ✅ CORRECT: Direct property check
agent-browser eval "window.__TEST__?.gameState?.() || null"

# ❌ INEFFICIENT: Polling ready flag
agent-browser eval "
  new Promise((resolve) => {
    const check = () => {
      if (window.__TEST__?.ready) {
        resolve(window.__TEST__.gameState());
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  })
"
```

### Readiness Flag Reliability

**Important**: `window.__TEST__?.ready` may not be reliable. Prefer direct property checks:

```bash
# ✅ PREFERRED: Direct property check
agent-browser eval "window.__TEST__?.sceneKey || false"
agent-browser eval "Object.keys(window.__TEST__?.commands || {}).length > 0"

# ⚠️ LESS RELIABLE: Readiness flag
agent-browser eval "window.__TEST__?.ready || false"
```

**When Readiness Flags May Not Work**:
- Scene transitions (flag may lag)
- Complex initialization (flag may not update)
- Test seam setup issues (flag may not be set)

**Solution**: Use direct property checks instead

### Timeout Handling

**Include timeout handling (max 5 seconds) before fallback**:

```bash
# Timeout-based check with direct property access
check_test_seam_with_timeout() {
  local max_wait=5  # 5 seconds max
  local elapsed=0
  
  while [ $elapsed -lt $max_wait ]; do
    # Direct property check (not polling ready flag)
    if agent-browser eval "window.__TEST__?.sceneKey || false"; then
      echo "Test seam available"
      return 0
    fi
    
    sleep 1
    elapsed=$((elapsed + 1))
  done
  
  echo "Test seam not available after $max_wait seconds"
  return 1
}
```

**If test seam isn't available after timeout**:
1. Document limitation in progress.txt
2. Proceed with alternative verification (code review, TypeScript compilation)
3. Don't wait indefinitely - test seams may not be available in all contexts

## Discovery Techniques

### Technique 1: Source Code Search

**Search for test seam setup in source code**:

```bash
# Search for test seam setup
grep -r "window.__TEST__" src/
grep -r "__TEST__\.commands" src/
grep -r "TestManager" src/

# Search for scene create methods
grep -r "create\(\)" src/scenes/
```

**What to look for**:
- `window.__TEST__ = { ... }` - Test seam initialization
- `window.__TEST__.commands = { ... }` - Command definitions
- `TestManager` - Centralized test seam management
- Scene `create()` methods - Where test seams are set up

### Technique 2: Browser Inspection

**Inspect test seam in browser**:

```bash
# Check if test seam exists
agent-browser eval "typeof window.__TEST__ !== 'undefined'"

# List available commands
agent-browser eval "Object.keys(window.__TEST__?.commands || {})"

# Check current scene
agent-browser eval "window.__TEST__?.sceneKey"

# Get full test seam structure
agent-browser eval "JSON.stringify(window.__TEST__, null, 2)"
```

### Technique 3: Console Log Discovery

**Use console logs to discover test seam**:

```bash
# Check console for test seam logs
agent-browser console | grep -i "test\|__TEST__"

# Look for initialization logs
agent-browser console | grep -i "test seam\|testmanager"
```

### Technique 4: Framework-Specific Discovery

**Phaser 3 Games**:
- Check scene files for `window.__TEST__` setup
- Look for `TestManager` singleton pattern
- Check `create()` methods for test seam initialization

**React/Web Apps**:
- Check component files for test seam setup
- Look for test utilities or test helpers
- Check for test mode flags (`?test=1`)

### Technique 5: Unknown Test Seam API Discovery

**When test seam API is unknown**:

1. **Inspect structure**:
   ```bash
   agent-browser eval "Object.keys(window.__TEST__ || {})"
   ```

2. **List commands**:
   ```bash
   agent-browser eval "Object.keys(window.__TEST__?.commands || {})"
   ```

3. **Check function signatures**:
   ```bash
   agent-browser eval "window.__TEST__?.commands?.clickStartGame?.toString()"
   ```

4. **Document discovered API**:
   ```markdown
   ## Test Seam API Discovery
   
   **Available Commands**:
   - clickStartGame() - No parameters
   - setTimer(seconds) - Takes number parameter
   - gameState() - Returns object
   
   **Documented in**: progress.txt
   ```

### Graceful Degradation When Test Seams Unavailable

**If test seams aren't available**:

1. **Document limitation**:
   ```markdown
   ## Test Seam Limitation
   
   Test seam not available after 5 second timeout.
   Using alternative verification: TypeScript compilation + code review.
   ```

2. **Use alternative verification**:
   - TypeScript compilation check
   - Code review
   - DOM inspection (if applicable)
   - Screenshot comparison

3. **Proceed with caution**:
   - Note limitation in progress.txt
   - Assess risk of incomplete verification
   - Document fallback method used

## Common Commands

See `references/common-commands.md` for a catalog of common test seam commands.

Typical commands include:
- `clickStartGame()` - Navigate to game scene
- `movePlayerToExit()` - Complete level
- `setTimer(seconds)` - Manipulate timer
- `gameState()` - Access game state
- `collectAnyCoin()` - Test coin collection
- `simulateDragSlider()` - Simulate dragging sliders (Settings scene)

## Drag Simulation

For testing Phaser UI components that use pointer events (sliders, draggable objects), use drag simulation commands.

**Quick Start:**
```bash
# Drag music slider from 0% to 100%
agent-browser eval "window.__TEST__.commands.simulateDragSlider('music', 0, 1, 10)"
```

**Why drag simulation?**
- Programmatic value setting bypasses drag interaction flow
- Errors that only occur during dragging cannot be reproduced without simulation
- Tests actual pointer event handling (`pointerdown`, `pointermove`, `pointerup`)

See `references/drag-simulation.md` for comprehensive guide to drag simulation patterns, including:
- Test seam drag commands (recommended)
- Agent-browser mouse command patterns
- Coordinate conversion considerations
- Best practices and troubleshooting

## Known Issues

See `references/troubleshooting.md` for detailed troubleshooting.

**Key issues**:
- `sceneKey` may lag on scene transitions (use console logs as fallback)
- Test seams are created per-scene in `create()` method
- Wait for scene initialization before accessing test seam

## Best Practices

1. **Use direct property access** - Prefer `window.__TEST__?.sceneKey` over polling `window.__TEST__?.ready`
2. **Prefer test seam over keyboard simulation** - More reliable and faster
3. **Prefer standalone component test scenes for UI** - Test Phaser UI components in dedicated scenes (one scene per component, booted via `?scene=...`) rather than only on the full game/scene page; see **phaser-component-test-scenes** skill
4. **Create test seam helpers** for common game actions
5. **Document test seam commands** in progress.txt when discovered
6. **Use console logs as fallback** when sceneKey doesn't update
7. **Use timeout handling** - Max 5 seconds before fallback
8. **Discover test seam API** - Use discovery techniques when API is unknown
9. **Graceful degradation** - Use alternative verification when test seams unavailable

## Workflow

1. Check for `window.__TEST__` availability
2. If not available, check source code for test seam setup
3. Document available commands
4. Use test seam commands for testing
5. Use console logs as fallback verification

## Resources

- `references/test-seam-discovery.md` - How to find and use test seams
- `references/common-commands.md` - Catalog of common test seam commands
- `references/drag-simulation.md` - Comprehensive guide to drag simulation patterns
- `references/troubleshooting.md` - Known issues and solutions
