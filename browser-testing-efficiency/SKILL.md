---
name: browser-testing-efficiency
description: Document when to use test seams vs. DOM inspection, provide patterns for batching related test commands, create reusable test helper functions, and document efficient waiting strategies. Use when testing Phaser games or web applications to reduce execution time and improve reliability.
---

# Browser Testing Efficiency

## Overview

Optimize browser testing workflows by choosing the right testing method, batching commands, and using efficient waiting strategies. Reduce execution time from 30-60% of total time to 10-20% through better patterns.

## When to Use Test Seams vs. DOM Inspection

### Use Test Seams When

- **Phaser/canvas games**: Test seams are ONLY reliable method
- **Canvas-rendered content**: DOM text search doesn't work
- **Game state access**: Need to check game state, not DOM
- **Scene navigation**: Use test seam commands for transitions
- **Deterministic testing**: Need controlled game state

**Example**:
```bash
# ✅ CORRECT: Use test seam for Phaser game
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser eval "window.__TEST__.gameState()"
```

### Use DOM Inspection When

- **DOM-based UI**: Menus, buttons, forms
- **Text content**: HTML text (not canvas-rendered)
- **Form inputs**: Text fields, checkboxes, dropdowns
- **Standard web apps**: Not canvas-based games

**Example**:
```bash
# ✅ CORRECT: Use DOM for standard web UI
agent-browser snapshot -i
agent-browser click @e1
agent-browser fill @e2 "text"
```

## Command Batching Patterns

### Pattern 1: Batch Related Commands

**Instead of sequential commands**, batch related operations:

```bash
# ❌ INEFFICIENT: Multiple sequential commands
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser wait 2000
agent-browser eval "window.__TEST__.commands.setTimer(5)"
agent-browser eval "window.__TEST__.commands.collectAnyCoin()"
agent-browser eval "window.__TEST__.gameState()"

# ✅ EFFICIENT: Batch related commands
agent-browser eval "
  window.__TEST__.commands.clickStartGame();
  setTimeout(() => {
    window.__TEST__.commands.setTimer(5);
    window.__TEST__.commands.collectAnyCoin();
    const state = window.__TEST__.gameState();
    console.log('State:', state);
  }, 500);
"
```

### Pattern 2: Single Eval for Multiple Operations

**Combine multiple operations** in single eval:

```bash
# ✅ EFFICIENT: Single eval for multiple operations
agent-browser eval "
  const test = window.__TEST__;
  test.commands.setTimer(5);
  test.commands.collectAnyCoin();
  const state = test.gameState();
  return JSON.stringify(state);
"
```

### Pattern 3: Minimal Waits Between Commands

**Use minimal waits** instead of fixed 2-second waits:

```bash
# ❌ INEFFICIENT: Fixed 2-second wait
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser wait 2000

# ✅ EFFICIENT: Minimal wait (500ms for scene transition)
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser wait 500
```

## Efficient Waiting Strategies

### Avoid Fixed Sleeps

**Don't use fixed sleeps** - use polling with timeout:

```bash
# ❌ INEFFICIENT: Fixed sleep
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser wait 2000  # Fixed wait, may be too long or too short

# ✅ EFFICIENT: Poll for readiness
agent-browser eval "
  new Promise((resolve) => {
    const check = () => {
      if (window.__TEST__?.ready && window.__TEST__.sceneKey === 'GameScene') {
        resolve(true);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
    setTimeout(() => resolve(false), 5000); // Timeout after 5s
  })
"
```

### Poll for Specific State

**Wait for specific condition** instead of fixed time:

```bash
# ✅ EFFICIENT: Wait for specific state
agent-browser eval "
  new Promise((resolve) => {
    const check = () => {
      const state = window.__TEST__?.gameState();
      if (state?.scene === 'GameScene' && state?.score > 0) {
        resolve(state);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  })
"
```

### Use Minimal Waits

**Use minimal waits** for known operations:

