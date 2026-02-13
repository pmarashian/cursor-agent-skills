# Common Test Seam Commands Catalog

## Navigation Commands

### `clickStartGame()`
Navigate from menu to game scene.

### `clickPlayAgain()`
Restart game from game over screen.

## Game State Commands

### `gameState()`
Access current game state object.

### `sceneKey`
Current scene key (may lag on transitions).

## Player Movement Commands

### `movePlayerToExit()`
Move player directly to exit to complete level.

### `movePlayerTo(x, y)`
Move player to specific position.

### `playerPosition()`
Get current player position.

## Timer Commands

### `setTimer(seconds)`
Set timer to specific value.

### `fastForwardTimer(seconds)`
Decrease timer by specified amount.

### `triggerGameOver()`
Force game over condition.

## Item Collection Commands

### `collectAnyCoin()`
Collect a coin for testing.

### `setCoinCount(count)`
Set coin count directly.

## Collision Testing Commands

### `checkCollision(x, y)`
Test if position has collision.

## Usage Notes

- Commands are scene-specific - each scene may have different commands
- Always check if command exists before calling
- Document discovered commands in progress.txt
- Use console logs to verify command execution
