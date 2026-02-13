# Test Seam Discovery

## What is a Test Seam?

A test seam is a `window.__TEST__` object exposed by Phaser scenes to enable programmatic testing. It provides access to game state and commands that can be executed from the browser console or automated testing tools.

## Where to Find Test Seams

Test seams are typically set up in the scene's `create()` method:

```typescript
create() {
  // ... scene initialization ...
  
  // Test seam setup
  window.__TEST__ = {
    sceneKey: this.scene.key,
    gameState: () => this.gameState,
    commands: {
      clickStartGame: () => {
        // Navigate to game scene
      },
      movePlayerToExit: () => {
        // Move player to exit
      }
    }
  };
}
```

## Discovery Process

1. **Check scene files** - Look for `window.__TEST__` in scene `create()` methods
2. **Check browser console** - After game loads, type `window.__TEST__` to see available commands
3. **Read source code** - Search for `window.__TEST__` or `__TEST__` in codebase
4. **Document commands** - List discovered commands in progress.txt

## When Test Seam Doesn't Exist

If test seam is not available:
1. Add it to the scene's `create()` method
2. Expose necessary game state and commands
3. Document the commands for future use

## Testing Test Seam Availability

```javascript
// In browser console
if (window.__TEST__) {
  console.log('Test seam available');
  console.log('Scene:', window.__TEST__.sceneKey);
  console.log('Commands:', Object.keys(window.__TEST__.commands || {}));
} else {
  console.log('Test seam not available');
}
```
