---
name: phaser-scene-transition-patterns
description: Common Phaser scene transition patterns, data passing, and test seam integration for scene management. Use when implementing scene navigation, passing data between scenes, or integrating test seams for scene transitions. Reduces scene transition implementation time by 30-40%.
---

# Phaser Scene Transition Patterns

Common Phaser scene transition patterns, data passing, and test seam integration. Reduces scene transition implementation time by 30-40%.

## Overview

Standardized patterns for:
- Scene navigation (`this.scene.start()`)
- Data passing between scenes
- Test seam integration for transitions
- State management on transitions

## Core Patterns

### Pattern 1: Scene Navigation

**Use `this.scene.start()` for transitions:**

```typescript
// Navigate to new scene
this.scene.start('GameScene');

// Navigate with data
this.scene.start('GameOverScene', {
  score: this.gameState.score,
  level: this.gameState.level
});
```

**Each scene receives data via `init(data?)` method:**

```typescript
export default class GameOverScene extends Phaser.Scene {
  init(data?: { score?: number; level?: number }) {
    // Receive data from previous scene
    this.finalScore = data?.score || 0;
    this.completedLevel = data?.level || 1;
  }

  create() {
    // Use received data
    this.add.text(100, 100, `Score: ${this.finalScore}`);
  }
}
```

### Pattern 2: Data Passing

**Pass data via scene.start() second parameter:**

```typescript
// In GameScene
gameOver() {
  this.scene.start('GameOverScene', {
    score: this.gameState.score,
    timer: this.gameState.timer,
    level: this.gameState.level
  });
}
```

**Store in shared state object for test seam access:**

```typescript
// Store in registry for cross-scene access
this.registry.set('gameState', {
  score: this.gameState.score,
  level: this.gameState.level
});

// Access in another scene
const gameState = this.registry.get('gameState');
```

**Use Phaser's scene data mechanism for reliability:**

```typescript
// Phaser automatically manages scene data
this.scene.start('NextScene', { key: 'value' });

// Access in next scene
init(data?: { key?: string }) {
  const value = data?.key;
}
```

### Pattern 3: Test Seam Integration

**Add test seam in scene create() method:**

```typescript
create() {
  // Scene initialization
  this.initScene();

  // Test seam setup
  if (window.__TEST__) {
    window.__TEST__.sceneKey = this.scene.key;
    window.__TEST__.commands.goToScene = (key: string, data?: any) => {
      this.scene.start(key, data);
    };
  }
}
```

**Expose sceneKey, commands, and state getters:**

```typescript
window.__TEST__ = {
  sceneKey: this.scene.key,
  gameState: () => ({
    scene: this.scene.key,
    score: this.gameState.score,
    timer: this.gameState.timer
  }),
  commands: {
    goToScene: (key: string, data?: any) => {
      this.scene.start(key, data);
    }
  }
};
```

**Wait for test seam initialization after transitions:**

```bash
# After scene transition, wait for test seam
agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"
agent-browser wait 500  # Wait for scene initialization
agent-browser eval "window.__TEST__.sceneKey"  # Verify transition
```

### Pattern 4: State Management

**Game state clears when transitioning to fresh scenes:**

```typescript
// Each scene initializes state in create() method
create() {
  // Initialize fresh state
  this.gameState = {
    score: 0,
    timer: 60,
    level: 1
  };
}
```

**Test seam enables programmatic state verification:**

```typescript
// Test seam exposes state for verification
window.__TEST__.gameState = () => ({
  scene: this.scene.key,
  score: this.gameState.score,
  timer: this.gameState.timer,
  level: this.gameState.level
});
```

## Complete Scene Transition Example

### GameScene → GameOverScene

**In GameScene:**

```typescript
export default class GameScene extends Phaser.Scene {
  private gameState = {
    score: 0,
    timer: 60,
    level: 1
  };

  gameOver() {
    // Transition with data
    this.scene.start('GameOverScene', {
      score: this.gameState.score,
      timer: this.gameState.timer,
      level: this.gameState.level
    });
  }

  create() {
    // Test seam setup
    if (window.__TEST__) {
      window.__TEST__.sceneKey = this.scene.key;
      window.__TEST__.commands.triggerGameOver = () => {
        this.gameOver();
      };
    }
  }
}
```

**In GameOverScene:**

