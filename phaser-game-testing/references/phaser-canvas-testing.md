# Phaser / Canvas / WebGL Testing

## Related Phaser Skills

For implementation details and patterns, see:
- **Spritesheet Loading & Nine-Slice**: `@phaser-gamedev/references/spritesheets-nineslice.md` - Measurement protocols, frame dimension verification, spacing/margin detection
- **Tilemap Setup**: `@phaser-gamedev/references/tilemaps.md` - Tiled integration, collision layers, object layers, GID system
- **Physics Configuration**: `@phaser-gamedev/references/arcade-physics.md` - Deep dive into Arcade Physics configuration
- **Performance**: `@phaser-gamedev/references/performance.md` - Object pooling, optimization patterns
- **Scene Architecture**: `@writing-phaser-3-games/knowledgebase/01-scene-architecture.md` - Multi-scene flow, parallel scenes, transitions
- **Asset Management**: `@writing-phaser-3-games/knowledgebase/02-asset-management.md` - Two-stage loading, texture atlases
- **Physics & Collision**: `@writing-phaser-3-games/knowledgebase/03-physics-collision.md` - Collision vs overlap patterns
- **Animation System**: `@writing-phaser-3-games/knowledgebase/05-animation-system.md` - Global animations, state-based control
- **Input Handling**: `@writing-phaser-3-games/knowledgebase/06-input-handling.md` - JustDown pattern, dual input support
- **State Management**: `@writing-phaser-3-games/knowledgebase/07-state-management.md` - Scene-level state, registry patterns
- **Object Pooling**: `@writing-phaser-3-games/knowledgebase/08-object-pooling-memory.md` - Group-based pooling, memory management

---

## Why Canvas/WebGL Tests Get Flaky

Common nondeterminism sources:
- Variable frame times (CPU load, headless rendering)
- Time-based movement/physics without fixed timestep
- RNG for loot/spawns/AI decisions
- Async asset loading and "first frame" races
- Font loading differences affecting mixed DOM+canvas layouts
- GPU/driver differences in rendering

**The fix is not "more retries"—it's deterministic mode + explicit readiness.**

## URL Parameter Parsing for Direct Scene Access

Parse URL parameters to support direct scene access and test mode:

```javascript
// main.ts
const params = new URLSearchParams(window.location.search);
const sceneParam = params.get('scene');
const isTestMode = params.has('test');
const seedParam = params.get('seed');

// Determine initial scene
const initialScenes = sceneParam 
  ? [sceneParam] // Start directly at specified scene
  : [BootScene, PreloaderScene, MenuScene, GameScene]; // Normal flow

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: initialScenes,
  // ... other config
};

const game = new Phaser.Game(config);

// Initialize test mode if requested
if (isTestMode) {
  const seed = seedParam ? parseInt(seedParam) : 12345;
  seedRNG(seed);
  if (window.__TEST__) {
    window.__TEST__.seed = seed;
  }
}
```

### Helper Functions for Scene Initialization

```javascript
// utils/sceneHelpers.js
export function parseSceneParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    scene: params.get('scene'),
    test: params.has('test'),
    seed: params.get('seed') ? parseInt(params.get('seed')) : null,
    level: params.get('level') ? parseInt(params.get('level')) : null,
  };
}

export function initializeSceneWithTestData(scene, testData) {
  if (testData.seed) {
    seedRNG(testData.seed);
    window.__TEST__.seed = testData.seed;
  }
  
  if (testData.level) {
    scene.gameState = { level: testData.level };
  }
}
```

### Usage Example

```bash
# Direct scene access with test mode
http://localhost:3000?scene=GameScene&test=1&seed=42&level=3
```

## Deterministic Mode Pattern

When `?test=1` query param (or build-time flag) is enabled:

```javascript
// In game initialization
const params = new URLSearchParams(window.location.search);
const isTestMode = params.has('test');

if (isTestMode) {
  // 1. Seed RNG
  const seed = parseInt(params.get('seed')) || 12345;
  Math.random = seededRandom(seed);
  if (window.__TEST__) {
    window.__TEST__.seed = seed;
  }

  // 2. Fixed timestep
  game.loop.targetFps = 60;
  game.loop.forceSetTimeOut = true; // Consistent frame timing

  // 3. Disable visual noise
  disableCameraShake();
  disableParticles();
  disableScreenFlash();

  // 4. Ensure assets preloaded before interaction
  await preloadAllAssets();
}
```

