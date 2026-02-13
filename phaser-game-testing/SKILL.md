---
name: phaser-game-testing
description: Test Phaser games and canvas/WebGL applications with deterministic automation. Plan, implement, and debug frontend tests: unit/integration/E2E/visual/a11y for Phaser 3 games. Use agent-browser CLI for browser automation, Vitest/Jest/RTL, flaky test triage, CI stabilization, and Phaser games needing deterministic input plus screenshot/state assertions. Trigger: "test phaser game", "phaser testing", "game testing", "canvas testing", "webgl testing", "test", "E2E", "flaky", "visual regression", "Playwright".
---

# Phaser Game Testing

Test Phaser 3 games reliably: enable safe refactors by choosing the right test layer, making canvas/WebGL games observable, and eliminating nondeterminism so failures are actionable.

## Philosophy: Confidence Per Minute

Frontend tests fail for two reasons: the product is broken, or the test is lying. Your job is to maximize signal and minimize "test is lying".

**Before writing a test, ask**:

- What user risk am I covering (money, progression, auth, data loss, crashes)?
- What's the narrowest layer that catches this bug class (pure logic vs UI vs full browser)?
- What nondeterminism exists (time, RNG, async loading, network, animations, fonts, GPU)?
- What "ready" signal can I wait on besides `setTimeout`?
- What should a failure print/screenshot so it's diagnosable in CI?

**Core principles**:

1. **Test the contract, not the implementation**: assert stable user-meaningful outcomes and public seams.
2. **Prefer determinism over retries**: make time/RNG/network controllable; remove flake at the source.
3. **Observe like a debugger**: console errors, network failures, screenshots, and state dumps on failure.
4. **One critical flow first**: a reliable smoke test beats 50 flaky tests.

## Unit Testing for Pure Logic

**Decision Tree**: Is this pure logic? → Use unit tests, not browser automation.

For pure logic utilities (maze generation, score sorting, storage, math algorithms), use **Vitest** for fast, deterministic unit tests. Reserve browser automation (agent-browser) for integration contracts and UI flows.

### What Should Be Unit Tested

- ✅ **Maze generation algorithms** - Deterministic with seeded RNG
- ✅ **Score sorting/validation** - Pure data transformations
- ✅ **Storage utilities** - localStorage wrappers, serialization
- ✅ **Math/algorithm utilities** - Pathfinding, damage calculations
- ✅ **State management logic** - Reducers, state machines
- ✅ **RNG utilities** - Seeded random number generators

### Vitest Setup Pattern

```bash
npm install -D vitest @vitest/ui
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

### Workflow: Logic Changes

1. **Write unit test first** → Verify logic in isolation
2. **Run tests** → `npm test`
3. **Test in browser if needed** → Only for integration verification

### Anti-Pattern: Browser Automation for Pure Functions

❌ **Wrong**: Using agent-browser to test a maze generation function
```bash
agent-browser eval "generateMaze(10, 10, 42)"
```

✅ **Correct**: Unit test with Vitest
```typescript
import { describe, it, expect } from 'vitest';
import { generateMaze } from './maze';

describe('generateMaze', () => {
  it('generates same maze with same seed', () => {
    const maze1 = generateMaze(10, 10, 42);
    const maze2 = generateMaze(10, 10, 42);
    expect(maze1).toEqual(maze2);
  });
});
```

See `references/unit-testing-setup.md` for complete Vitest configuration and examples.

## Test Layer Decision Tree

Pick the cheapest layer that provides needed confidence:

| Layer         | Speed       | Use For                                                                           |
| ------------- | ----------- | --------------------------------------------------------------------------------- |
| **Unit**      | Fastest     | Pure functions, reducers, validators, math, pathfinding, deterministic simulation |
| **Component** | Medium      | UI behavior with mocked IO (React Testing Library, Vue Testing Library)           |
| **E2E**       | Slowest     | Critical user flows across routing, storage, real bundling/runtime                |
| **Visual**    | Specialized | Layout/pixel regressions; for canvas/WebGL, only after locking determinism        |

## Quick Start: First Smoke Test

1. **Define 1 critical flow**: "page loads → user can start → one key action works"
2. **Add a test seam** to the app (see below)
3. **Choose runner**: agent-browser CLI for E2E, unit tests for logic
4. **Fail loudly**: treat console errors and failed requests as test failures
5. **Stabilize**: seed RNG, freeze time, fix viewport, disable animations

## Concrete agent-browser Workflow: Testing a Game

Step-by-step sequence for testing a Phaser/canvas game:

**Important**: For Phaser games, **skip `snapshot -i`** and use `window.__TEST__` directly.

```
1. agent-browser open http://localhost:3000?test=1&seed=42

2. agent-browser eval "new Promise(r => { const c = () => window.__TEST__?.ready ? r(true) : setTimeout(c, 100); c(); })"
   (Wait for game ready)

3. agent-browser errors
   (Fail if any errors)

4. agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"
   (Use test seam commands instead of DOM clicks)

5. agent-browser eval "window.__TEST__.gameState()"
   (Assert game state is correct)

6. agent-browser press ArrowRight
   (Or WASD for movement)

7. agent-browser eval "window.__TEST__.gameState().player.x"
   (Verify movement happened)

8. agent-browser screenshot gameplay-state.png
   (Visual evidence after deterministic setup)