```typescript
export default class GameOverScene extends Phaser.Scene {
  private finalScore = 0;
  private completedLevel = 1;

  init(data?: { score?: number; level?: number }) {
    // Receive data from GameScene
    this.finalScore = data?.score || 0;
    this.completedLevel = data?.level || 1;
  }

  create() {
    // Display final score
    this.add.text(100, 100, `Final Score: ${this.finalScore}`);

    // Test seam setup
    if (window.__TEST__) {
      window.__TEST__.sceneKey = this.scene.key;
      window.__TEST__.commands.getFinalScore = () => {
        return this.finalScore;
      };
    }
  }
}
```

## Test Seam Commands for Scene Transitions

### Common Commands

```typescript
// Navigate to scene
window.__TEST__.commands.goToScene = (key: string, data?: any) => {
  this.scene.start(key, data);
};

// Navigate to game
window.__TEST__.commands.clickStartGame = () => {
  this.scene.start('GameScene');
};

// Navigate to menu
window.__TEST__.commands.clickMainMenu = () => {
  this.scene.start('MainMenuScene');
};

// Play again
window.__TEST__.commands.clickPlayAgain = () => {
  this.scene.start('GameScene');
};
```

## Scene Lifecycle

### Scene Initialization Order

1. **Constructor**: Configuration constants
2. **init(data?)**: Receive data from previous scene
3. **preload()**: Load assets (if needed)
4. **create()**: Initialize scene, set up test seam
5. **update()**: Game loop

### State Clearing

**Each scene initializes fresh state in create():**

```typescript
create() {
  // State clears naturally when transitioning
  // Each scene starts with fresh state
  this.gameState = {
    score: 0,
    timer: 60
  };
}
```

## Common Patterns

### Pattern 1: MainMenu → GameScene

```typescript
// In MainMenuScene
create() {
  this.startButton.on('pointerdown', () => {
    this.scene.start('GameScene');
  });

  // Test seam
  window.__TEST__.commands.clickStartGame = () => {
    this.scene.start('GameScene');
  };
}
```

### Pattern 2: GameScene → GameOverScene (with data)

```typescript
// In GameScene
gameOver() {
  this.scene.start('GameOverScene', {
    score: this.gameState.score,
    level: this.gameState.level
  });
}

// In GameOverScene
init(data?: { score?: number; level?: number }) {
  this.finalScore = data?.score || 0;
  this.completedLevel = data?.level || 1;
}
```

### Pattern 3: Any Scene → MainMenu

```typescript
// Common pattern for returning to menu
window.__TEST__.commands.clickMainMenu = () => {
  this.scene.start('MainMenuScene');
};
```

## Testing Scene Transitions

### Test Seam Workflow

```bash
# Navigate to scene
agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"

# Wait for transition
agent-browser wait 500

# Verify scene change
agent-browser eval "window.__TEST__.sceneKey === 'GameScene'"

# Verify state
agent-browser eval "window.__TEST__.gameState()"
```

### Console Log Fallback

**If test seam sceneKey doesn't update, use console logs:**

```typescript
// Add console log in scene create()
create() {
  console.log(`Scene created: ${this.scene.key}`);
  
  // Scene initialization
}
```

**Verify in browser console:**

```bash
agent-browser console
# Look for "Scene created: GameScene"
```

## Best Practices

1. **Use `this.scene.start()`** for scene transitions
2. **Pass data via second parameter** of scene.start()
3. **Receive data in `init(data?)`** method
4. **Set up test seam in `create()`** method
5. **Initialize fresh state** in each scene's create()
6. **Wait 500ms** after transitions before checking test seam
7. **Use console logs** as fallback for scene verification

## Integration with Other Skills

- **phaser-scene-navigation**: Complements with navigation patterns
- **phaser-game-testing**: Uses test seam for scene testing
- **browser-test-seam-optimization**: Optimizes scene transition testing

## Related Skills

- `phaser-scene-navigation` - Scene navigation patterns
- `phaser-game-testing` - Phaser testing methodology
- `browser-test-seam-optimization` - Test seam optimization

## Remember

1. **Use scene.start()** for transitions
2. **Pass data via second parameter**
3. **Receive in init()** method
4. **Set up test seam** in create()
5. **Initialize fresh state** per scene
6. **Wait 500ms** after transitions
7. **Use console logs** as fallback
