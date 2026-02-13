# Test Seam Troubleshooting

## Known Issues

### sceneKey Lag on Scene Transitions

**Problem**: `window.__TEST__.sceneKey` may not update immediately after scene transitions.

**Solution**: 
- Use console logs as fallback verification
- Wait 1-2 seconds after transition before checking sceneKey
- Don't rely solely on sceneKey for verification

**Example**:
```javascript
// Navigate to game
window.__TEST__.commands.clickStartGame();

// Wait before checking
setTimeout(() => {
  console.log('Scene:', window.__TEST__.sceneKey);
}, 2000);
```

### Test Seam Not Available

**Problem**: `window.__TEST__` is undefined or commands are missing.

**Possible causes**:
- Scene hasn't initialized yet
- Test seam not set up in scene's `create()` method
- Scene transition in progress

**Solution**:
- Wait for scene initialization (check console logs)
- Verify test seam setup in source code
- Add test seam if missing

### Commands Don't Work

**Problem**: Test seam commands exist but don't execute properly.

**Possible causes**:
- Scene not fully initialized
- Game state not ready
- Command implementation has errors

**Solution**:
- Check browser console for errors
- Verify game state is initialized
- Test command in browser console manually
- Check command implementation in source code

## Initialization Timing

Test seams are created in the scene's `create()` method. Wait for scene initialization before accessing:

```javascript
// Wait for scene to initialize
setTimeout(() => {
  if (window.__TEST__) {
    // Test seam available
  }
}, 1000);
```

## Scene-Specific Test Seams

Each scene creates its own `window.__TEST__` object. After scene transitions:
- Old scene's test seam may persist briefly
- New scene's test seam may not be ready immediately
- Wait 1-2 seconds after transition before accessing

## Fallback Verification

When test seam verification fails:
1. Use console logs to verify scene transitions
2. Check game state directly if accessible
3. Use screenshot comparison as last resort
4. Review code to verify functionality
