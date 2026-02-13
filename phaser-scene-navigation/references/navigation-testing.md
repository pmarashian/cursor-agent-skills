# Navigation Testing

## Wait Patterns

### After Scene Transition

Wait 1-2 seconds after transition before checking test seam:

```javascript
// Navigate to game
window.__TEST__.commands.clickStartGame();

// Wait for transition
setTimeout(() => {
  // Now check test seam
  console.log('Scene:', window.__TEST__.sceneKey);
}, 2000);
```

### For Scene Initialization

Wait for scene to initialize before accessing test seam:

```javascript
// Wait for scene initialization
setTimeout(() => {
  if (window.__TEST__) {
    // Test seam available
  }
}, 1000);
```

## Console Log Verification

Use console logs to verify scene transitions:

```typescript
// In scene create() method
create() {
  console.log('Scene created:', this.scene.key);
  // ... scene setup ...
}
```

Check browser console for transition logs.

## Test Seam sceneKey Limitation

**Known issue**: `window.__TEST__.sceneKey` may lag on scene transitions.

**Solution**: 
- Don't rely solely on sceneKey for verification
- Use console logs as fallback
- Wait 1-2 seconds after transition

## Testing Workflow

1. Navigate using test seam command
2. Wait 1-2 seconds
3. Check console logs for scene transition
4. Verify test seam is available
5. Test scene functionality

## Example Test Sequence

```javascript
// 1. Start from menu
console.log('Starting from menu');

// 2. Navigate to game
window.__TEST__.commands.clickStartGame();

// 3. Wait for transition
setTimeout(() => {
  // 4. Verify transition
  console.log('Scene:', window.__TEST__.sceneKey);
  console.log('Game state:', window.__TEST__.gameState());
  
  // 5. Test game functionality
  window.__TEST__.commands.setTimer(5);
}, 2000);
```

## Best Practices

- Always wait after scene transitions
- Use console logs for verification
- Don't rely solely on sceneKey
- Test scene functionality after navigation
- Document navigation patterns in progress.txt
