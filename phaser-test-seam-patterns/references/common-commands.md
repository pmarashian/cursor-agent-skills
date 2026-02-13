# Common Test Seam Commands

## Navigation Commands

### `clickStartGame()`
Navigate from menu to game scene.

```javascript
window.__TEST__.commands.clickStartGame();
```

### `clickPlayAgain()`
Restart game from game over screen.

```javascript
window.__TEST__.commands.clickPlayAgain();
```

## Game State Commands

### `gameState()`
Access current game state object.

```javascript
const state = window.__TEST__.gameState();
console.log(state);
```

### `sceneKey`
Current scene key (may lag on transitions).

```javascript
console.log(window.__TEST__.sceneKey);
```

## Player Movement Commands

### `movePlayerToExit()`
Move player directly to exit to complete level.

```javascript
window.__TEST__.commands.movePlayerToExit();
```

### `movePlayerTo(x, y)`
Move player to specific position.

```javascript
window.__TEST__.commands.movePlayerTo(100, 200);
```

### `playerPosition()`
Get current player position.

```javascript
const pos = window.__TEST__.commands.playerPosition();
console.log(pos);
```

## Timer Commands

### `setTimer(seconds)`
Set timer to specific value.

```javascript
window.__TEST__.commands.setTimer(5); // Set to 5 seconds
```

### `fastForwardTimer(seconds)`
Decrease timer by specified amount.

```javascript
window.__TEST__.commands.fastForwardTimer(10); // Subtract 10 seconds
```

### `triggerGameOver()`
Force game over condition.

```javascript
window.__TEST__.commands.triggerGameOver();
```

## Item Collection Commands

### `collectAnyCoin()`
Collect a coin for testing.

```javascript
window.__TEST__.commands.collectAnyCoin();
```

### `setCoinCount(count)`
Set coin count directly.

```javascript
window.__TEST__.commands.setCoinCount(10);
```

## Collision Testing Commands

### `checkCollision(x, y)`
Test if position has collision.

```javascript
const hasCollision = window.__TEST__.commands.checkCollision(100, 200);
```

## Settings Scene Commands

### `getMusicVolume()`
Get current music volume value (0-1).

```javascript
const volume = window.__TEST__.commands.getMusicVolume();
```

### `getSfxVolume()`
Get current SFX volume value (0-1).

```javascript
const volume = window.__TEST__.commands.getSfxVolume();
```

### `setMusicVolume(value)`
Set music volume programmatically (0-1).

```javascript
window.__TEST__.commands.setMusicVolume(0.75); // Set to 75%
```

### `setSfxVolume(value)`
Set SFX volume programmatically (0-1).

```javascript
window.__TEST__.commands.setSfxVolume(0.5); // Set to 50%
```

### `getMusicSliderHandlePosition()`
Get music slider handle position and track information.

```javascript
const pos = window.__TEST__.commands.getMusicSliderHandlePosition();
// Returns: { x, y, trackX, trackY, trackWidth } or null
```

### `getSfxSliderHandlePosition()`
Get SFX slider handle position and track information.

```javascript
const pos = window.__TEST__.commands.getSfxSliderHandlePosition();
// Returns: { x, y, trackX, trackY, trackWidth } or null
```

### `valueToPixelPosition(type, value)`
Convert slider value (0-1) to pixel position on track.

```javascript
const pixelX = window.__TEST__.commands.valueToPixelPosition('music', 0.5);
// Returns pixel X coordinate for 50% position
```

### `simulateDragSlider(type, startValue, endValue, steps)`
Simulate dragging a slider by value. Triggers actual drag interaction flow.

```javascript
// Drag music slider from 0% to 100% with 10 steps
window.__TEST__.commands.simulateDragSlider('music', 0, 1, 10);

// Drag SFX slider from 50% to 25% with 5 steps
window.__TEST__.commands.simulateDragSlider('sfx', 0.5, 0.25, 5);
```

**Parameters:**
- `type`: `'music'` or `'sfx'`
- `startValue`: Starting value (0-1)
- `endValue`: Ending value (0-1)
- `steps`: Number of intermediate steps (default: 10)

**Returns:**
```javascript
{
  success: true,
  startValue: 0,
  endValue: 1,
  finalValue: 1.0
}
```

### `simulateDragFromTo(type, startX, endX, steps)`
Simulate dragging from one pixel position to another.

```javascript
// Drag from pixel position 100 to 300
window.__TEST__.commands.simulateDragFromTo('music', 100, 300, 10);
```

**Parameters:**
- `type`: `'music'` or `'sfx'`
- `startX`: Starting pixel X coordinate
- `endX`: Ending pixel X coordinate
- `steps`: Number of intermediate steps (default: 10)

**Returns:**
```javascript
{
  success: true,
  startX: 100,
  endX: 300,
  finalValue: 0.75
}
```

## Usage Notes

- Commands are scene-specific - each scene may have different commands
- Always check if command exists before calling
- Document discovered commands in progress.txt
- Use console logs to verify command execution
- Drag simulation commands trigger the actual drag interaction flow, not just programmatic value setting
