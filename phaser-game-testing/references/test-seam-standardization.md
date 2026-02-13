# Test Seam Standardization Guide

Complete guide to implementing standardized test seams using the TestManager singleton pattern and BaseScene class.

## Overview

Standardized test seams provide a consistent interface for testing Phaser games across all scenes. Instead of each scene implementing its own `window.__TEST__` structure, we use a centralized TestManager that all scenes register with.

## Benefits

- **Consistency**: Same `window.__TEST__` structure across all scenes
- **Maintainability**: Single source of truth for test interface
- **Agent-friendly**: Agents can rely on consistent API
- **Scalability**: Easy to add new scenes without duplicating test code

## TestManager Utility Code Template

```javascript
// utils/TestManager.js
class TestManager {
  constructor() {
    this.ready = false;
    this.seed = null;
    this.sceneKey = null;
    this.scenes = new Map(); // sceneKey -> scene instance
    this.frameCount = 0;
    this.assetsLoaded = false;
  }

  /**
   * Register a scene with the test manager
   * Called automatically by BaseScene.create()
   */
  registerScene(sceneKey, sceneInstance) {
    this.scenes.set(sceneKey, sceneInstance);
    this.sceneKey = sceneKey;
  }

  /**
   * Get the currently active scene instance
   */
  getCurrentScene() {
    return this.scenes.get(this.sceneKey);
  }

  /**
   * Get game state snapshot (JSON-serializable)
   * Merges base state with scene-specific state
   */
  gameState() {
    const scene = this.getCurrentScene();
    if (!scene) {
      return { scene: null };
    }
    
    // Base state available to all scenes
    const baseState = {
      scene: this.sceneKey,
      score: scene.gameState?.score || 0,
      timer: scene.gameState?.timer || 0,
      inventory: scene.gameState?.inventory || [],
      frameCount: this.frameCount,
    };
    
    // Merge scene-specific state
    if (scene.getTestState && typeof scene.getTestState === 'function') {
      const sceneState = scene.getTestState();
      return { ...baseState, ...sceneState };
    }
    
    return baseState;
  }

  /**
   * Commands for functional triggers (not raw Phaser API)
   */
  commands = {
    /**
     * Navigate to a different scene
     */
    goToScene: (key, data = {}) => {
      const scene = this.getCurrentScene();
      const game = scene?.scene?.game;
      if (game) {
        game.scene.start(key, data);
      }
    },

    /**
     * Reset game to initial state
     */
    reset: () => {
      const scene = this.getCurrentScene();
      const game = scene?.scene?.game;
      if (game) {
        game.scene.start('MainMenu');
      }
    },

    /**
     * Seed the RNG
     */
    seed: (n) => {
      if (typeof seedRNG === 'function') {
        seedRNG(n);
      }
      this.seed = n;
    },

    /**
     * Trigger start game action
     */
    clickStartGame: () => {
      const scene = this.getCurrentScene();
      if (scene && typeof scene.startGame === 'function') {
        scene.startGame();
      }
    },

    /**
     * Collect a coin at position
     */
    collectCoin: (x, y) => {
      const scene = this.getCurrentScene();
      if (scene && typeof scene.collectCoin === 'function') {
        scene.collectCoin(x, y);
      }
    },

    /**
     * Advance one frame (for deterministic testing)
     */
    advanceFrame: () => {
      const scene = this.getCurrentScene();
      const game = scene?.scene?.game;
      if (game && game.loop) {
        game.loop.step(16.67); // ~60fps
      }
    },
  };
}

// Initialize singleton
if (typeof window !== 'undefined') {
  window.__TEST__ = new TestManager();
}

export default TestManager;
```

## BaseScene Class Template

```javascript
// scenes/BaseScene.js
import Phaser from 'phaser';

/**
 * Base scene class that automatically registers with TestManager
 * All game scenes should extend this class
 */
export class BaseScene extends Phaser.Scene {
  constructor(config) {
    super(config);
  }

  /**
   * Called when scene is created
   * Auto-registers with TestManager
   */
  create() {
    // Auto-register with TestManager
    if (typeof window !== 'undefined' && window.__TEST__) {
      window.__TEST__.registerScene(this.scene.key, this);
    }
    
    // Initialize scene-specific logic
    this.initScene();
  }

  /**
   * Override in subclasses for scene-specific initialization
   */
  initScene() {
    // Subclasses implement this
  }

  /**
   * Override to provide scene-specific test state
   * Should return a plain object (JSON-serializable)
   */
  getTestState() {
    return {};
  }

  /**
   * Helper to update test manager ready state
   */
  setTestReady(ready = true) {
    if (typeof window !== 'undefined' && window.__TEST__) {
      window.__TEST__.ready = ready;
    }
  }
}
```

## Example Scene Implementation

