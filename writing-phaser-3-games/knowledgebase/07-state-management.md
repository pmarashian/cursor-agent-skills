## State Management

### Scene-Level State

```javascript
export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');

        // Configuration (set once)
        this.gridWidth = 10;
        this.maxEnemies = 5;

        // References (initialized later)
        this.player;
        this.enemies;
    }

    init() {
        // Reset on scene restart
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
    }

    create() {
        // Initialize objects
        this.player = new Player(this);
        this.enemies = [];
    }

    update() {
        if (this.gameOver) return;  // Early exit

        // Game logic
    }
}
```

**Pattern**:
- Constructor: Configuration (called ONCE when scene is registered)
- Init: Resettable state (called every time scene starts)
- Create: Object initialization (called every time scene starts)
- Update: Game logic with guards (called every frame while scene is active)
- Destroy: Cleanup (called when scene is stopped/removed)

## Scene Lifecycle Methods

### Constructor (Called Once)

**When**: Called when scene is registered with Phaser game
**Purpose**: Set up configuration that never changes
**Common use**: Scene key, default settings, class-level configuration

**Important**: Constructor is **NOT called** when scene restarts (`scene.restart()` or `scene.start()`). State initialized here persists across scene restarts.

```javascript
constructor() {
  super('GameScene');
  // Configuration (set once, never changes)
  this.gridWidth = 10;
  this.maxEnemies = 5;
  
  // ❌ WRONG: Don't initialize resettable state here
  // this.score = 0; // This won't reset on scene restart!
  
  // ✅ CORRECT: Initialize in init() or create()
}
```

### Init (Called Every Scene Start)

**When**: Called every time scene starts (including restarts)
**Purpose**: Reset state that should be fresh each game
**Common use**: Score, level, game over flags, RNG seeds

```javascript
init(data?: any) {
  // Reset on scene restart
  this.score = 0;
  this.level = data?.level || 1;
  this.gameOver = false;
  this.mazeSeed = Math.floor(Math.random() * 1000000);
}
```

### Create (Called Every Scene Start)

**When**: Called every time scene starts (after init)
**Purpose**: Initialize game objects, set up scene
**Common use**: Create sprites, set up input, initialize game objects

```javascript
create() {
  // Initialize objects (called every scene start)
  this.player = new Player(this);
  this.enemies = [];
  this.setupInput();
  this.setupTestSeam();
}
```

### Update (Called Every Frame)

**When**: Called every frame while scene is active
**Purpose**: Game loop logic
**Common use**: Movement, collision detection, game state updates

```javascript
update(time: number, delta: number) {
  if (this.gameOver) return; // Early exit
  
  // Game logic
  this.updatePlayer();
  this.updateEnemies();
}
```

### Destroy (Called on Scene Stop)

**When**: Called when scene is stopped or removed
**Purpose**: Cleanup resources
**Common use**: Remove event listeners, stop sounds, cleanup objects

```javascript
destroy() {
  // Cleanup
  this.input.removeAllListeners();
  if (this.backgroundMusic) {
    this.backgroundMusic.stop();
  }
}
```

## Scene Reuse vs. Recreation

### Scene Reuse (Default)

**Behavior**: Scene instance is reused, constructor called once
**Methods called**: `init()` → `create()` → `update()` (every frame)
**State**: Constructor state persists, init/create state resets

**Use when**: Scene should be reused (most common)

```javascript
// First start
scene.start('GameScene'); // constructor → init → create → update

// Restart
scene.restart(); // init → create → update (constructor NOT called)
```

### Scene Recreation

**Behavior**: New scene instance created, constructor called again
**Methods called**: `constructor()` → `init()` → `create()` → `update()`
**State**: All state is fresh

**Use when**: Need completely fresh scene instance

```javascript
// Remove and recreate
scene.stop('GameScene');
scene.remove('GameScene');
scene.add('GameScene', GameScene, true); // true = auto-start
// constructor → init → create → update
```

## Game State Reset Patterns

### Pattern 1: Reset in Init

**Best for**: Simple state that needs reset

```javascript
init() {
  this.score = 0;
  this.level = 1;
  this.gameOver = false;
}
```

### Pattern 2: Reset in Create

**Best for**: State that depends on initialized objects

```javascript
create() {
  this.score = 0;
  this.level = 1;
  this.gameOver = false;
  
  // Then initialize objects
  this.player = new Player(this);
}
```

### Pattern 3: Reset Method

**Best for**: Complex state that needs centralized reset

```javascript
resetGameState() {
  this.score = 0;
  this.level = 1;
  this.gameOver = false;
  this.mazeSeed = Math.floor(Math.random() * 1000000);
}

init() {
  this.resetGameState();
}

create() {
  this.resetGameState(); // Also call in create if needed
  // Initialize objects
}
```

## Common Pitfalls

### Pitfall 1: State in Constructor

**Problem**: State initialized in constructor persists across restarts

