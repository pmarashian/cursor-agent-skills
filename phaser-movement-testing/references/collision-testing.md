# Collision Testing

## Testing Movement Through Open Areas

Movement should work in open areas:

```javascript
// Move through open area
window.__TEST__.commands.movePlayerTo(100, 100);
// Verify player position updated
const pos = window.__TEST__.commands.playerPosition();
console.log('Position:', pos); // Should be (100, 100)
```

## Testing Movement Into Walls

Movement should be blocked by walls:

```javascript
// Try to move into wall
keydown ArrowRight
sleep 0.5
keyup ArrowRight

// Check if position changed
const beforePos = window.__TEST__.commands.playerPosition();
// ... movement attempt ...
const afterPos = window.__TEST__.commands.playerPosition();

// Position should not change if wall blocks movement
if (beforePos.x === afterPos.x && beforePos.y === afterPos.y) {
  console.log('Movement blocked by wall ✓');
}
```

## Testing Corner Cases

Test diagonal movement near walls:

```javascript
// Move to corner
window.__TEST__.commands.movePlayerTo(50, 50);

// Try diagonal movement
keydown ArrowRight
keydown ArrowUp
sleep 0.5
keyup ArrowRight
keyup ArrowUp

// Verify movement behavior
// Should move diagonally if both directions open
// Should be blocked if either direction blocked
```

## Collision Detection Verification

Use test seam to check collision:

```javascript
// Check if position has collision
const hasCollision = window.__TEST__.commands.checkCollision(100, 200);

if (hasCollision) {
  console.log('Position has collision (wall)');
} else {
  console.log('Position is open');
}
```

## Testing Workflow

1. **Test open area movement** - Should work
2. **Test wall collision** - Should be blocked
3. **Test corner cases** - Diagonal movement near walls
4. **Verify position updates** - Position should update correctly
5. **Test all directions** - Up, down, left, right

## Best Practices

- Test both positive (movement works) and negative (movement blocked) cases
- Verify position updates correctly
- Test boundary conditions (near walls)
- Use test seam commands when available
- Document collision behavior in progress.txt