```javascript
// scenes/GameScene.js
import { BaseScene } from './BaseScene';

export class GameScene extends BaseScene {
  constructor() {
    super({ key: 'GameScene' });
  }

  initScene() {
    // Initialize game state
    this.gameState = {
      score: 0,
      timer: 0,
      level: 1,
    };

    // Create player
    this.player = this.add.sprite(100, 100, 'player');
    this.player.setData('hp', 100);
    this.player.setData('state', 'idle');

    // Create enemies group
    this.enemies = this.add.group();

    // Set up physics
    this.physics.add.existing(this.player);
    
    // Mark as ready after first frame
    this.time.delayedCall(100, () => {
      this.setTestReady(true);
    });
  }

  /**
   * Provide scene-specific test state
   */
  getTestState() {
    return {
      player: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        hp: this.player.getData('hp'),
        state: this.player.getData('state'),
      },
      enemies: this.enemies.getChildren().map(e => ({
        id: e.id,
        x: Math.round(e.x),
        y: Math.round(e.y),
        hp: e.getData('hp'),
      })),
      level: this.gameState.level,
    };
  }

  /**
   * Functional command: start game
   * Called via window.__TEST__.commands.clickStartGame()
   */
  startGame() {
    this.scene.start('Gameplay');
  }

  /**
   * Functional command: collect coin
   * Called via window.__TEST__.commands.collectCoin(x, y)
   */
  collectCoin(x, y) {
    const coin = this.physics.overlap(this.player, this.coins, (player, coin) => {
      coin.destroy();
      this.gameState.score += 10;
      return true;
    });
  }

  update() {
    // Update frame count for test manager
    if (typeof window !== 'undefined' && window.__TEST__) {
      window.__TEST__.frameCount++;
    }
  }
}
```

## Migration Guide from Individual Implementations

### Step 1: Create TestManager

1. Create `utils/TestManager.js` using the template above
2. Import and initialize in your main game file:
   ```javascript
   // main.ts
   import './utils/TestManager'; // Initializes window.__TEST__
   ```

### Step 2: Create BaseScene

1. Create `scenes/BaseScene.js` using the template above
2. Update all existing scenes to extend `BaseScene` instead of `Phaser.Scene`

### Step 3: Update Scene Registration

**Before:**
```javascript
class GameScene extends Phaser.Scene {
  create() {
    // Scene initialization
  }
}
```

**After:**
```javascript
class GameScene extends BaseScene {
  initScene() {
    // Scene initialization (moved from create())
  }
  
  getTestState() {
    // Return scene-specific state
  }
}
```

### Step 4: Move Test State to getTestState()

**Before:**
```javascript
window.__TEST__ = {
  state: () => ({
    scene: 'GameScene',
    player: { x: this.player.x, y: this.player.y },
  })
};
```

**After:**
```javascript
// In GameScene class
getTestState() {
  return {
    player: { x: this.player.x, y: this.player.y },
  };
}
// Base state (scene, score, etc.) is added automatically
```

### Step 5: Update Commands

**Before:**
```javascript
window.__TEST__.commands = {
  goToScene: (key) => game.scene.start(key),
};
```

**After:**
```javascript
// Commands are in TestManager, but you can add scene-specific ones:
// In TestManager.commands, add methods that call scene methods
```

## Agent Usage Pattern

Agents should use the standardized interface:

```bash
# 1. Wait for ready
agent-browser eval "window.__TEST__.ready"

# 2. Check current scene
agent-browser eval "window.__TEST__.sceneKey"

# 3. Get game state
agent-browser eval "window.__TEST__.gameState()"

# 4. Navigate to scene
agent-browser eval "window.__TEST__.commands.goToScene('GameScene', { level: 1 })"

# 5. Trigger actions
agent-browser eval "window.__TEST__.commands.clickStartGame()"

# 6. Verify state changes
agent-browser eval "window.__TEST__.gameState().score > 0"
```

## Anti-Patterns

### ❌ Don't: Implement `__TEST__` in Each Scene

```javascript
// GameScene.js
window.__TEST__ = { /* GameScene-specific */ };

// MenuScene.js
window.__TEST__ = { /* MenuScene-specific */ };
```

**Problem**: Inconsistent structure, agents can't rely on API

### ✅ Do: Use TestManager + BaseScene

```javascript
// All scenes extend BaseScene
class GameScene extends BaseScene {
  getTestState() { return { /* scene state */ }; }
}
```

### ❌ Don't: Expose Raw Phaser Objects

```javascript
getTestState() {
  return {
    player: this.player, // Raw Phaser.Sprite
  };
}
```

**Problem**: Not JSON-serializable, breaks agent-browser

### ✅ Do: Expose Plain Objects

```javascript
getTestState() {
  return {
    player: {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      hp: this.player.getData('hp'),
    },
  };
}
```

## Testing the Implementation

```bash
# 1. Start game with test mode
agent-browser open http://localhost:3000?test=1&seed=42

# 2. Verify TestManager initialized
agent-browser eval "typeof window.__TEST__ !== 'undefined'"

# 3. Wait for ready
agent-browser eval "window.__TEST__.ready"

# 4. Check scene registration
agent-browser eval "window.__TEST__.sceneKey"

# 5. Verify game state structure
agent-browser eval "Object.keys(window.__TEST__.gameState())"

# 6. Test scene navigation
agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"
agent-browser eval "window.__TEST__.sceneKey === 'GameScene'"
```

## Summary

- Use **TestManager singleton** for centralized test seam management
- Use **BaseScene class** for automatic scene registration
- Override **getTestState()** in each scene for scene-specific state
- Keep state **JSON-serializable** (plain objects, no Phaser instances)
- Use **commands** for functional triggers, not raw Phaser API
- Agents should **skip `snapshot -i`** and use `window.__TEST__` directly
