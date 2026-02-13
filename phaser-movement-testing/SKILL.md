---
name: phaser-movement-testing
description: Standardized patterns for testing Phaser game movement, including key state handling and collision verification. Use when testing player movement, collision detection, or when movement testing challenges occur. Phaser requires keydown/keyup pattern, not single press events.
---

# Phaser Movement Testing

## Overview

Standardize Phaser movement testing patterns. Phaser uses continuous key state checking, not discrete events.

## Key Input Pattern

**Phaser requires `keydown`/`keyup` pattern, not single `press` events**

**Pattern**:
```javascript
keydown ArrowRight
sleep 0.5
keyup ArrowRight
```

**Why**: Phaser checks key state continuously in `update()` loop, not on single events.

See `references/key-input.md` for detailed key input patterns.

## Common Pitfalls: Browser Automation Limitations

**CRITICAL**: Browser automation keydown/keyup events don't work reliably with Phaser's input system.

### Why Browser Automation Fails

**Problem**: Phaser's input system requires native browser events, but browser automation tools (agent-browser, Playwright, Puppeteer) generate synthetic events that Phaser doesn't recognize.

**Observed Issue**: Browser automation keydown/keyup commands don't trigger Phaser's key listeners, causing movement tests to fail.

**Root Cause**: 
- Phaser checks `key.isDown` property in `update()` loop
- Browser automation generates synthetic events
- Phaser's input system doesn't recognize synthetic events
- Native browser events are required for Phaser input

### Workaround Patterns

**When browser automation fails, use these workaround patterns:**

1. **Direct Key Object Manipulation** (Preferred)
2. **Programmatic Movement Simulation** (Alternative)
3. **Test Seam Commands** (Best Practice)

## Direct Key Object Manipulation

**Manipulate Phaser key objects directly when browser automation doesn't work.**

### Pattern 1: Direct Key State Setting

**Set `key.isDown` property directly:**

```typescript
// In test seam or browser eval
window.__TEST__.commands.simulateKeyPress = (keyCode: string) => {
  const scene = window.__TEST__?.getCurrentScene();
  if (!scene) return false;
  
  // Get Phaser key object
  const key = scene.input.keyboard?.addKey(keyCode);
  if (!key) return false;
  
  // Set key state directly
  key.isDown = true;
  key.isUp = false;
  
  // Trigger update loop to process movement
  scene.update(0, 0);
  
  return true;
};

window.__TEST__.commands.simulateKeyRelease = (keyCode: string) => {
  const scene = window.__TEST__?.getCurrentScene();
  if (!scene) return false;
  
  const key = scene.input.keyboard?.addKey(keyCode);
  if (!key) return false;
  
  // Release key state
  key.isDown = false;
  key.isUp = true;
  
  return true;
};
```

**Usage in browser testing:**

```bash
# Simulate key press
agent-browser eval "window.__TEST__.commands.simulateKeyPress('ArrowRight')"
agent-browser wait 500

# Simulate key release
agent-browser eval "window.__TEST__.commands.simulateKeyRelease('ArrowRight')"

# Verify movement occurred
agent-browser eval "window.__TEST__.gameState().player.x"
```

### Pattern 2: WASD Key Mapping

**Map WASD keys to Phaser key objects:**

```typescript
window.__TEST__.commands.simulateWASD = (direction: 'w' | 'a' | 's' | 'd') => {
  const scene = window.__TEST__?.getCurrentScene();
  if (!scene) return false;
  
  const keyMap = {
    'w': 'W',
    'a': 'A',
    's': 'S',
    'd': 'D'
  };
  
  const keyCode = keyMap[direction];
  const key = scene.input.keyboard?.addKey(keyCode);
  
  if (key) {
    key.isDown = true;
    key.isUp = false;
    scene.update(0, 0);
    return true;
  }
  
  return false;
};
```

### Pattern 3: Arrow Key Mapping

