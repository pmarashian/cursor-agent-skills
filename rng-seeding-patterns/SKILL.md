---
name: rng-seeding-patterns
description: Document when to use seeded vs. unseeded RNG, provide patterns for RNG seed management, include examples of deterministic game logic, document seed regeneration patterns, and provide test patterns for RNG behavior. Use when implementing game features that use random number generation.
---

# RNG Seeding Patterns

## Overview

Patterns for managing random number generation (RNG) in games, including when to use seeded vs. unseeded RNG, seed management, and deterministic game logic.

## When to Use Seeded vs. Unseeded RNG

### Use Seeded RNG When

- **Testing**: Need deterministic behavior for tests
- **Replay functionality**: Want to recreate same game state
- **Debugging**: Need reproducible bugs
- **Deterministic gameplay**: Same seed = same game

**Example**:
```typescript
// Seeded RNG for testing
const seed = 42;
seedRNG(seed);
const maze = generateMaze(seed); // Same maze every time
```

### Use Unseeded RNG When

- **Production gameplay**: Each game should be different
- **Random events**: Need true randomness
- **Non-deterministic features**: Don't need reproducibility

**Example**:
```typescript
// Unseeded RNG for production
const seed = Math.floor(Math.random() * 1000000);
const maze = generateMaze(seed); // Different maze each time
```

## RNG Seed Management Patterns

### Pattern 1: Scene-Level Seed

**Generate seed in `init()` or `create()`** (not constructor):

```typescript
export class GameScene extends Phaser.Scene {
  private mazeSeed: number;

  // ❌ WRONG: Seed in constructor (won't reset on restart)
  constructor() {
    super('GameScene');
    this.mazeSeed = Math.floor(Math.random() * 1000000);
  }

  // ✅ CORRECT: Seed in init() or create()
  init() {
    this.mazeSeed = Math.floor(Math.random() * 1000000);
    seedRNG(this.mazeSeed);
  }

  create() {
    // Use seeded RNG
    const maze = generateMaze(this.mazeSeed);
  }
}
```

### Pattern 2: URL Parameter Seed

**Use seed from URL for testing**:

```typescript
init() {
  const params = new URLSearchParams(window.location.search);
  const seedParam = params.get('seed');
  
  this.mazeSeed = seedParam 
    ? parseInt(seedParam) 
    : Math.floor(Math.random() * 1000000);
  
  seedRNG(this.mazeSeed);
}
```

**Usage**:
```
http://localhost:3000?scene=GameScene&seed=42
```

### Pattern 3: Test Mode Seed

**Use fixed seed in test mode**:

```typescript
init() {
  const isTestMode = new URLSearchParams(window.location.search).has('test');
  
  if (isTestMode) {
    this.mazeSeed = 42; // Fixed seed for testing
  } else {
    this.mazeSeed = Math.floor(Math.random() * 1000000);
  }
  
  seedRNG(this.mazeSeed);
}
```

## Deterministic Game Logic Examples

### Example 1: Maze Generation

**Same seed = same maze**:

```typescript
function generateMaze(seed: number): MazeData {
  seedRNG(seed);
  // Generate maze using seeded RNG
  // Same seed will always produce same maze
  return maze;
}
```

### Example 2: Enemy Spawning

**Same seed = same enemy positions**:

```typescript
function spawnEnemies(seed: number, count: number): Enemy[] {
  seedRNG(seed);
  const enemies: Enemy[] = [];
  
  for (let i = 0; i < count; i++) {
    const x = seededRandom() * width;
    const y = seededRandom() * height;
    enemies.push(new Enemy(x, y));
  }
  
  return enemies;
}
```

### Example 3: Item Placement

**Same seed = same item positions**:

```typescript
function placeItems(seed: number, itemCount: number): Item[] {
  seedRNG(seed);
  const items: Item[] = [];
  
  for (let i = 0; i < itemCount; i++) {
    const position = getRandomEmptyPosition(); // Uses seeded RNG
    items.push(new Item(position.x, position.y));
  }
  
  return items;
}
```

## Seed Regeneration Patterns

### Pattern 1: Regenerate on Scene Restart

**Regenerate seed every time scene starts**:

```typescript
init() {
  // Regenerate seed on every scene start
  this.mazeSeed = Math.floor(Math.random() * 1000000);
  seedRNG(this.mazeSeed);
}
```

### Pattern 2: Preserve Seed Across Restarts

**Keep same seed for testing**:

```typescript
init(data?: any) {
  // Use provided seed or generate new
  this.mazeSeed = data?.seed || Math.floor(Math.random() * 1000000);
  seedRNG(this.mazeSeed);
}

// Restart with same seed
scene.restart({ seed: this.mazeSeed });
```

### Pattern 3: Regenerate on New Game

**New seed for new game, preserve for restart**:

```typescript
startNewGame() {
  this.mazeSeed = Math.floor(Math.random() * 1000000);
  seedRNG(this.mazeSeed);
  this.scene.start('GameScene', { seed: this.mazeSeed });
}

restartGame() {
  // Use same seed for restart
  this.scene.restart({ seed: this.mazeSeed });
}
```

## Test Patterns for RNG Behavior

### Test 1: Deterministic Behavior

**Verify same seed produces same result**:

```typescript
describe('Maze Generation', () => {
  it('generates same maze with same seed', () => {
    const seed = 42;
    const maze1 = generateMaze(seed);
    const maze2 = generateMaze(seed);
    expect(maze1).toEqual(maze2);
  });
});
```

### Test 2: Different Seeds Produce Different Results

**Verify different seeds produce different results**:

```typescript
it('generates different mazes with different seeds', () => {
  const maze1 = generateMaze(42);
  const maze2 = generateMaze(43);
  expect(maze1).not.toEqual(maze2);
});
```

### Test 3: Seed Regeneration

**Verify seed regenerates on scene restart**:

```typescript
it('regenerates seed on scene restart', () => {
  const scene = new GameScene();
  const seed1 = scene.mazeSeed;
  
  scene.init();
  const seed2 = scene.mazeSeed;
  
  expect(seed2).not.toBe(seed1);
});
```

## Seeded RNG Implementation

### Simple Seeded RNG

```typescript
// Simple seeded random number generator
class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

// Global seeded RNG instance
let globalRNG: SeededRNG | null = null;

export function seedRNG(seed: number) {
  globalRNG = new SeededRNG(seed);
}

export function seededRandom(): number {
  if (!globalRNG) {
    seedRNG(Math.floor(Math.random() * 1000000));
  }
  return globalRNG.next();
}
```

### Using Phaser's Seeded RNG

```typescript
// Phaser has built-in seeded RNG
const rng = new Phaser.Math.RandomDataGenerator([seed]);

// Use seeded RNG
const value = rng.between(0, 100);
```

## Best Practices

1. **Use seeded RNG for testing**: Deterministic behavior
2. **Regenerate seed in init()**: Not constructor
3. **Preserve seed for restarts**: If needed for testing
4. **Use URL parameters for test seeds**: Easy testing
5. **Document seed usage**: Explain when/why seeded

## Resources

- `writing-phaser-3-games` skill - Scene lifecycle patterns
- `phaser-game-testing` skill - Testing patterns