```

**Note**: For DOM-based UI (menus, buttons), you may still use `snapshot -i` and `click @e1`, but prefer test seam commands when available.

## Standardized Test Seam Pattern

**Important**: Agents should **skip `snapshot -i`** for Phaser games and go directly to `window.__TEST__`. The test seam provides all necessary access without DOM inspection.

### TestManager Singleton Pattern

Use a centralized TestManager singleton for consistent test seam management across all scenes:

```javascript
// utils/TestManager.js
class TestManager {
  constructor() {
    this.ready = false;
    this.seed = null;
    this.sceneKey = null;
    this.scenes = new Map(); // sceneKey -> scene instance
  }

  registerScene(sceneKey, sceneInstance) {
    this.scenes.set(sceneKey, sceneInstance);
    this.sceneKey = sceneKey;
  }

  getCurrentScene() {
    return this.scenes.get(this.sceneKey);
  }

  gameState() {
    const scene = this.getCurrentScene();
    if (!scene) return { scene: null };
    
    return {
      scene: this.sceneKey,
      score: scene.gameState?.score || 0,
      timer: scene.gameState?.timer || 0,
      inventory: scene.gameState?.inventory || [],
      // Add scene-specific state via scene.getTestState()
      ...(scene.getTestState ? scene.getTestState() : {})
    };
  }

  commands = {
    clickStartGame: () => {
      const scene = this.getCurrentScene();
      scene?.startGame?.();
    },
    collectCoin: (x, y) => {
      const scene = this.getCurrentScene();
      scene?.collectCoin?.(x, y);
    },
    goToScene: (key, data) => {
      const game = this.getCurrentScene()?.scene?.game;
      if (game) {
        game.scene.start(key, data);
      }
    }
  };
}

// Initialize singleton
window.__TEST__ = new TestManager();
```

### BaseScene Pattern

Create a BaseScene class that automatically registers with TestManager:

```javascript
// scenes/BaseScene.js
export class BaseScene extends Phaser.Scene {
  constructor(config) {
    super(config);
  }

  create() {
    // Auto-register with TestManager
    if (window.__TEST__) {
      window.__TEST__.registerScene(this.scene.key, this);
    }
    
    // Scene-specific initialization
    this.initScene();
  }

  // Override in subclasses
  initScene() {}

  // Override to provide scene-specific test state
  getTestState() {
    return {};
  }
}
```

### Consistent `window.__TEST__` Structure

All scenes should expose the same structure:

```javascript
window.__TEST__ = {
  sceneKey: null, // Current active scene (managed by TestManager)
  ready: false, // true after first interactive frame
  seed: null, // current RNG seed
  
  gameState: () => ({
    // JSON-serializable snapshot
    scene: window.__TEST__.sceneKey,
    score: gameState.score,
    timer: gameState.timer,
    inventory: gameState.inventory,
    // Scene-specific state added via getTestState()
  }),
  
  commands: {
    // Functional triggers (not raw Phaser API)
    clickStartGame: () => {},
    collectCoin: (x, y) => {},
    goToScene: (key, data) => {},
    reset: () => {},
    seed: (n) => {},
  }
};
```

### Anti-Pattern: Don't Implement `__TEST__` Individually

❌ **Wrong**: Each scene implements its own `window.__TEST__` structure
```javascript
// In GameScene.js
window.__TEST__ = { /* GameScene-specific */ };

// In MenuScene.js  
window.__TEST__ = { /* MenuScene-specific */ };
```

✅ **Correct**: Use TestManager + BaseScene for consistent structure
```javascript
// All scenes extend BaseScene
class GameScene extends BaseScene {
  getTestState() {
    return { player: { x: this.player.x, y: this.player.y } };
  }
}
```

### Agent Workflow with Standardized Seams

1. **Skip DOM snapshots**: `agent-browser snapshot -i` is unnecessary
2. **Go directly to test seam**: `agent-browser eval "window.__TEST__.ready"`
3. **Use commands**: `agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"`
4. **Check state**: `agent-browser eval "window.__TEST__.gameState()"`

See `references/test-seam-standardization.md` for complete implementation guide.

## Recommended Test Seams (Legacy Pattern)

For projects not yet using TestManager, the basic pattern still works:

```javascript
window.__TEST__ = {
  ready: false, // true after first interactive frame
  seed: null, // current RNG seed
  sceneKey: null, // current scene/route
  state: () => ({
    // JSON-serializable snapshot
    scene: this.sceneKey,
    player: { x, y, hp },
    score: gameState.score,
    entities: entities.map((e) => ({ id: e.id, type: e.type, x: e.x, y: e.y })),
  }),
  commands: {
    // optional mutation commands
    reset: () => {},
    seed: (n) => {},
    skipIntro: () => {},
  },
};
```

**Rule**: Expose IDs + essential fields, not raw Phaser/engine objects.

**Note**: Prefer the TestManager pattern above for new projects.

## Anti-Patterns to Avoid

❌ **Testing the wrong layer**: E2E tests for pure logic
_Why tempting_: "Let's just test everything through the browser"
_Better_: Unit tests for logic; reserve E2E for integration contracts

❌ **Testing implementation details**: Asserting DOM structure/classnames
_Why tempting_: Easy to assert what you can see in DevTools
_Better_: Assert user-meaningful outputs (text, score, HP changes)