## TestManager Implementation Pattern

For standardized test seams across all scenes, use a TestManager singleton:

```javascript
// utils/TestManager.js
class TestManager {
  constructor() {
    this.ready = false;
    this.seed = null;
    this.sceneKey = null;
    this.scenes = new Map();
    this.frameCount = 0;
    this.assetsLoaded = false;
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
    
    const baseState = {
      scene: this.sceneKey,
      score: scene.gameState?.score || 0,
      timer: scene.gameState?.timer || 0,
      inventory: scene.gameState?.inventory || [],
    };
    
    // Merge scene-specific state
    if (scene.getTestState) {
      return { ...baseState, ...scene.getTestState() };
    }
    return baseState;
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
      const scene = this.getCurrentScene();
      const game = scene?.scene?.game;
      if (game) {
        game.scene.start(key, data);
      }
    },
    reset: () => {
      const scene = this.getCurrentScene();
      const game = scene?.scene?.game;
      if (game) {
        game.scene.start('MainMenu');
      }
    },
    seed: (n) => {
      seedRNG(n);
      this.seed = n;
    }
  };
}

// Initialize singleton
window.__TEST__ = new TestManager();
```

### BaseScene Pattern

Create a BaseScene that automatically registers with TestManager:

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

// Usage in GameScene
class GameScene extends BaseScene {
  initScene() {
    this.player = this.add.sprite(100, 100, 'player');
    this.gameState = { score: 0 };
  }

  getTestState() {
    return {
      player: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        hp: this.player.getData('hp') || 100
      }
    };
  }
}
```

## Implementing the Test Seam (Legacy Pattern)

For projects not yet using TestManager, the basic pattern:

```javascript
// Add to your game's boot or create phase
window.__TEST__ = {
  ready: false,
  seed: null,
  sceneKey: null,
  frameCount: 0,
  assetsLoaded: false,

  state: () => ({
    // Scene state (see @writing-phaser-3-games/knowledgebase/01-scene-architecture.md)
    scene: game.scene.getScenes(true)[0]?.scene.key,
    activeScenes: game.scene.getScenes(true).map(s => s.scene.key),
    
    // Player state
    player: {
      x: Math.round(this.player?.x || 0),
      y: Math.round(this.player?.y || 0),
      hp: this.player?.getData('hp') || 0,
      state: this.player?.getData('state') || 'idle',
      velocity: {
        x: Math.round(this.player?.body?.velocity?.x || 0),
        y: Math.round(this.player?.body?.velocity?.y || 0)
      }
    },
    
    // Entity state
    enemies: getEnemyStates(),
    projectiles: getProjectileStates(),
    
    // Game state (see @writing-phaser-3-games/knowledgebase/07-state-management.md)
    score: gameState.score,
    resources: gameState.resources,
    level: gameState.level,
    
    // Animation state (see @writing-phaser-3-games/knowledgebase/05-animation-system.md)
    animations: {
      player: this.player?.anims?.currentAnim?.key || null,
      isPlaying: this.player?.anims?.isPlaying || false,
      frame: this.player?.anims?.currentFrame?.index || 0
    },
    
    // Tilemap state (see @phaser-gamedev/references/tilemaps.md)
    tilemap: this.map ? {
      layers: this.map.layers.map(l => ({
        name: l.name,
        visible: l.visible,
        alpha: l.alpha
      })),
      collisionTiles: this.groundLayer?.getTilesWithin(0, 0, this.map.width, this.map.height)
        .filter(t => t.canCollide).length || 0,
      objectCount: this.map.getObjectLayer('Objects')?.objects?.length || 0
    } : null,
    
    // Physics state (see @phaser-gamedev/references/arcade-physics.md)
    physics: {
      worldBounds: {
        x: this.physics.world.bounds.x,
        y: this.physics.world.bounds.y,
        width: this.physics.world.bounds.width,
        height: this.physics.world.bounds.height
      },
      gravity: this.physics.world.gravity
    },
    
    // Object pool state (see @writing-phaser-3-games/knowledgebase/08-object-pooling-memory.md)
    pools: {
      projectiles: {
        total: this.projectiles?.getLength() || 0,
        active: this.projectiles?.getChildren().filter(p => p.active).length || 0
      },
      enemies: {
        total: this.enemies?.getLength() || 0,
        active: this.enemies?.getChildren().filter(e => e.active).length || 0
      }
    }
  }),

  commands: {
    reset: () => game.scene.start('MainMenu'),
    seed: (n) => { seedRNG(n); window.__TEST__.seed = n; },
    skipIntro: () => game.scene.start('Gameplay'),
    advanceFrame: () => game.loop.step(16.67),
    
    // Scene control (see @writing-phaser-3-games/knowledgebase/01-scene-architecture.md)
    startScene: (key, data) => game.scene.start(key, data),
    pauseScene: (key) => game.scene.pause(key),
    resumeScene: (key) => game.scene.resume(key),
    
    // Animation control (see @writing-phaser-3-games/knowledgebase/05-animation-system.md)
    playAnimation: (key) => this.player?.play(key),
    stopAnimation: () => this.player?.anims?.stop(),
    
    // Physics control (see @phaser-gamedev/references/arcade-physics.md)
    setGravity: (x, y) => this.physics.world.setGravity(x, y),
    
    // Tilemap control (see @phaser-gamedev/references/tilemaps.md)
    getTileAt: (x, y) => {
      const tile = this.groundLayer?.getTileAt(x, y);
      return tile ? { index: tile.index, canCollide: tile.canCollide, properties: tile.properties } : null;
    }
  }
};