- **Scene transitions**: 500ms
- **State checks**: 100ms
- **DOM updates**: 200ms
- **Network requests**: Poll until complete

```bash
# ✅ EFFICIENT: Minimal wait for scene transition
agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"
agent-browser wait 500  # Minimal wait for transition
```

## Reusable Test Helper Functions

### Helper 1: Wait for Test Seam Ready

```bash
# Reusable function
waitForTestSeam() {
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
      setTimeout(() => resolve(false), 5000);
    })
  "
}
```

### Helper 2: Navigate and Wait

```bash
# Reusable function
navigateToScene(sceneKey) {
  agent-browser eval "window.__TEST__.commands.goToScene('${sceneKey}')"
  agent-browser wait 500
  agent-browser eval "
    new Promise((resolve) => {
      const check = () => {
        if (window.__TEST__?.sceneKey === '${sceneKey}') {
          resolve(true);
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    })
  "
}
```

### Helper 3: Get Game State

```bash
# Reusable function
getGameState() {
  agent-browser eval "JSON.stringify(window.__TEST__.gameState())"
}
```

## Scene Navigation Workflows

### Workflow 1: Navigate to Game

```bash
# Efficient navigation
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser wait 500  # Minimal wait
agent-browser eval "window.__TEST__.sceneKey"  # Verify
```

### Workflow 2: Test Game Flow

```bash
# Batch game flow testing
agent-browser eval "
  const test = window.__TEST__;
  test.commands.setTimer(5);
  test.commands.collectAnyCoin();
  const state = test.gameState();
  return JSON.stringify({ score: state.score, timer: state.timer });
"
```

### Workflow 3: Verify State Changes

```bash
# Efficient state verification
agent-browser eval "
  const before = window.__TEST__.gameState();
  window.__TEST__.commands.collectAnyCoin();
  const after = window.__TEST__.gameState();
  return JSON.stringify({ before: before.score, after: after.score });
"
```

## Test Script Organization

### Organize by Feature

**Group related tests** together:

```bash
# Test coin collection feature
test_coin_collection() {
  agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"
  agent-browser wait 500
  agent-browser eval "
    const before = window.__TEST__.gameState().score;
    window.__TEST__.commands.collectAnyCoin();
    const after = window.__TEST__.gameState().score;
    return after > before;
  "
}
```

### Use Test Templates

**Create reusable test templates** for common scenarios:

```bash
# Template: Test scene navigation
test_scene_navigation(fromScene, toScene) {
  agent-browser eval "window.__TEST__.commands.goToScene('${fromScene}')"
  agent-browser wait 500
  agent-browser eval "window.__TEST__.commands.goToScene('${toScene}')"
  agent-browser wait 500
  agent-browser eval "window.__TEST__.sceneKey === '${toScene}'"
}
```

## Performance Optimization

### Reduce Command Count

**Before**: 15-30 sequential commands (30-60 seconds)
**After**: 5-10 batched commands (10-20 seconds)

**Savings**: 50-70% reduction in execution time

### Use Polling Instead of Fixed Waits

**Before**: Fixed 2-second waits (may be too long or too short)
**After**: Polling with 100ms checks (faster, more reliable)

**Savings**: 1-2 seconds per wait operation

### Batch Related Operations

**Before**: Multiple sequential commands
**After**: Single eval with multiple operations

**Savings**: 50-80% reduction in command overhead

## Viewport Testing Optimization

### Pattern 1: Test Matrix Strategy

**Test minimum and maximum viewport sizes first, intermediate only if issues found:**

```bash
# ✅ EFFICIENT: Test critical sizes first
agent-browser open "http://localhost:5173?scene=GameScene"
agent-browser viewport 500 400      # Minimum
agent-browser snapshot
agent-browser viewport 1920 1080    # Maximum
agent-browser snapshot

# Only test intermediate sizes if issues found
if [ "$issues_found" = "true" ]; then
  agent-browser viewport 1024 768   # Intermediate
  agent-browser snapshot
fi
```