❌ **Sleep-driven tests**: `wait 2s then click`
_Why tempting_: Simple and "works on my machine"
_Better_: Wait on explicit readiness (DOM marker, `window.__TEST__.ready`)

❌ **Uncontrolled randomness**: RNG/time in assertions
_Why tempting_: "The game uses random, so the test should too"
_Better_: Seed RNG (`?seed=42`), freeze time, assert stable invariants

❌ **Pixel snapshots without determinism**: Canvas screenshots that flake
_Why tempting_: "I'll catch visual bugs automatically"
_Better_: Deterministic mode first; then screenshot at known stable frames

❌ **Retries as a strategy**: "Just bump retries to 3"
_Why tempting_: Quick fix that makes CI green
_Better_: Fix the flake source; retries hide real problems

## Debugging Failed Tests

When a test fails, gather evidence in this order:

1. **Console errors**: `agent-browser errors` or `agent-browser console`
2. **Network failures**: `agent-browser network requests` → check for non-2xx
3. **Screenshot**: `agent-browser screenshot failure-state.png` → visual state at failure
4. **App state**: `agent-browser eval "window.__TEST__.state()"`
5. **Classify the flake** (see references/flake-reduction.md):
   - Readiness? → add explicit wait
   - Timing? → control animation/physics
   - Environment? → lock viewport/DPR
   - Data? → isolate test data

## Graduation Criteria: When Is Testing "Enough"?

Minimum viable test suite:

- [ ] **1 smoke test** that proves the app loads and primary action works
- [ ] **Test seam exists** (`window.__TEST__` with ready flag and state)
- [ ] **Deterministic mode** for canvas/games (`?test=1` enables seeding)
- [ ] **Console errors fail tests** (no silent failures)
- [ ] **CI runs tests** on every push

Level up when:

- Critical paths (auth, payment, save/load) have dedicated E2E
- Unit tests cover complex logic (pathfinding, damage calc, state machines)
- Visual regression on key screens (menu, HUD) with locked determinism

## Visual Regression with imgdiff.py

For pixel comparison of screenshots:

```bash
# Compare baseline to current
python scripts/imgdiff.py baseline.png current.png --out diff.png

# Allow small tolerance (anti-aliasing differences)
python scripts/imgdiff.py baseline.png current.png --max-rms 2.0
```

Exit codes: 0 = identical, 1 = different, 2 = error

## UI Slicing Regressions (Nine-Slice / Ribbons / Bars)

Canvas UI issues (panel seams, segmented ribbons, invisible HUD fills) are best caught with a dedicated UI harness instead of the full gameplay flow.

1. Build a simple `test.html`/scene that loads _only_ the UI assets.
2. Render raw slices next to assembled panels (multi-size), and include ribbon/bars with both “raw crop + scale” and “stitched multi-slice” views.
3. Expose `window.__TEST__` with `.commands.showTest(n)` so agent-browser can toggle each mode deterministically.
4. Capture targeted screenshots (panels, ribbons, bars) and diff them in CI.

See `references/phaser-canvas-testing.md` for the deterministic setup + screenshot workflow.

For general Phaser UI components (not just slicing), use the same idea via **standalone component test scenes** (**phaser-component-test-scenes** skill): one scene per component, test via `?scene=ComponentNameTestScene`.

## Direct Scene Access for Testing

For testing specific scenes without navigating the full game flow, use URL parameters to start directly at a scene.

### URL Parameter Pattern

```
http://localhost:3000?scene=GameScene&test=1&seed=42
```

### Implementation in `main.ts`

```typescript
// main.ts
const params = new URLSearchParams(window.location.search);
const sceneParam = params.get('scene');
const isTestMode = params.has('test');
const seedParam = params.get('seed');

const config: Phaser.Types.Core.GameConfig = {
  // ... other config
  scene: sceneParam 
    ? [sceneParam] // Start directly at specified scene
    : [BootScene, PreloaderScene, MenuScene, GameScene], // Normal flow
};

const game = new Phaser.Game(config);

// If test mode, initialize with seed
if (isTestMode && seedParam) {
  const seed = parseInt(seedParam);
  seedRNG(seed);
  window.__TEST__.seed = seed;
}
```

### TestManager Integration

```javascript
// In TestManager
commands: {
  goToScene: (key, data) => {
    const game = this.getCurrentScene()?.scene?.game;
    if (game) {
      game.scene.start(key, data);
    }
  }
}
```

### Agent Workflow

```bash
# Test specific scene directly
agent-browser open http://localhost:3000?scene=GameScene&test=1&seed=42

# Or navigate via test seam
agent-browser eval "window.__TEST__.commands.goToScene('GameScene', { level: 1 })"
```

**Workflow**: For testing specific scenes, use `?scene=SceneName` instead of navigating full game flow.

## Variation Guidance

Adapt approach based on context:

- **DOM app**: Standard agent-browser selectors, wait for text/elements
- **Canvas game**: Test seams mandatory, wait via `window.__TEST__.ready`
- **Hybrid**: DOM for menus, test seams for gameplay
- **CI-only GPU**: May need software rendering flags or skip visual tests
- **UI slicing regressions**: For nine-slice/ribbon/bar artifacts, prefer a small UI harness scene/page with deterministic modes and targeted screenshots (`references/phaser-canvas-testing.md`).

## Test Seam Discovery

**Always check for `window.__TEST__` before DOM interactions**