```javascript
// ❌ WRONG
constructor() {
  super('GameScene');
  this.mazeSeed = Math.floor(Math.random() * 1000000); // Won't reset!
}

// ✅ CORRECT
constructor() {
  super('GameScene');
  // No resettable state here
}

init() {
  this.mazeSeed = Math.floor(Math.random() * 1000000); // Resets every time
}
```

### Pitfall 2: State Persistence

**Problem**: State not reset on scene restart

```javascript
// ❌ WRONG
create() {
  if (!this.initialized) {
    this.score = 0;
    this.initialized = true;
  }
  // Score won't reset on restart!
}

// ✅ CORRECT
init() {
  this.score = 0; // Always reset
}
```

### Pitfall 3: Random Seed Not Regenerating

**Problem**: RNG seed set in constructor, doesn't regenerate on restart

```javascript
// ❌ WRONG
constructor() {
  super('GameScene');
  this.mazeSeed = Math.floor(Math.random() * 1000000);
}

// ✅ CORRECT
init() {
  this.mazeSeed = Math.floor(Math.random() * 1000000);
}

// Or in create()
create() {
  this.mazeSeed = Math.floor(Math.random() * 1000000);
}
```

## Random Seed Management Patterns

### Pattern 1: New Seed Every Game

**Use when**: Each game should be different

```javascript
init() {
  this.mazeSeed = Math.floor(Math.random() * 1000000);
}
```

### Pattern 2: Seeded for Testing

**Use when**: Need deterministic behavior for testing

```javascript
init(data?: any) {
  // Use provided seed or generate new one
  this.mazeSeed = data?.seed || Math.floor(Math.random() * 1000000);
  seedRNG(this.mazeSeed); // Seed global RNG
}
```

### Pattern 3: Seed from URL Parameter

**Use when**: Testing with specific seeds

```javascript
init() {
  const params = new URLSearchParams(window.location.search);
  const seedParam = params.get('seed');
  this.mazeSeed = seedParam 
    ? parseInt(seedParam) 
    : Math.floor(Math.random() * 1000000);
  seedRNG(this.mazeSeed);
}
```

---

### Registry Pattern (Cross-Scene Persistence)

```javascript
// Boot.js - Initialize
create() {
    this.registry.set('highscore', 0);
    this.registry.set('musicVolume', 1);
}

// Any Scene - Read
this.highscore = this.registry.get('highscore');

// Any Scene - Update
this.registry.set('highscore', this.score);

// Listen for changes
this.registry.events.on('changedata-highscore', (parent, value) => {
    this.highscoreText.setText(`High: ${value}`);
});
```

**Use Case**: High scores, settings, unlocks that persist across scenes.

---

### LocalStorage Persistence

```javascript
// Load
create() {
    const saved = localStorage.getItem('highscore');
    this.highscore = (saved !== null) ? parseInt(saved) : 0;
}

// Save
gameOver() {
    if (this.score > this.highscore) {
        localStorage.setItem('highscore', this.score);
    }
}
```

---

### GameObject Data Component

```javascript
// Initialization
sprite.setData({
    gridX: x,
    gridY: y,
    type: 'enemy',
    health: 100
});

// Fast direct access (performance critical)
sprite.data.values.health -= damage;

// Slower method calls (initialization/infrequent)
sprite.data.set('health', newValue);
const health = sprite.data.get('health');

// Use case: Store current vs correct state
tile.setData({
    currentPosition: { x: 0, y: 0 },
    correctPosition: { x: 2, y: 3 }
});

// Win condition check
isCorrect() {
    return (
        tile.data.values.currentPosition.x ===
        tile.data.values.correctPosition.x
    );
}
```

**Benefits**:
- Type-safe custom properties
- No pollution of sprite namespace
- Event support via DataManager

---

### State Machines with Flags

```javascript
const GameStates = {
    LOADING: 0,
    READY: 1,
    PLAYING: 2,
    PAUSED: 3,
    GAME_OVER: 4
};

constructor() {
    this.state = GameStates.LOADING;
}

update() {
    switch (this.state) {
        case GameStates.PLAYING:
            this.updateGameplay();
            break;
        case GameStates.PAUSED:
            // Skip gameplay updates
            break;
    }
}

// Or simpler boolean flags
constructor() {
    this.isPaused = false;
    this.isGameOver = false;
    this.allowInput = true;
}

update() {
    if (this.isGameOver || this.isPaused) return;
    if (!this.allowInput) return;

    // Process normally
}
```

---

### Entity State Flags

```javascript
constructor() {
    this.isAlive = true;
    this.isInvincible = false;
    this.isGrounded = false;
    this.isFiring = false;
}

preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (!this.isAlive) return;

    // Ground check
    this.isGrounded = this.body.touching.down;

    // Jump only when grounded
    if (JustDown(this.jumpKey) && this.isGrounded) {
        this.jump();
    }
}
```

---

### Cross-Scene Communication via Events

```javascript
// Emit from one scene
this.registry.events.emit('player-hit', damageAmount);

// Listen in another scene
this.registry.events.on('player-hit', (damage) => {
    this.updateHealthBar(damage);
});

// Cleanup
shutdown() {
    this.registry.events.removeAllListeners();
}
```

---