**Map arrow keys to Phaser key objects:**

```typescript
window.__TEST__.commands.simulateArrowKey = (direction: 'up' | 'down' | 'left' | 'right') => {
  const scene = window.__TEST__?.getCurrentScene();
  if (!scene) return false;
  
  const keyMap = {
    'up': 'ArrowUp',
    'down': 'ArrowDown',
    'left': 'ArrowLeft',
    'right': 'ArrowRight'
  };
  
  const keyCode = keyMap[direction];
  const key = scene.input.keyboard?.addKey(keyCode);
  
  if (key) {
    key.isDown = true;
    key.isUp = false;
    scene.update(0, 0);
    return true;
  }
  
  return false;
};
```

## simulateMovement() Pattern

**Create a `simulateMovement()` method for programmatic movement testing.**

### Pattern 1: Basic Movement Simulation

**Simulate movement without key events:**

```typescript
window.__TEST__.commands.simulateMovement = (direction: 'up' | 'down' | 'left' | 'right', duration: number = 500) => {
  const scene = window.__TEST__?.getCurrentScene();
  if (!scene || !scene.player) return false;
  
  const speed = scene.player.body?.velocity?.x || 100; // Default speed
  const startX = scene.player.x;
  const startY = scene.player.y;
  
  // Calculate target position based on direction
  const distance = (speed * duration) / 1000;
  let targetX = startX;
  let targetY = startY;
  
  switch (direction) {
    case 'up':
      targetY = startY - distance;
      break;
    case 'down':
      targetY = startY + distance;
      break;
    case 'left':
      targetX = startX - distance;
      break;
    case 'right':
      targetX = startX + distance;
      break;
  }
  
  // Set velocity directly
  if (scene.player.body) {
    scene.player.body.setVelocity(
      direction === 'left' ? -speed : direction === 'right' ? speed : 0,
      direction === 'up' ? -speed : direction === 'down' ? speed : 0
    );
  }
  
  // Update scene for duration
  const startTime = Date.now();
  const updateLoop = () => {
    if (Date.now() - startTime < duration) {
      scene.update(0, 0);
      requestAnimationFrame(updateLoop);
    } else {
      // Stop movement
      if (scene.player.body) {
        scene.player.body.setVelocity(0, 0);
      }
    }
  };
  updateLoop();
  
  return {
    start: { x: startX, y: startY },
    target: { x: targetX, y: targetY },
    current: { x: scene.player.x, y: scene.player.y }
  };
};
```

### Pattern 2: Movement with Collision Checking

**Simulate movement with collision detection:**

```typescript
window.__TEST__.commands.simulateMovementWithCollision = (direction: 'up' | 'down' | 'left' | 'right', distance: number) => {
  const scene = window.__TEST__?.getCurrentScene();
  if (!scene || !scene.player) return false;
  
  const startX = scene.player.x;
  const startY = scene.player.y;
  
  // Calculate target position
  let targetX = startX;
  let targetY = startY;
  
  switch (direction) {
    case 'up':
      targetY = startY - distance;
      break;
    case 'down':
      targetY = startY + distance;
      break;
    case 'left':
      targetX = startX - distance;
      break;
    case 'right':
      targetX = startX + distance;
      break;
  }
  
  // Check collision before moving
  const canMove = scene.checkCollision(targetX, targetY);
  
  if (canMove) {
    // Move player directly
    scene.player.x = targetX;
    scene.player.y = targetY;
    
    return {
      moved: true,
      position: { x: targetX, y: targetY }
    };
  } else {
    return {
      moved: false,
      blocked: true,
      position: { x: startX, y: startY }
    };
  }
};
```

### Pattern 3: Movement Testing Helper

**Complete movement testing helper function:**