Test seams are PRIMARY method for Phaser game testing:
- Each scene creates its own test seam in `create()` method
- Test seam `sceneKey` may lag on scene transitions (use console logs as fallback)
- Check source code for available test seam commands
- Document discovered commands in progress.txt

### Standard Readiness Check Patterns

**Use exponential backoff for test seam discovery:**

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

**JavaScript pattern with exponential backoff:**

```javascript
// Exponential backoff readiness check
async function waitForTestSeam(maxAttempts = 5) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, 8s, 16s
    await sleep(delay);
    
    const isReady = await checkTestSeamReady();
    if (isReady) {
      return true;
    }
  }
  return false;
}
```

### Retry Strategy Guidance

**Retry patterns for test seam discovery:**

```bash
# Retry with exponential backoff
max_retries=5
attempt=0

while [ $attempt -lt $max_retries ]; do
  if agent-browser eval "window.__TEST__?.ready"; then
    echo "Test seam ready"
    break
  fi
  
  attempt=$((attempt + 1))
  sleep $((2 ** $attempt))  # Exponential backoff: 2s, 4s, 8s, 16s, 32s
done
```

**Discovery workflow**:
1. Check for `window.__TEST__` availability with exponential backoff
2. If not available, check source code for test seam setup
3. Look for `window.__TEST__.commands` in scene files
4. Document available commands
5. Retry with exponential backoff if initial check fails

## Test Seam Patterns

### Direct Property Access (Preferred)

**PREFERRED: Use direct property checks instead of polling readiness flags**

```bash
# ✅ CORRECT: Direct property check
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
- Immediate check (no polling delay)
- More reliable (readiness flags may not be reliable)
- Simpler code (no Promise chains)
- Faster execution (no async overhead)

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

### Framework-Specific Command References

**Common test seam commands by framework**:

**Phaser 3**:
- `window.__TEST__.commands.goToScene(key, data)`
- `window.__TEST__.commands.gameState()`
- `window.__TEST__.commands.setTimer(seconds)`
- `window.__TEST__.sceneKey` (current scene)

**React/Web Apps**:
- `window.__TEST__.commands.navigate(route)`
- `window.__TEST__.commands.getState()`
- `window.__TEST__.currentRoute`

**Graceful Degradation**:
- If test seams unavailable: Use DOM inspection or code review
- Document limitation: Note why test seam wasn't used
- Alternative verification: TypeScript compilation, code review

## Coordinate System Documentation

### World Coordinates vs Screen Coordinates

**Understanding Phaser coordinate systems is critical for UI positioning tasks.**

**World Coordinates**:
- Game world space (e.g., 800x600 game world)
- Camera-independent (objects exist in world space)
- Used for game objects, sprites, physics bodies
- Example: `sprite.x = 400` (400 pixels from world origin)

**Screen Coordinates**:
- Viewport/camera space (what player sees)
- Camera-dependent (changes with camera scroll)
- Used for UI elements, HUD, overlays
- Example: `ui.x = 400` (400 pixels from screen origin)

**Key Difference**:
```typescript
// World coordinates (game object)
sprite.x = 400;  // 400 pixels in world space

// Screen coordinates (UI element)
ui.x = 400;  // 400 pixels from screen edge (camera-independent)
```

### Camera Scroll Offset Handling

**When calculating positions, account for camera scroll**:

```typescript
// ❌ WRONG: Not accounting for camera scroll
const worldX = 400;
sprite.x = worldX;  // May be off-screen if camera scrolled

// ✅ CORRECT: Account for camera scroll
const cameraX = this.cameras.main.scrollX;
const worldX = 400;
sprite.x = cameraX + worldX;  // Correct position relative to camera
```

**For UI Elements (Screen Coordinates)**:
```typescript
// UI elements use screen coordinates (camera-independent)
ui.x = 400;  // Always 400 pixels from screen edge, regardless of camera
```

### Position Calculation Patterns

**Pattern 1: Center Text on Screen**

```typescript
// Calculate text width first
const textWidth = text.width;
const screenWidth = this.cameras.main.width;
const centerX = (screenWidth - textWidth) / 2;

text.x = centerX;  // Center text horizontally
```

**Pattern 2: Position Relative to Another Object**

```typescript
// Position button below text
const textBottom = text.y + text.height;
const spacing = 20;
button.y = textBottom + spacing;
```

**Pattern 3: Account for Origin**

```typescript
// Sprite origin affects position calculation
sprite.setOrigin(0.5, 0.5);  // Center origin
sprite.x = 400;  // Center of sprite at x=400

// If origin is (0, 0), sprite.x is top-left corner
sprite.setOrigin(0, 0);
sprite.x = 400;  // Top-left corner at x=400
```

### Common Gotchas About Position Calculations

**Gotcha 1: Not Accounting for Text Width**

```typescript
// ❌ WRONG: Assuming fixed width
text.x = 400;  // May not be centered if text width varies

// ✅ CORRECT: Calculate based on actual width
const textWidth = text.width;
const centerX = (screenWidth - textWidth) / 2;
text.x = centerX;
```

**Gotcha 2: Confusing World vs Screen Coordinates**

```typescript
// ❌ WRONG: Using world coordinates for UI
ui.x = sprite.x;  // UI will move with camera scroll