// Set ready after:
// 1. Preload completed (see @writing-phaser-3-games/knowledgebase/02-asset-management.md)
// 2. First scene created
// 3. First render tick occurred
game.events.on('ready', () => {
  window.__TEST__.ready = true;
});

// Track frame count for deterministic timing
game.events.on('step', () => {
  window.__TEST__.frameCount++;
});
```

## What to Assert (Avoid Brittle Assertions)

**Good assertions** (match player-visible behavior):
- "Player can start" → scene key is correct, UI state is interactive
- "Attack damages enemy" → enemy HP decreased after attack action
- "Collecting coin increments score" → score increased by expected amount
- "Player dies at 0 HP" → death state triggered, game over UI shown

**Brittle assertions to avoid:**
- Exact pixel positions without fixed dt and RNG
- Internal array/map ordering
- Sprite instance properties directly
- Animation frame indices

## Screenshot Testing: Making It Reliable

Before comparing screenshots:

1. **Lock viewport + DPR:**
   ```bash
   agent-browser set viewport 1280 720
   ```

2. **Set deterministic mode:**
   ```
   Navigate to: http://localhost:3000?test=1&seed=42
   ```

3. **Wait for stable frame:**
   ```bash
   # Via agent-browser eval
   agent-browser eval "window.__TEST__.ready && window.__TEST__.frameCount >= 10"
   # Or use wait command
   agent-browser wait --fn "window.__TEST__.ready && window.__TEST__.frameCount >= 10"
   ```

4. **Target screenshots strategically:**
   - Menu screens (static, predictable)
   - First gameplay frame after deterministic setup
   - Specific game states (pause menu, game over)

  NOT every frame or random gameplay moments.

## UI Slicing Regressions (Nine-Slice / Ribbons / Bars)

For visual bugs in UI panels, ribbons, or HUD bars, stop relying on the full game flow—use a dedicated UI harness scene.

**Before testing UI slicing, ensure spritesheets load correctly** (see `@phaser-gamedev/references/spritesheets-nineslice.md`):
- Measure frame dimensions accurately
- Verify spacing/margin parameters
- Test raw frame visualization before assembled panels
- Document asset parameters for reference

### Harness Pattern
1. Load only the UI assets (papers, ribbons, bars) into `test.html`.
2. Present each element twice: raw frame/tile views and final assembled render at different sizes.
3. Add keyboard controls (`1..N`) plus `window.__TEST__.commands.showTest(n)` so agent-browser can flip modes.
4. Capture targeted screenshots (panels, ribbons, bars) deterministically; diff them in CI with `scripts/imgdiff.py`.

This makes nine-slice/trimming issues and segmented ribbons easy to spot without the noise of gameplay.

### Testing Spritesheet Loading

```javascript
// Expose spritesheet verification in test seam
window.__TEST__.commands = {
  // ... other commands ...
  
  verifySpritesheet: (key) => {
    const texture = this.textures.get(key);
    const frames = texture.getFrameNames();
    return {
      key,
      frameCount: frames.length,
      frameWidth: texture.get(0).width,
      frameHeight: texture.get(0).height,
      totalWidth: texture.source[0].width,
      totalHeight: texture.source[0].height
    };
  },
  
  showRawFrames: (key, frameCount) => {
    // Display all frames in a grid for visual verification
    // See @phaser-gamedev/references/spritesheets-nineslice.md for implementation
  }
};
```

**Test assertions:**
```bash
# Verify spritesheet loaded correctly
agent-browser eval "window.__TEST__.commands.verifySpritesheet('ui-panel')"

