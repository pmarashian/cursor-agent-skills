# agent-browser Cheatsheet

Patterns for using agent-browser CLI during frontend testing tasks (especially canvas/WebGL games).

## Mental Model

- Use agent-browser to reproduce a user flow and collect evidence: console, network, screenshots, and state
- Prefer explicit readiness over time-based waits
- Treat *any* console error (or failed asset request) as a product failure unless explicitly allowed

## Command Patterns by Task

### Navigate + Wait for App Readiness

**For DOM apps:**
```bash
1. agent-browser open http://localhost:3000
2. agent-browser wait --text "Welcome"
```

**For canvas/game apps:**
```bash
1. agent-browser open http://localhost:3000?test=1
2. agent-browser wait --fn "window.__TEST__?.ready === true"
   # Or use eval for Promise-based wait:
   agent-browser eval "new Promise(resolve => { const check = () => window.__TEST__?.ready ? resolve(true) : setTimeout(check, 100); check(); })"
```

### Assert State (White-Box via Test Seams)

Read app state through exposed test API:

```bash
agent-browser eval "window.__TEST__.state()"
```

Common assertions:
- Scene/route: `agent-browser eval "window.__TEST__.sceneKey === 'MainMenu'"`
- Score/resources: `agent-browser eval "window.__TEST__.state().score >= 100"`
- Entity state: `agent-browser eval "window.__TEST__.state().player.hp > 0"`

### Drive User Input

**Click interactions:**
```bash
# First get snapshot to find refs
agent-browser snapshot -i
# Then click using ref (e.g., @e1, @e2)
agent-browser click @e1
```

**Keyboard input (games):**
```bash
agent-browser press ArrowRight
agent-browser press Space  # attack/jump
```

**Drag operations:**
```bash
# Get refs from snapshot first
agent-browser snapshot -i
# Then drag from start ref to end ref
agent-browser drag @e1 @e2
```

**Text input:**
```bash
# Get ref from snapshot first
agent-browser snapshot -i
# Then fill or type into element
agent-browser fill @e1 "TestPlayer"
# Or
agent-browser type @e1 "TestPlayer"
```

### Catch Silent Failures

**Check for console errors:**
```bash
agent-browser errors
# Or get all console messages
agent-browser console
# Fail test if any errors returned
```

**Check for failed network requests:**
```bash
agent-browser network requests
# Fail if any required asset returned non-2xx/3xx
```

### Visual Evidence

**Take screenshot (after determinism enforced):**
```bash
agent-browser screenshot game-main-menu.png
```

**Element screenshot:**
```bash
# Get ref from snapshot first
agent-browser snapshot -i
# Then screenshot specific element
agent-browser screenshot canvas-state.png @e1
```

### Viewport and Browser Settings

**Set viewport size:**
```bash
agent-browser set viewport 1280 720
```

## Workflow: Complete Test Sequence

1. **Navigate** to app URL (with `?test=1` for deterministic mode)
   ```bash
   agent-browser open http://localhost:3000?test=1&seed=42
   ```

2. **Wait** for readiness signal
   ```bash
   agent-browser wait --fn "window.__TEST__?.ready === true"
   ```

3. **Check** console for pre-existing errors
   ```bash
   agent-browser errors
   ```

4. **Drive** user input sequence
   ```bash
   agent-browser snapshot -i
   agent-browser click @e1
   agent-browser press ArrowRight
   ```

5. **Assert** state via test seams
   ```bash
   agent-browser eval "window.__TEST__.state().score"
   ```

6. **Screenshot** if visual verification needed
   ```bash
   agent-browser screenshot gameplay-state.png
   ```

7. **Check** console/network for errors introduced by actions
   ```bash
   agent-browser errors
   agent-browser network requests
   ```

## Test Seam Recommendations

Minimal, stable, read-only seams to add to the app:

```javascript
window.__TEST__ = {
  ready: false,           // Set true after first interactive frame
  version: "1.0.0",       // For cache invalidation
  seed: null,             // Current RNG seed (if seeded)
  sceneKey: null,         // Current scene/route
  state: () => ({         // Returns JSON-serializable snapshot
    scene: this.sceneKey,
    player: { x, y, hp, state },
    score: currentScore,
    entities: [...entityList.map(e => ({ id, type, x, y }))]
  }),
  commands: {             // Optional mutation commands
    reset: () => {},      // Reset to initial state
    seed: (n) => {},      // Set RNG seed
    skipIntro: () => {},  // Jump past animations
    setTime: (t) => {}    // Control game clock
  }
};
```

**Key principle**: Expose IDs + essential fields, not raw engine objects.

## Common Gotchas

1. **Race on navigate**: Always wait for readiness after navigation, never assume immediate availability
2. **Stale refs**: Snapshot refs become invalid after navigation or major DOM changes—re-snapshot
3. **Animation timing**: Screenshots during animations will be inconsistent—wait for animation completion or disable animations
4. **Canvas click coordinates**: For canvas, clicking via agent-browser clicks DOM position—ensure canvas fills expected area
5. **Ref syntax**: Use `@e1`, `@e2`, etc. from `snapshot -i` output—these are element references, not CSS selectors