// ✅ CORRECT: Use screen coordinates for UI
ui.x = 400;  // UI stays fixed on screen
```

**Gotcha 3: Not Accounting for Origin**

```typescript
// ❌ WRONG: Assuming origin is (0, 0)
sprite.x = 100;  // May not be where expected if origin is (0.5, 0.5)

// ✅ CORRECT: Account for origin
sprite.setOrigin(0.5, 0.5);
sprite.x = 100;  // Center of sprite at x=100
```

## WebGL Warning Handling

### Known Non-Critical WebGL Warnings

**Some WebGL warnings are non-critical and can be ignored**:

**Warning: WebGL context lost**
- **When to ignore**: During development, if game still works
- **When to investigate**: If game stops working or performance degrades
- **Common cause**: Browser resource limits, GPU driver issues

**Warning: Texture size exceeds maximum**
- **When to ignore**: If texture is automatically scaled down
- **When to investigate**: If texture quality is unacceptable
- **Common cause**: Very large textures, old GPU

**Warning: Shader compilation failed**
- **When to ignore**: Never - this is always critical
- **Action**: Always investigate shader compilation failures
- **Common cause**: Shader syntax errors, unsupported features

### When to Ignore vs Investigate Warnings

**Ignore WebGL warnings when**:
- Game functions correctly despite warning
- Warning is known browser/GPU limitation
- Warning doesn't affect gameplay
- Performance is acceptable

**Investigate WebGL warnings when**:
- Game stops working or crashes
- Performance degrades significantly
- Visual artifacts appear
- Shader compilation fails
- Texture quality is unacceptable

### WebGL Capability Detection Patterns

**Check WebGL support before testing**:

```bash
# Check WebGL support
agent-browser eval "
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  gl ? 'WebGL supported' : 'WebGL not supported'
"
```

**Check WebGL context**:

```bash
# Check if WebGL context is active
agent-browser eval "
  const game = window.__TEST__?.getCurrentScene()?.scene?.game;
  if (game) {
    const renderer = game.renderer;
    renderer.gl ? 'WebGL active' : 'Canvas2D fallback'
  } else {
    'Game not initialized'
  }
"
```

## Sprite Origin Adjustments

### Sprite Textures May Not Be Visually Centered

**Important**: Sprite textures may not be visually centered even with origin (0.5, 0.5).

**Why This Happens**:
- Texture has transparent padding
- Texture has uneven padding
- Texture dimensions don't match visual content

**Solution**: Adjust origin or reposition sprite

### Origin Adjustment Patterns

**Pattern 1: Fine-Tune Origin**

```typescript
// Standard center origin
sprite.setOrigin(0.5, 0.5);

// Fine-tune if visually off-center
sprite.setOrigin(0.4, 0.5);  // Slightly left of center
sprite.setOrigin(0.6, 0.5);  // Slightly right of center
```

**Pattern 2: Adjust Position Instead**

```typescript
// If origin adjustment doesn't work, adjust position
sprite.setOrigin(0.5, 0.5);
sprite.x = targetX + offsetX;  // Add offset to compensate
sprite.y = targetY + offsetY;
```

**Pattern 3: Measure and Calculate**

```typescript
// Measure visual bounds
const visualWidth = sprite.width;  // May differ from texture width
const visualHeight = sprite.height;

// Calculate offset
const offsetX = (textureWidth - visualWidth) / 2;
const offsetY = (textureHeight - visualHeight) / 2;

// Adjust position
sprite.x = targetX + offsetX;
sprite.y = targetY + offsetY;
```

### When to Adjust Origins vs Reposition Sprites

**Adjust origin when**:
- Sprite is consistently off-center
- Offset is consistent across sprites
- You want to change anchor point permanently

**Reposition sprite when**:
- Offset varies by sprite
- You need precise pixel positioning
- Origin adjustment doesn't work

**Example**:

```typescript
// ✅ CORRECT: Adjust origin for consistent offset
sprite.setOrigin(0.4, 0.5);  // All sprites use this origin

// ✅ CORRECT: Reposition for precise placement
sprite.setOrigin(0.5, 0.5);
sprite.x = targetX + 5;  // 5 pixel offset for this sprite
```

## Common Patterns

### Pattern 1: Successful UI Layout Calculation

**Example from real task**:

```typescript
// Calculate text width first
const textWidth = this.add.text(0, 0, "Score: 100", style).width;
const screenWidth = this.cameras.main.width;

// Center text horizontally
const centerX = (screenWidth - textWidth) / 2;
text.x = centerX;

// Position below with spacing
const spacing = 20;
button.y = text.y + text.height + spacing;
```

**Key Points**:
- Calculate text width before positioning
- Account for screen width (not world width)
- Use spacing constants for consistency

### Pattern 2: Successful Coordinate System Usage

**Example from real task**:

```typescript
// World coordinates for game object
player.x = 400;  // 400 pixels in world space

// Screen coordinates for UI
scoreText.x = 100;  // 100 pixels from screen edge (camera-independent)

// Account for camera scroll when needed
const cameraX = this.cameras.main.scrollX;
enemy.x = cameraX + 500;  // 500 pixels ahead of camera
```

**Key Points**:
- Use world coordinates for game objects
- Use screen coordinates for UI
- Account for camera scroll when needed

### Pattern 3: Successful Origin Handling

**Example from real task**:

```typescript
// Set origin first
sprite.setOrigin(0.5, 0.5);