# Check frame dimensions match expected values
agent-browser eval "const info = window.__TEST__.commands.verifySpritesheet('ui-panel'); info.frameWidth === 106 && info.frameHeight === 106"
```

See the UI harness instructions in the main skill and `docs/postmortem-ui-panel-rendering.md` for reference.

## Phaser-Specific Patterns

### Fixed Timestep for Physics

For deterministic physics (see `@phaser-gamedev/references/arcade-physics.md` and `@writing-phaser-3-games/knowledgebase/03-physics-collision.md`):

```javascript
const config = {
  physics: {
    default: 'arcade',
    arcade: {
      // Fixed timestep for deterministic physics
      fps: 60,
      timeScale: 1,
      // Additional test mode settings
      debug: false,
      gravity: { x: 0, y: 300 }
    }
  }
};
```

**In test mode, also consider:**
```javascript
if (isTestMode) {
  // Lock physics timestep
  this.physics.world.timeScale = 1;
  // Disable debug rendering for consistent screenshots
  this.physics.world.drawDebug = false;
}
```

### Seeding Phaser's RNG

Phaser has built-in seeded random (see `@writing-phaser-3-games/knowledgebase/15-algorithm-implementations.md` for RNG usage):

```javascript
// Phaser has built-in seeded random
const seed = parseInt(params.get('seed')) || 12345;
const rnd = new Phaser.Math.RandomDataGenerator([seed.toString()]);

// Use rnd.frac(), rnd.between(), etc. instead of Math.random()
// Store in test seam for verification
window.__TEST__.seed = seed;
window.__TEST__.rng = rnd;
```

**Test assertions:**
```bash
# Verify RNG is seeded
agent-browser eval "window.__TEST__.seed === 42"

# Test deterministic random values
agent-browser eval "window.__TEST__.rng.frac()"  # Should be same each run with same seed
```

### Waiting for Asset Load

For two-stage loading patterns (see `@writing-phaser-3-games/knowledgebase/02-asset-management.md`):

```javascript
// In Boot scene - minimal assets for preloader UI
preload() {
  this.load.image('loading-bar', 'assets/ui/loading-bar.png');
}

// In Preloader scene - full asset loading
preload() {
  // Load all game assets
  this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 48 });
  // ... more assets
}

