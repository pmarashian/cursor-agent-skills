---
name: phaser-automation-kit
description: Quick reference for Phaser game automation with agent-browser. Skip DOM snapshots and use window.__TEST__ directly. Use when automating Phaser 3 games, testing canvas/WebGL applications, or working with game state inspection. Trigger: "phaser automation", "test phaser", "game automation", "window.__TEST__", "skip snapshot".
---

# Phaser Automation Kit

Quick reference for automating Phaser games with agent-browser. **Skip `snapshot -i`** and use `window.__TEST__` directly.

## Core Principle

**For Phaser games, skip DOM snapshots.** The test seam (`window.__TEST__`) provides all necessary access without DOM inspection.

## Quick Start

```bash
# 1. Open game with test mode
agent-browser open http://localhost:3000?test=1&seed=42

# 2. Wait for ready (skip snapshot -i)
agent-browser eval "new Promise(r => { const c = () => window.__TEST__?.ready ? r(true) : setTimeout(c, 100); c(); })"

# 3. Use test seam directly
agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"
agent-browser eval "window.__TEST__.gameState()"
```

## Common Patterns

### Scene Navigation

```bash
# Navigate to scene
agent-browser eval "window.__TEST__.commands.goToScene('GameScene', { level: 1 })"

# Check current scene
agent-browser eval "window.__TEST__.sceneKey"
```

### State Inspection

```bash
# Get full game state
agent-browser eval "window.__TEST__.gameState()"

# Check specific state
agent-browser eval "window.__TEST__.gameState().score"
agent-browser eval "window.__TEST__.gameState().player.x"
```

### Functional Triggers

```bash
# Trigger game actions via commands
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser eval "window.__TEST__.commands.collectCoin(100, 200)"
agent-browser eval "window.__TEST__.commands.reset()"
```

### Input Simulation

```bash
# Keyboard input
agent-browser press ArrowRight
agent-browser press Space
agent-browser press KeyW

# Mouse input (for DOM-based UI if needed)
agent-browser click 400 300
```

### Waiting for State Changes

```bash
# Wait for ready
agent-browser eval "window.__TEST__.ready"

# Wait for specific state
agent-browser eval "new Promise(r => { const c = () => window.__TEST__.gameState().score > 0 ? r(true) : setTimeout(c, 100); c(); })"
```

## Standardized Test Seam Structure

All Phaser games should expose:

```javascript
window.__TEST__ = {
  sceneKey: null,        // Current active scene
  ready: false,          // true after first interactive frame
  seed: null,            // current RNG seed
  
  gameState: () => ({    // JSON-serializable snapshot
    scene: window.__TEST__.sceneKey,
    score: gameState.score,
    // ... scene-specific state
  }),
  
  commands: {            // Functional triggers
    goToScene: (key, data) => {},
    clickStartGame: () => {},
    collectCoin: (x, y) => {},
    reset: () => {},
  }
};
```

## Workflow Comparison

### ❌ Wrong: Using DOM Snapshots

```bash
agent-browser open http://localhost:3000
agent-browser snapshot -i  # Unnecessary for Phaser
agent-browser click @e1  # Brittle, DOM-dependent
```

### ✅ Correct: Using Test Seam

```bash
agent-browser open http://localhost:3000?test=1&seed=42
agent-browser eval "window.__TEST__.ready"
agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"
agent-browser eval "window.__TEST__.gameState()"
```

## When to Use DOM Snapshots

Only use `snapshot -i` for:
- **DOM-based UI**: HTML menus, buttons, forms
- **Hybrid games**: DOM menus + canvas gameplay (use snapshot for menus only)

For pure Phaser/canvas games, **always use `window.__TEST__`**.

## Direct Scene Access

Test specific scenes without full game flow:

```bash
# Start directly at scene
agent-browser open http://localhost:3000?scene=GameScene&test=1&seed=42

# Or navigate via test seam
agent-browser eval "window.__TEST__.commands.goToScene('GameScene', { level: 3 })"
```

## Error Checking

```bash
# Check for console errors
agent-browser errors

# Verify test seam exists
agent-browser eval "typeof window.__TEST__ !== 'undefined'"

# Check readiness
agent-browser eval "window.__TEST__.ready"
```

## Screenshot Testing

After deterministic setup:

```bash
# Set viewport
agent-browser set viewport 1280 720

# Wait for stable state
agent-browser eval "window.__TEST__.ready && window.__TEST__.frameCount >= 10"

# Capture screenshot
agent-browser screenshot gameplay-state.png
```

## Integration with TestManager

If using TestManager pattern (see `@phaser-game-testing`):

```bash
# TestManager provides consistent structure
agent-browser eval "window.__TEST__.gameState()"  # Merges base + scene state
agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"
```

## Related Skills

- `@phaser-game-testing`: Complete testing guide, TestManager pattern, unit testing
- `@vite-agent`: Vite configuration for agent automation

## Remember

1. **Skip `snapshot -i`** for Phaser games
2. **Use `window.__TEST__`** directly
3. **Use commands** for functional triggers
4. **Check state** via `gameState()`
5. **Wait for ready** before interactions