// Position at target
sprite.x = 400;
sprite.y = 300;

// Fine-tune if visually off-center
if (sprite appears off-center) {
  sprite.setOrigin(0.4, 0.5);  // Adjust origin
  // OR
  sprite.x += 5;  // Adjust position
}
```

**Key Points**:
- Set origin before positioning
- Fine-tune if visually off-center
- Use origin adjustment or position offset

## Troubleshooting: Coordinate Confusion

### Problem: UI Element Not Where Expected

**Symptoms**:
- UI element appears in wrong location
- UI element moves with camera scroll
- UI element position changes unexpectedly

**Diagnosis**:
1. Check if using world vs screen coordinates
2. Verify origin is set correctly
3. Check if camera scroll is affecting position

**Solution**:
```typescript
// For UI elements, use screen coordinates
ui.x = 100;  // Screen coordinate (camera-independent)

// If using world coordinates, account for camera
const cameraX = this.cameras.main.scrollX;
ui.x = cameraX + 100;  // World coordinate (camera-dependent)
```

### Problem: Text Not Centered

**Symptoms**:
- Text appears off-center
- Text position changes with text content

**Diagnosis**:
1. Check if text width is calculated
2. Verify center calculation is correct
3. Check if origin is set correctly

**Solution**:
```typescript
// Calculate text width first
const textWidth = text.width;
const screenWidth = this.cameras.main.width;

// Center calculation
const centerX = (screenWidth - textWidth) / 2;
text.x = centerX;

// Set origin to left (default for text)
text.setOrigin(0, 0.5);  // Left-aligned, vertically centered
```

### Problem: Sprite Position Wrong After Origin Change

**Symptoms**:
- Sprite moves when origin is changed
- Sprite position doesn't match expected location

**Diagnosis**:
1. Origin change affects position calculation
2. Position needs adjustment after origin change

**Solution**:
```typescript
// Set origin first
sprite.setOrigin(0.5, 0.5);

// Then set position
sprite.x = 400;
sprite.y = 300;

// If position is wrong, adjust
sprite.x += offsetX;
sprite.y += offsetY;
```

## Complete Test Seam Command Reference by Scene

**Reference**: See `phaser-test-seam-patterns` skill for comprehensive command catalog.

### MainMenu Scene
- `clickStartGame()` - Navigate to GameScene
- `clickHighScores()` - Navigate to HighScoresScene
- `clickSettings()` - Navigate to SettingsScene

### GameScene
- `setTimer(seconds)` - Set timer to specific value
- `fastForwardTimer(seconds)` - Fast forward timer
- `triggerGameOver()` - Force game over state
- `movePlayerTo(x, y)` - Move player to position
- `movePlayerToExit()` - Move player to exit (complete level)
- `collectAnyCoin()` - Collect nearest coin
- `collectCoin(x, y)` - Collect coin at position
- `gameState()` - Get current game state (score, timer, player position)

### GameOverScene
- `clickPlayAgain()` - Restart game
- `clickMainMenu()` - Navigate to MainMenu
- `getFinalScore()` - Get final score

### HighScoresScene
- `clickMainMenu()` - Navigate to MainMenu
- `getHighScores()` - Get high scores list

### Common Commands (All Scenes)
- `goToScene(key, data)` - Navigate to any scene
- `gameState()` - Get current game state
- `reset()` - Reset game state
- `seed(n)` - Set RNG seed

**Command Discovery Patterns**:
1. Check scene `create()` method for `window.__TEST__.commands` definition
2. Look for test seam setup in scene files
3. Check for TestManager singleton pattern (centralized commands)
4. Document scene-specific commands in progress.txt

**Scene Navigation Workflows**:
```bash
# Navigate from MainMenu to GameScene
agent-browser eval "window.__TEST__.commands.clickStartGame()"

# Wait for transition
agent-browser wait 2000

# Verify scene change (use console logs as fallback)
agent-browser console

# Navigate directly to scene
agent-browser eval "window.__TEST__.commands.goToScene('GameScene', { level: 1 })"
```

**Common Testing Scenario Templates**:

**Scenario 1: Test Game Flow**
```bash
# Start at MainMenu
agent-browser open http://localhost:3000?scene=MainMenu&test=1&seed=42

# Navigate to game
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser wait 2000

# Set timer for quick testing
agent-browser eval "window.__TEST__.commands.setTimer(5)"

# Collect coin
agent-browser eval "window.__TEST__.commands.collectAnyCoin()"

# Verify score updated
agent-browser eval "window.__TEST__.gameState().score"
```

**Scenario 2: Test Game Over**
```bash
# Start at GameScene
agent-browser open http://localhost:3000?scene=GameScene&test=1&seed=42

# Trigger game over
agent-browser eval "window.__TEST__.commands.triggerGameOver()"
agent-browser wait 2000

# Verify GameOverScene
agent-browser eval "window.__TEST__.sceneKey"

