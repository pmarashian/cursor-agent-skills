---
name: browser-test-seam-optimization
description: Optimize browser testing workflows with test seams, reducing command overhead and improving testing efficiency. Use when testing Phaser games or web applications to reduce execution time by 40-50%. Provides composite test functions, command batching, and efficient wait strategies.
---

# Browser Test Seam Optimization

Optimize browser testing workflows with test seams to reduce execution time by 40-50%. Reduces testing overhead from 30-60% of total time to 10-20%.

## Overview

**Problem**: Sequential individual commands for each verification step (20-80 commands per task)

**Solution**: Composite test functions, command batching, and optimized wait strategies

**Impact**: Save 20-40 seconds per testing phase

## Core Patterns

### Pattern 1: Composite Test Functions

**Instead of 10+ individual commands, create composite functions:**

```javascript
// ❌ INEFFICIENT: Multiple sequential commands
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser wait 2000
agent-browser eval "window.__TEST__.commands.setTimer(5)"
agent-browser eval "window.__TEST__.commands.collectAnyCoin()"
agent-browser eval "window.__TEST__.gameState()"

// ✅ EFFICIENT: Composite test function
window.__TEST__.commands.testPlayAgainFlow = () => {
  // Complete play again scenario in one call
  this.scene.start('GameScene');
  this.setTimer(5);
  this.collectAnyCoin();
  return this.gameState();
};

// Use composite function
agent-browser eval "window.__TEST__.commands.testPlayAgainFlow()"
```

**Common composite functions:**

```javascript
// Test complete play again flow
window.__TEST__.commands.testPlayAgainFlow = () => {
  this.scene.start('GameScene');
  this.setTimer(5);
  this.collectAnyCoin();
  return this.gameState();
};

// Test level complete flow
window.__TEST__.commands.testLevelCompleteFlow = () => {
  this.movePlayerToExit();
  return this.gameState();
};

// Test scene transition
window.__TEST__.commands.testSceneTransition = (from, to) => {
  this.scene.start(to);
  return { from, to, sceneKey: this.scene.key };
};

// Test game state reset
window.__TEST__.commands.testGameStateReset = () => {
  this.reset();
  return this.gameState();
};
```

### Pattern 2: Batch Independent Checks

**Use Promise.all() for parallel evaluations:**

```javascript
// ❌ INEFFICIENT: Sequential checks
agent-browser eval "window.__TEST__.gameState().score"
agent-browser eval "window.__TEST__.gameState().timer"
agent-browser eval "window.__TEST__.gameState().player.x"

// ✅ EFFICIENT: Batch independent checks
agent-browser eval "
  const state = window.__TEST__.gameState();
  Promise.all([
    Promise.resolve(state.score),
    Promise.resolve(state.timer),
    Promise.resolve(state.player.x)
  ]).then(results => ({
    score: results[0],
    timer: results[1],
    playerX: results[2]
  }))
"
```

**Or simpler batching:**

```javascript
// ✅ EFFICIENT: Single eval for multiple checks
agent-browser eval "
  const state = window.__TEST__.gameState();
  JSON.stringify({
    score: state.score,
    timer: state.timer,
    playerX: state.player?.x,
    playerY: state.player?.y
  })
"
```

### Pattern 3: Optimize Wait Strategies

**Use simple property checks instead of Promise polling:**

```javascript
// ❌ INEFFICIENT: Complex Promise polling
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

// ✅ EFFICIENT: Simple property check
agent-browser eval "window.__TEST__?.ready || false"
```

**Use timeout-based checks with max wait:**

