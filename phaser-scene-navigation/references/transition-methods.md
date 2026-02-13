# Scene Transition Methods

## Starting a New Scene

### `scene.start(sceneKey, data?)`

Start a new scene, stopping the current scene:

```typescript
this.scene.start('GameScene', { level: 1, score: 0 });
```

**Use when**: Navigating to a completely new scene

**Data passing**: Pass data as second parameter

## Switching to Existing Scene

### `scene.switch(sceneKey)`

Switch to an existing scene without stopping it:

```typescript
this.scene.switch('PauseScene');
```

**Use when**: Scene already exists and should be resumed

## Test Seam Navigation

### `clickStartGame()`

Navigate from menu to game via test seam:

```javascript
window.__TEST__.commands.clickStartGame();
```

**Use when**: Testing navigation from browser console or automation

## Data Passing

Pass data between scenes:

```typescript
// In source scene
this.scene.start('GameScene', {
  level: 1,
  score: 0,
  playerName: 'Player1'
});

// In destination scene
create(data?: any) {
  const level = data?.level || 1;
  const score = data?.score || 0;
  // Use passed data
}
```

## Scene Cleanup

Clean up resources when leaving scene:

```typescript
shutdown() {
  // Clean up timers, listeners, etc.
  this.timer?.destroy();
  this.input.removeAllListeners();
}
```

## Best Practices

- Use `scene.start()` for new scenes
- Use `scene.switch()` for existing scenes
- Pass data via second parameter
- Clean up resources in `shutdown()`
- Document navigation flow in progress.txt