# Test play again
agent-browser eval "window.__TEST__.commands.clickPlayAgain()"
```

**Test Seam Debugging Patterns**:
- If command not found: Check scene source code for command definition
- If sceneKey doesn't update: Use console logs as fallback verification
- If command fails: Check if scene is initialized (wait for `window.__TEST__.ready`)
- If navigation fails: Verify scene key spelling matches Phaser scene registration

## Scene Transition Testing

**Use test seam commands for navigation**:
- `clickStartGame()` - Navigate to game
- `clickPlayAgain()` - Restart game
- `goToScene(key, data)` - Navigate to any scene directly

### Scene Navigation Patterns

**Pattern 1: Direct Scene Navigation**

```bash
# Navigate directly to scene (preferred)
agent-browser eval "window.__TEST__.commands.goToScene('GameScene', { level: 1 })"
agent-browser wait 500  # Minimal wait for transition
agent-browser eval "window.__TEST__.sceneKey === 'GameScene'"
```

**Pattern 2: Navigation via UI Commands**

```bash
# Navigate via UI command
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser wait 500  # Minimal wait for transition

# Verify with console logs (fallback if sceneKey lags)
agent-browser console
```

**Pattern 3: Scene Navigation with Retry**

```bash
# Navigate with retry on failure
navigate_to_scene() {
  local scene=$1
  local max_attempts=3
  local attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    agent-browser eval "window.__TEST__.commands.goToScene('$scene')"
    agent-browser wait 500
    
    if agent-browser eval "window.__TEST__.sceneKey === '$scene'"; then
      echo "Successfully navigated to $scene"
      return 0
    fi
    
    attempt=$((attempt + 1))
    sleep $((2 ** $attempt))  # Exponential backoff
  done
  
  echo "Failed to navigate to $scene after $max_attempts attempts"
  return 1
}
```

**Wait patterns**:
- Wait 500ms after transition (minimal wait, not 2 seconds)
- Use console logs to verify scene transitions
- Don't rely solely on test seam `sceneKey` (known to lag)
- Retry navigation with exponential backoff if needed

**Pattern**:
```bash
# Navigate to game
agent-browser eval "window.__TEST__.commands.clickStartGame()"

# Wait for transition (minimal wait)
agent-browser wait 500

# Verify with console logs (fallback)
agent-browser console
```

## Timer Testing

**Use test seam `setTimer(seconds)` for direct manipulation**

**Never wait for natural countdown** - use timer manipulation:
- Set timer to low value (e.g., 3 seconds) for quick testing
- Test boundary conditions (9, 10, 11 seconds for color changes)
- Add `triggerGameOver()` command for testing

**Pattern**:
```bash
# Set timer to 5 seconds
agent-browser eval "window.__TEST__.commands.setTimer(5)"

# Fast forward timer
agent-browser eval "window.__TEST__.commands.fastForwardTimer(10)"

# Trigger game over
agent-browser eval "window.__TEST__.commands.triggerGameOver()"
```

## Movement Testing (Enhanced)

**Phaser requires `keydown`/`keyup` pattern, not single `press`**

**Pattern**:
```bash
# Movement requires keydown/keyup
agent-browser keydown ArrowRight
agent-browser wait 500
agent-browser keyup ArrowRight
```

**Use test seam `movePlayerTo(position)` when available**:
```bash
# Direct position setting (preferred)
agent-browser eval "window.__TEST__.commands.movePlayerTo(100, 200)"
```

**Test collision detection**:
- Test movement through open areas (should work)
- Test movement into walls (should be blocked)
- Verify position updates correctly

## Common Test Seam Commands

- `clickStartGame()` - Navigate to game
- `movePlayerToExit()` - Complete level
- `setTimer(seconds)` - Manipulate timer
- `collectAnyCoin()` - Test coin collection
- `gameState()` - Access game state
- `triggerGameOver()` - Force game over

See `references/test-seam-commands.md` for common commands catalog.

## Bundled Resources

Read these when needed:

- `references/agent-browser-cheatsheet.md`: Detailed agent-browser CLI patterns
- `references/phaser-canvas-testing.md`: Deterministic mode for Phaser games
- `references/flake-reduction.md`: Flake classification and fixes
- `references/test-seam-commands.md`: Common test seam commands catalog

## Composite Test Functions

**Create composite test functions for common flows to reduce command count:**

```javascript
// Add composite test functions to test seam
window.__TEST__.commands.testPlayAgainFlow = () => {
  // Complete play again scenario in one call
  this.scene.start('GameScene');
  this.setTimer(5);
  this.collectAnyCoin();
  return this.gameState();
};

window.__TEST__.commands.testLevelCompleteFlow = () => {
  // Navigate to level complete
  this.movePlayerToExit();
  return this.gameState();
};

window.__TEST__.commands.testSceneTransition = (from, to) => {
  // Scene navigation testing
  this.scene.start(to);
  return { from, to, sceneKey: this.scene.key };
};

window.__TEST__.commands.testGameStateReset = () => {
  // Verify state clearing
  this.reset();
  return this.gameState();
};
```

**Usage in browser testing:**
```bash
# Single composite function call instead of 10+ individual commands
agent-browser eval "window.__TEST__.commands.testPlayAgainFlow()"
```

## Test Seam Readiness Patterns

**Use direct property checks instead of Promise polling:**

```javascript
// ❌ INEFFICIENT: Promise-based polling
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

// ✅ EFFICIENT: Direct property check
agent-browser eval "window.__TEST__?.ready || false"
```

**Check window.__TEST__?.sceneKey directly:**
```bash
# Direct check, no Promise polling
agent-browser eval "window.__TEST__?.sceneKey === 'GameScene'"
```

**Use Object.keys() for verification:**
```bash
# Check command availability
agent-browser eval "Object.keys(window.__TEST__?.commands || {}).includes('clickStartGame')"
```

## Error Scenario Testing

**Add test seam commands for error injection:**

```javascript
// Force error conditions for testing
window.__TEST__.commands.forceMazeFailure = () => {
  // Force maze generation to fail
  this.mazeGenerator.forceFailure = true;
};