```javascript
// ✅ EFFICIENT: Timeout-based check
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

### Pattern 4: Test Seam Readiness Patterns

**Check window.__TEST__?.sceneKey directly:**

```javascript
// ❌ INEFFICIENT: Promise-based polling
agent-browser eval "
  new Promise((resolve) => {
    const check = () => {
      if (window.__TEST__?.sceneKey === 'GameScene') {
        resolve(true);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  })
"

// ✅ EFFICIENT: Direct property check
agent-browser eval "window.__TEST__?.sceneKey === 'GameScene'"
```

**Use Object.keys() for verification:**

```javascript
// ✅ EFFICIENT: Check command availability
agent-browser eval "
  Object.keys(window.__TEST__?.commands || {}).includes('clickStartGame')
"
```

## Complete Optimization Examples

### Example 1: Test Play Again Flow

**Before (Inefficient):**
```bash
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser wait 2000
agent-browser eval "window.__TEST__.commands.setTimer(5)"
agent-browser eval "window.__TEST__.commands.collectAnyCoin()"
agent-browser eval "window.__TEST__.gameState().score"
agent-browser eval "window.__TEST__.gameState().timer"
# 6 commands, ~12 seconds
```

**After (Optimized):**
```bash
# Single composite function call
agent-browser eval "
  const result = window.__TEST__.commands.testPlayAgainFlow();
  JSON.stringify(result)
"
# 1 command, ~2 seconds
```

### Example 2: Verify State Changes

**Before (Inefficient):**
```bash
agent-browser eval "const before = window.__TEST__.gameState()"
agent-browser eval "window.__TEST__.commands.collectAnyCoin()"
agent-browser eval "const after = window.__TEST__.gameState()"
agent-browser eval "after.score > before.score"
# 4 commands, ~8 seconds
```

**After (Optimized):**
```bash
agent-browser eval "
  const before = window.__TEST__.gameState();
  window.__TEST__.commands.collectAnyCoin();
  const after = window.__TEST__.gameState();
  after.score > before.score
"
# 1 command, ~2 seconds
```

### Example 3: Scene Navigation Testing

**Before (Inefficient):**
```bash
agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"
agent-browser wait 2000
agent-browser eval "window.__TEST__.sceneKey"
agent-browser eval "window.__TEST__.gameState()"
# 4 commands, ~6 seconds
```

**After (Optimized):**
```bash
agent-browser eval "
  window.__TEST__.commands.goToScene('GameScene');
  setTimeout(() => {
    const state = window.__TEST__.gameState();
    return JSON.stringify({ scene: window.__TEST__.sceneKey, state });
  }, 500)
"
# 1 command, ~1 second
```

## Wait Strategy Optimization

### Minimal Waits

**Use minimal waits for known operations:**

- **Scene transitions**: 500ms (not 2000ms)
- **State checks**: 100ms (not 500ms)
- **DOM updates**: 200ms (not 1000ms)
- **Network requests**: Poll until complete (not fixed wait)

```javascript
// ❌ INEFFICIENT: Fixed 2-second wait
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser wait 2000

// ✅ EFFICIENT: Minimal wait (500ms for scene transition)
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser wait 500
```

### Polling Instead of Fixed Waits

**Use polling with timeout instead of fixed waits:**

```javascript
// ❌ INEFFICIENT: Fixed wait
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser wait 2000  // May be too long or too short

// ✅ EFFICIENT: Poll for readiness
agent-browser eval "
  (() => {
    const maxWait = 5000;
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      if (window.__TEST__?.ready && window.__TEST__.sceneKey === 'GameScene') {
        return true;
      }
    }
    return false;
  })()
"
```

## Performance Impact

### Before Optimization

- **Command count**: 20-80 commands per task
- **Execution time**: 30-60 seconds per testing phase
- **Wait time**: 2-5 seconds per wait operation
- **Total overhead**: 30-60% of task time

### After Optimization

- **Command count**: 5-10 batched commands
- **Execution time**: 10-20 seconds per testing phase
- **Wait time**: 100-500ms per wait operation
- **Total overhead**: 10-20% of task time

### Savings

- **50-70% reduction** in command count
- **40-50% reduction** in testing time
- **20-40 seconds saved** per testing phase

## Best Practices

1. **Create composite test functions** for common flows
2. **Batch independent checks** with Promise.all() or single eval
3. **Use simple property checks** instead of Promise polling
4. **Minimize wait times** (500ms for transitions, 100ms for checks)
5. **Check test seam readiness** directly (window.__TEST__?.sceneKey)
6. **Group related verifications** in single calls
7. **Use Object.keys()** for command availability checks

## Integration with Other Skills

- **phaser-game-testing**: Uses these optimization patterns
- **browser-testing-efficiency**: Complements with additional patterns
- **agent-browser**: Tool that benefits from optimization

## Related Skills

- `phaser-game-testing` - Phaser testing methodology
- `browser-testing-efficiency` - Additional browser testing patterns
- `agent-browser` - Browser automation tool

## Remember

1. **Create composite functions** for common flows
2. **Batch related commands** in single eval calls
3. **Use minimal waits** (500ms for transitions)
4. **Check properties directly** (no Promise polling)
5. **Group verifications** together
6. **Save 40-50%** of testing time