### Pattern 2: Batch Viewport Tests

**Set viewport → test all scenarios → capture screenshots:**

```bash
# ✅ EFFICIENT: Batch viewport tests in single session
agent-browser open "http://localhost:5173?scene=GameScene"

# Test all viewports in sequence
for viewport in "500 400" "1024 768" "1920 1080"; do
  agent-browser viewport $viewport
  agent-browser snapshot
done

agent-browser close
```

### Pattern 3: Screenshot Batching

**Capture multiple screenshots first, then batch analyze:**

```bash
# ✅ EFFICIENT: Capture all screenshots first
agent-browser open "http://localhost:5173?scene=GameScene"
agent-browser viewport 500 400
agent-browser snapshot -o screenshots/viewport-500x400.png
agent-browser viewport 1024 768
agent-browser snapshot -o screenshots/viewport-1024x768.png
agent-browser viewport 1920 1080
agent-browser snapshot -o screenshots/viewport-1920x1080.png
agent-browser close

# Then analyze all screenshots together
analyze_screenshots screenshots/viewport-*.png
```

## Test Seam Discovery Optimization

### Pattern 1: Standard Readiness Check

**Use standard readiness check patterns with exponential backoff:**

```bash
# Standard readiness check with exponential backoff
wait_for_test_seam() {
  local max_attempts=5
  local attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    local delay=$((2 ** $attempt))  # 1s, 2s, 4s, 8s, 16s
    sleep $delay
    
    if agent-browser eval "typeof window.__TEST__ !== 'undefined' && typeof window.__TEST__.commands !== 'undefined'"; then
      echo "Test seam ready"
      return 0
    fi
    
    attempt=$((attempt + 1))
  done
  
  echo "Test seam not available after $max_attempts attempts"
  return 1
}
```

### Pattern 2: Document Common Command Patterns

**Document common test seam command structures:**

```bash
# Common test seam command patterns
# Scene navigation
window.__TEST__.commands.goToScene('GameScene')
window.__TEST__.commands.clickStartGame()

# Game state
window.__TEST__.gameState()
window.__TEST__.commands.setTimer(5)
window.__TEST__.commands.setScore(100)

# Game actions
window.__TEST__.commands.collectAnyCoin()
window.__TEST__.commands.movePlayer(x, y)
```

## Parallel Browser Session Patterns

### Pattern 1: Independent Test Cases

**Use parallel browser sessions for independent test cases:**

```bash
# ✅ EFFICIENT: Parallel sessions for independent tests
agent-browser --session test1 open "http://localhost:5173?scene=GameScene"
agent-browser --session test2 open "http://localhost:5173?scene=MainMenu"

# Run tests in parallel
agent-browser --session test1 eval "window.__TEST__.commands.setTimer(5)"
agent-browser --session test2 eval "window.__TEST__.commands.clickStartGame()"

# Close sessions
agent-browser --session test1 close
agent-browser --session test2 close
```

## Best Practices

1. **Use test seams for Phaser games**: DOM inspection doesn't work
2. **Batch related commands**: Reduce command count
3. **Use polling instead of fixed waits**: Faster and more reliable
4. **Use minimal waits**: 500ms for transitions, 100ms for checks
5. **Create reusable helpers**: Reduce code duplication
6. **Organize by feature**: Group related tests together
7. **Test viewport matrix**: Minimum and maximum first, intermediate only if needed
8. **Batch viewport tests**: Single session for multiple viewports
9. **Batch screenshots**: Capture all first, analyze together
10. **Optimize test seam discovery**: Use exponential backoff

## Resources

- `agent-browser` skill - Browser automation commands
- `phaser-test-seam-patterns` skill - Test seam patterns
- `phaser-game-testing` skill - Phaser testing methodology
- `dev-server-lifecycle-management` skill - Server connection management