```typescript
window.__TEST__.commands.testMovement = (direction: 'up' | 'down' | 'left' | 'right') => {
  const scene = window.__TEST__?.getCurrentScene();
  if (!scene || !scene.player) return null;
  
  const before = {
    x: scene.player.x,
    y: scene.player.y
  };
  
  // Simulate movement
  window.__TEST__.commands.simulateMovement(direction, 500);
  
  // Wait for movement to complete
  setTimeout(() => {
    const after = {
      x: scene.player.x,
      y: scene.player.y
    };
    
    return {
      direction,
      before,
      after,
      moved: before.x !== after.x || before.y !== after.y,
      distance: Math.sqrt(
        Math.pow(after.x - before.x, 2) + Math.pow(after.y - before.y, 2)
      )
    };
  }, 600);
};
```

**Usage in browser testing:**

```bash
# Test movement in all directions
agent-browser eval "window.__TEST__.commands.testMovement('right')"
agent-browser eval "window.__TEST__.commands.testMovement('left')"
agent-browser eval "window.__TEST__.commands.testMovement('up')"
agent-browser eval "window.__TEST__.commands.testMovement('down')"
```

## Common Pitfalls and Solutions

### Pitfall 1: Browser Automation Key Events Don't Work

**Problem**: `agent-browser keydown ArrowRight` doesn't trigger Phaser movement.

**Solution**: Use direct key object manipulation or `simulateMovement()` pattern.

```bash
# ❌ WRONG: Browser automation doesn't work
agent-browser keydown ArrowRight
agent-browser wait 500
agent-browser keyup ArrowRight

# ✅ CORRECT: Direct key manipulation
agent-browser eval "window.__TEST__.commands.simulateKeyPress('ArrowRight')"
agent-browser wait 500
agent-browser eval "window.__TEST__.commands.simulateKeyRelease('ArrowRight')"
```

### Pitfall 2: Test Seam Initialization Timing

**Problem**: Test seam commands fail because scene isn't initialized yet.

**Solution**: Wait for test seam ready before testing movement.

```bash
# ✅ CORRECT: Wait for test seam ready
agent-browser eval "
  new Promise((resolve) => {
    const check = () => {
      if (window.__TEST__?.ready && window.__TEST__?.getCurrentScene()) {
        resolve(true);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
    setTimeout(() => resolve(false), 5000);
  })
"

# Then test movement
agent-browser eval "window.__TEST__.commands.simulateMovement('right')"
```

### Pitfall 3: Phaser Input System Quirks

**Problem**: Phaser requires native events, not synthetic browser automation events.

**Solution**: Use test seam commands that manipulate Phaser objects directly.

```typescript
// ✅ CORRECT: Direct Phaser key manipulation
const key = scene.input.keyboard?.addKey('ArrowRight');
key.isDown = true;
scene.update(0, 0);
```

### Pitfall 4: Movement Not Updating Position

**Problem**: Setting `key.isDown = true` doesn't immediately update position.

**Solution**: Call `scene.update()` after setting key state.

```typescript
// ✅ CORRECT: Update scene after setting key state
key.isDown = true;
scene.update(0, 0); // Process update loop
```

## Movement Testing Workflow

1. Use test seam `movePlayerTo(position)` if available
2. Otherwise use `keydown`/`keyup` pattern
3. Wait for movement to occur (check position after delay)
4. Verify collision detection blocks movement through walls
5. Test all directions (up, down, left, right)

## Collision Verification

See `references/collision-testing.md` for collision testing patterns:

- Test movement through open areas (should work)
- Test movement into walls (should be blocked)
- Test corner cases (diagonal movement near walls)
- Verify player position updates correctly

## Test Seam Helpers

When available, use test seam commands:
- `movePlayerTo(x, y)` - Direct position setting
- `movePlayerToExit()` - Navigate to exit
- `playerPosition()` - Get current position
- `checkCollision(x, y)` - Test collision at position

## Resources

- `references/key-input.md` - keydown/keyup pattern (not single press)
- `references/collision-testing.md` - Testing movement through walls
