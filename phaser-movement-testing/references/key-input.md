# Key Input Pattern

## Phaser Key State Checking

Phaser uses continuous key state checking in the `update()` loop, not discrete events.

**Wrong approach** (single press):
```javascript
// This doesn't work for movement
press ArrowRight
```

**Correct approach** (keydown/keyup):
```javascript
// This works for movement
keydown ArrowRight
sleep 0.5
keyup ArrowRight
```

## Why keydown/keyup?

Phaser checks key state in `update()` loop:

```typescript
update() {
  const cursors = this.input.keyboard.createCursorKeys();
  
  if (cursors.right.isDown) {
    // Move right continuously while key is down
    this.player.x += this.speed;
  }
}
```

Single `press` events don't work because Phaser checks `isDown` state, not events.

## Movement Testing Pattern

### Using keydown/keyup

```javascript
// Move right
keydown ArrowRight
sleep 0.5
keyup ArrowRight

// Check position after movement
// Player should have moved right
```

### Using test seam (preferred)

```javascript
// Direct position setting (if available)
window.__TEST__.commands.movePlayerTo(100, 200);

// Or move to exit
window.__TEST__.commands.movePlayerToExit();
```

## Testing All Directions

Test movement in all directions:

```javascript
// Right
keydown ArrowRight
sleep 0.5
keyup ArrowRight

// Left
keydown ArrowLeft
sleep 0.5
keyup ArrowLeft

// Up
keydown ArrowUp
sleep 0.5
keyup ArrowUp

// Down
keydown ArrowDown
sleep 0.5
keyup ArrowDown
```

## Best Practices

- Use `keydown`/`keyup` pattern for movement
- Use test seam commands when available (faster, more reliable)
- Wait for movement to occur before checking position
- Test all directions
- Verify collision detection works