create() {
  // Create global animations (see @writing-phaser-3-games/knowledgebase/05-animation-system.md)
  this.anims.create({
    key: 'player-walk',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  
  // Signal assets loaded
  window.__TEST__.assetsLoaded = true;
}

// Wait for complete load
this.load.on('complete', () => {
  window.__TEST__.assetsLoaded = true;
  window.__TEST__.ready = true; // If this is the last step
});
```

**Test assertions:**
```bash
# Wait for assets to load
agent-browser wait --fn "window.__TEST__.assetsLoaded === true"

# Verify animations were created
agent-browser eval "this.anims.get('player-walk') !== undefined"
```

### Exposing Entity State Safely

```javascript
// Don't expose: this.player (Sprite instance)
// Do expose:
window.__TEST__.state = () => ({
  player: {
    x: Math.round(this.player.x),
    y: Math.round(this.player.y),
    hp: this.player.getData('hp'),
    state: this.player.getData('state')
  }
});
```

## Tilemap Testing

For games using Tiled tilemaps (see `@phaser-gamedev/references/tilemaps.md` for implementation):

### Testing Collision Layers

```javascript
// Expose tilemap state in test seam
window.__TEST__.state = () => ({
  // ... other state ...
  tilemap: {
    layers: this.map.layers.map(l => ({
      name: l.name,
      visible: l.visible,
      tileCount: l.data?.filter(t => t !== 0).length || 0
    })),
    collisionTiles: this.groundLayer?.getTilesWithin(0, 0, this.map.width, this.map.height)
      .filter(t => t.canCollide).length || 0
  }
});
```

**Test assertions:**
```bash
# Verify collision layer setup
agent-browser eval "window.__TEST__.state().tilemap.collisionTiles > 0"

# Check specific layer exists
agent-browser eval "window.__TEST__.state().tilemap.layers.some(l => l.name === 'Ground')"
```

### Testing Object Layers

```javascript
// Expose object layer data
window.__TEST__.state = () => ({
  // ... other state ...
  objects: {
    enemies: this.map.filterObjects('Enemies', obj => obj.type === 'enemy').length,
    collectibles: this.map.filterObjects('Collectibles', obj => obj.type === 'coin').length,
    spawnPoints: this.map.filterObjects('Objects', obj => obj.name === 'PlayerSpawn').length
  }
});
```

**Test assertions:**
```bash
# Verify enemies spawned from object layer
agent-browser eval "window.__TEST__.state().objects.enemies === 5"

# Check player spawn point exists
agent-browser eval "window.__TEST__.state().objects.spawnPoints === 1"
```

### Testing Procedural Tilemaps

For procedurally generated tilemaps with seeded RNG:

```javascript
// Seed RNG before generation
window.__TEST__.commands.generateMap = (seed) => {
  seedRNG(seed);
  generateCaveMap(seed); // Your procedural generation function
  window.__TEST__.seed = seed;
};

// Expose map generation state
window.__TEST__.state = () => ({
  // ... other state ...
  mapGeneration: {
    seed: window.__TEST__.seed,
    width: this.map.width,
    height: this.map.height,
    floorTiles: this.groundLayer?.getTilesWithin(0, 0, this.map.width, this.map.height)
      .filter(t => t.index === FLOOR_TILE).length || 0
  }
});
```

**Test assertions:**
```bash
# Verify same seed produces same map
agent-browser eval "window.__TEST__.commands.generateMap(42); const state1 = window.__TEST__.state().mapGeneration"
agent-browser eval "window.__TEST__.commands.generateMap(42); const state2 = window.__TEST__.state().mapGeneration; state1.floorTiles === state2.floorTiles"
```

## Animation Testing

Testing animation state and transitions (see `@writing-phaser-3-games/knowledgebase/05-animation-system.md`):

### Exposing Animation State

```javascript
window.__TEST__.state = () => ({
  // ... other state ...
  animations: {
    player: {
      current: this.player?.anims?.currentAnim?.key || null,
      isPlaying: this.player?.anims?.isPlaying || false,
      frame: this.player?.anims?.currentFrame?.index || 0,
      progress: this.player?.anims?.getProgress() || 0
    },
    enemies: this.enemies?.getChildren().map(e => ({
      id: e.id,
      animation: e.anims?.currentAnim?.key || null,
      isPlaying: e.anims?.isPlaying || false
    })) || []
  }
});
```

### Testing Animation Transitions

```javascript
window.__TEST__.commands = {
  // ... other commands ...
  
  waitForAnimation: (entity, animKey) => {
    return new Promise((resolve) => {
      const check = () => {
        if (entity.anims.currentAnim?.key === animKey && entity.anims.isPlaying) {
          entity.once('animationcomplete', () => resolve(true));
        } else {
          setTimeout(check, 16);
        }
      };
      check();
    });
  }
};
```

**Test assertions:**
```bash
# Verify player animation started
agent-browser eval "window.__TEST__.state().animations.player.current === 'walk'"

# Wait for animation to complete
agent-browser eval "await window.__TEST__.commands.waitForAnimation(window.__TEST__.state().player, 'attack')"

# Check animation frame progression
agent-browser press Space  # Trigger attack
agent-browser wait --fn "window.__TEST__.state().animations.player.frame > 0"
```

### Testing Animation Events

```javascript
// In game code, expose animation event state
this.player.on('animationcomplete-attack', () => {
  window.__TEST__.lastAnimationEvent = {
    entity: 'player',
    animation: 'attack',
    timestamp: Date.now()
  };
});
```

**Test assertions:**
```bash
# Verify animation event fired
agent-browser press Space
agent-browser wait --fn "window.__TEST__.lastAnimationEvent?.animation === 'attack'"
```

## Input Handling Testing

Testing input patterns (see `@writing-phaser-3-games/knowledgebase/06-input-handling.md`):

### Testing JustDown Pattern

```javascript
// Expose input state
window.__TEST__.state = () => ({
  // ... other state ...
  input: {
    keysDown: {
      left: this.cursors?.left?.isDown || false,
      right: this.cursors?.right?.isDown || false,
      up: this.cursors?.up?.isDown || false,
      space: this.spacebar?.isDown || false
    },
    justPressed: {
      space: Phaser.Input.Keyboard.JustDown(this.spacebar),
      jump: this.jumpKeyJustPressed // Your custom flag
    }
  }
});
```

**Test assertions:**
```bash
# Test single-press detection (JustDown)
agent-browser press Space
agent-browser eval "window.__TEST__.state().input.justPressed.space === true"

# Verify continuous key hold
agent-browser press ArrowRight --hold
agent-browser eval "window.__TEST__.state().input.keysDown.right === true"
```

### Testing Input Gating

For input gated during animations:

```javascript
window.__TEST__.state = () => ({
  // ... other state ...
  input: {
    // ... other input state ...
    gated: {
      canJump: !this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== 'attack',
      canMove: !this.player.getData('stunned')
    }
  }
});
```

**Test assertions:**
```bash
# Verify input is gated during attack
agent-browser press Space  # Start attack
agent-browser press ArrowRight  # Try to move
agent-browser eval "window.__TEST__.state().input.gated.canMove === false"
```

### Testing Dual Input (Keyboard + Pointer)

```javascript
window.__TEST__.state = () => ({
  // ... other state ...
  input: {
    // ... other input state ...
    pointer: {
      x: this.input.activePointer?.worldX || 0,
      y: this.input.activePointer?.worldY || 0,
      isDown: this.input.activePointer?.isDown || false
    }
  }
});
```

**Test assertions:**
```bash
# Test pointer input
agent-browser click 400 300
agent-browser eval "window.__TEST__.state().input.pointer.isDown === true"
```

## Object Pooling Testing

Testing object pools and memory management (see `@writing-phaser-3-games/knowledgebase/08-object-pooling-memory.md`):

### Exposing Pool State

```javascript
window.__TEST__.state = () => ({
  // ... other state ...
  pools: {
    projectiles: {
      total: this.projectiles?.getLength() || 0,
      active: this.projectiles?.getChildren().filter(p => p.active).length || 0,
      inactive: this.projectiles?.getChildren().filter(p => !p.active).length || 0
    },
    enemies: {
      total: this.enemies?.getLength() || 0,
      active: this.enemies?.getChildren().filter(e => e.active).length || 0,
      inactive: this.enemies?.getChildren().filter(e => !e.active).length || 0
    }
  }
});
```

### Testing Pool Reuse

```javascript
window.__TEST__.commands = {
  // ... other commands ...
  
  fireProjectile: () => {
    const before = window.__TEST__.state().pools.projectiles;
    this.fire(); // Your fire method
    const after = window.__TEST__.state().pools.projectiles;
    return {
      before,
      after,
      reused: before.total === after.total && after.active > before.active
    };
  }
};
```

**Test assertions:**
```bash
# Verify pool reuse (no new objects created)
agent-browser eval "const result = window.__TEST__.commands.fireProjectile(); result.reused === true"

# Check pool doesn't grow unbounded
agent-browser eval "for(let i=0; i<100; i++) window.__TEST__.commands.fireProjectile(); window.__TEST__.state().pools.projectiles.total <= 20"
```

### Testing Pool Cleanup

```javascript
window.__TEST__.commands = {
  // ... other commands ...
  
  cleanupPools: () => {
    const before = {
      projectiles: window.__TEST__.state().pools.projectiles.total,
      enemies: window.__TEST__.state().pools.enemies.total
    };
    
    // Disable all inactive objects
    this.projectiles?.getChildren().forEach(p => {
      if (!p.active) p.disableBody(true, true);
    });
    
    const after = {
      projectiles: window.__TEST__.state().pools.projectiles.total,
      enemies: window.__TEST__.state().pools.enemies.total
    };
    
    return { before, after };
  }
};
```

**Test assertions:**
```bash
# Verify inactive objects are cleaned up
agent-browser eval "window.__TEST__.commands.cleanupPools()"
agent-browser eval "window.__TEST__.state().pools.projectiles.inactive === 0"
```

## Test Workflow for Phaser Games

1. **Navigate** with `?test=1&seed=<number>`
   ```bash
   agent-browser open http://localhost:3000?test=1&seed=42
   ```

2. **Wait** for `window.__TEST__.ready === true`
   ```bash
   agent-browser wait --fn "window.__TEST__.ready === true"
   ```

3. **Drive input** via `agent-browser press` for WASD/arrows, `agent-browser click` for UI
   ```bash
   agent-browser snapshot -i
   agent-browser click @e1
   agent-browser press ArrowRight
   ```

4. **Wait** for game state change (poll `window.__TEST__.state()`)
   ```bash
   agent-browser wait --fn "window.__TEST__.state().player.x > 100"
   ```

5. **Assert** state matches expected outcome
   ```bash
   agent-browser eval "window.__TEST__.state().score"
   ```

6. **Screenshot** at known deterministic points only
   ```bash
   agent-browser screenshot gameplay-state.png
   ```

## Testing Strategy Summary

### Quick Reference by Feature

| Feature | Test Seam Property | Related Skill Reference |
|---------|-------------------|------------------------|
| **Scenes** | `state().scene`, `state().activeScenes` | `@writing-phaser-3-games/knowledgebase/01-scene-architecture.md` |
| **Spritesheets** | `commands.verifySpritesheet(key)`, `commands.showRawFrames()` | `@phaser-gamedev/references/spritesheets-nineslice.md` |
| **Tilemaps** | `state().tilemap`, `state().objects` | `@phaser-gamedev/references/tilemaps.md` |
| **Physics** | `state().physics`, `commands.setGravity()` | `@phaser-gamedev/references/arcade-physics.md` |
| **Animations** | `state().animations`, `commands.waitForAnimation()` | `@writing-phaser-3-games/knowledgebase/05-animation-system.md` |
| **Input** | `state().input`, `state().input.gated` | `@writing-phaser-3-games/knowledgebase/06-input-handling.md` |
| **State** | `state().score`, `state().resources` | `@writing-phaser-3-games/knowledgebase/07-state-management.md` |
| **Object Pools** | `state().pools`, `commands.fireProjectile()` | `@writing-phaser-3-games/knowledgebase/08-object-pooling-memory.md` |

### Testing Checklist

Before writing tests, ensure:

- [ ] **Deterministic mode enabled** (`?test=1&seed=42`)
- [ ] **RNG seeded** (Phaser's `RandomDataGenerator` or custom)
- [ ] **Fixed timestep** (physics `fps: 60`, `timeScale: 1`)
- [ ] **Test seam implemented** (`window.__TEST__` with `ready`, `state()`, `commands`)
- [ ] **Assets preloaded** (`window.__TEST__.assetsLoaded === true`)
- [ ] **Viewport locked** (`agent-browser set viewport 1280 720`)
- [ ] **Animations disabled** (or deterministic) in test mode
- [ ] **Visual noise disabled** (particles, camera shake, screen flash)

### Common Test Patterns

**Scene transition:**
```bash
agent-browser eval "window.__TEST__.commands.startScene('Game', { level: 1 })"
agent-browser wait --fn "window.__TEST__.state().scene === 'Game'"
```

**State assertion:**
```bash
agent-browser eval "window.__TEST__.state().score >= 100"
```

**Animation completion:**
```bash
agent-browser press Space
agent-browser wait --fn "window.__TEST__.state().animations.player.current === 'idle'"
```

**Pool verification:**
```bash
agent-browser eval "window.__TEST__.state().pools.projectiles.total <= 20"
```

### Debugging Failed Tests

1. **Check console errors**: `agent-browser errors`
2. **Verify readiness**: `agent-browser eval "window.__TEST__.ready"`
3. **Inspect state**: `agent-browser eval "JSON.stringify(window.__TEST__.state(), null, 2)"`
4. **Screenshot failure**: `agent-browser screenshot failure.png`
5. **Check asset loading**: `agent-browser eval "window.__TEST__.assetsLoaded"`
6. **Verify determinism**: Check seed, timestep, RNG state

For more debugging patterns, see `references/flake-reduction.md`.