window.__TEST__.commands.restoreMazeGeneration = () => {
  // Restore normal maze generation
  this.mazeGenerator.forceFailure = false;
};
```

**Test error handling paths:**
```bash
# Test error scenario
agent-browser eval "window.__TEST__.commands.forceMazeFailure()"
agent-browser eval "window.__TEST__.commands.generateMaze()"
# Verify fallback behavior
agent-browser eval "window.__TEST__.commands.restoreMazeGeneration()"
```

## Testing Phaser Scaling Configuration

**CRITICAL: Verify games use Phaser Scale Manager, not manual JavaScript scaling**

### Scaling Configuration Verification

Test that the game uses Phaser's Scale Manager correctly:

```bash
# Verify Scale Manager is configured
agent-browser eval "
  const game = window.__TEST__?.getCurrentScene()?.scene?.game;
  if (game) {
    const scale = game.scale;
    JSON.stringify({
      mode: scale.scaleMode,
      gameSize: { width: scale.gameSize.width, height: scale.gameSize.height },
      displaySize: { width: scale.displaySize.width, height: scale.displaySize.height },
      autoCenter: scale.autoCenter,
      usingScaleManager: scale.scaleMode !== Phaser.Scale.NONE
    })
  } else {
    'Game not initialized'
  }
"
```

### Anti-Pattern Detection: Manual Scaling

**Check for manual JavaScript/CSS scaling anti-patterns**:

```bash
# Check for manual CSS transforms or width/height styles on canvas
agent-browser eval "
  const canvas = document.querySelector('canvas');
  if (canvas) {
    const style = window.getComputedStyle(canvas);
    JSON.stringify({
      hasTransform: style.transform !== 'none',
      hasWidthPercent: style.width.includes('%'),
      hasHeightPercent: style.height.includes('%'),
      hasManualScaling: style.transform !== 'none' || 
                        style.width.includes('%') || 
                        style.height.includes('%')
    })
  } else {
    'Canvas not found'
  }
"
```

### Viewport Size Testing

Test game scaling across different viewport sizes:

```bash
# Test at different viewport sizes
agent-browser eval "window.innerWidth = 1280; window.innerHeight = 720; window.dispatchEvent(new Event('resize'))"
agent-browser wait 500
agent-browser eval "window.__TEST__?.getCurrentScene()?.scene?.game?.scale?.displaySize"

# Test at mobile size
agent-browser eval "window.innerWidth = 375; window.innerHeight = 667; window.dispatchEvent(new Event('resize'))"
agent-browser wait 500
agent-browser eval "window.__TEST__?.getCurrentScene()?.scene?.game?.scale?.displaySize"
```

### Scaling Test Seam Commands

Add test seam commands for scaling verification:

```typescript
// In your scene's test seam setup
window.__TEST__.commands.getScaleInfo = () => {
  const game = this.scene.game;
  return {
    mode: game.scale.scaleMode,
    gameSize: { width: game.scale.gameSize.width, height: game.scale.gameSize.height },
    displaySize: { width: game.scale.displaySize.width, height: game.scale.displaySize.height },
    scaleX: game.scale.displaySize.width / game.scale.gameSize.width,
    scaleY: game.scale.displaySize.height / game.scale.gameSize.height,
  };
};

window.__TEST__.commands.testResize = (width: number, height: number) => {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
  return this.commands.getScaleInfo();
};
```

### Expected Scaling Behavior

When testing scaling, verify:

1. **Scale Manager is active**: `scale.scaleMode !== Phaser.Scale.NONE`
2. **Aspect ratio preserved**: For `FIT` mode, game maintains aspect ratio
3. **Auto-centering works**: Game is centered in viewport
4. **Resize events handled**: Window resize updates game size correctly
5. **No manual CSS scaling**: Canvas element has no transform or percentage width/height

### Common Scaling Issues to Test

- **Game too small**: Verify scale mode and base dimensions
- **Game distorted**: Check aspect ratio preservation
- **Game off-center**: Verify `autoCenter` configuration
- **Input misaligned**: Indicates manual scaling breaking coordinate system
- **Resize not working**: Check Scale Manager event handling

## Browser Testing Optimization

**Batch related commands:**

```javascript
// Batch independent checks in single eval
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

**Use parallel evaluation where possible:**
```javascript
// Use Promise.all() for parallel checks
agent-browser eval "
  Promise.all([
    Promise.resolve(window.__TEST__.gameState().score),
    Promise.resolve(window.__TEST__.gameState().timer)
  ]).then(results => ({ score: results[0], timer: results[1] }))
"
```

**Reduce wait times between commands:**
```bash
# Use minimal waits (500ms for scene transitions)
agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"
agent-browser wait 500  # Not 2000ms
```

## Remember

You can make almost any frontend (including canvas/WebGL games) testable by adding a tiny, stable seam for readiness + state. One reliable smoke test is the foundation. Aim for tests that are boring to maintain: deterministic, explicit about readiness, and rich in failure evidence. The goal is confidence, not coverage numbers.
