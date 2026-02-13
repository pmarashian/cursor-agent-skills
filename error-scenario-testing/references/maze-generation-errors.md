# Maze Generation Error Testing

## Forcing Maze Generation Failure

### Test Seam Command

Add `forceMazeFailure()` to test seam:

```typescript
window.__TEST__ = {
  commands: {
    forceMazeFailure: () => {
      // Force maze generation to fail
      this.mazeGenerationAttempts = 999; // Exceed max attempts
      this.maxAttempts = 100; // Set low max
      this.generateMaze();
    }
  }
};
```

### Modify Generation Logic

Temporarily modify maze generation to fail:

```typescript
generateMaze() {
  // TEMPORARY: Force failure for testing
  if (this.mazeGenerationAttempts > 50) { // Lower threshold
    console.warn('Maze generation failed after', this.mazeGenerationAttempts, 'attempts');
    this.createFallbackMaze();
    return;
  }
  
  // Normal generation logic
  // ...
}
```

**Important**: Revert after testing!

## Testing Fallback Maze

Verify fallback maze creation works:

```typescript
// Force failure
window.__TEST__.commands.forceMazeFailure();

// Verify fallback maze created
const maze = window.__TEST__.gameState().maze;
if (maze && maze.isFallback) {
  console.log('Fallback maze created ✓');
}
```

## Console Warning Verification

Check that console warnings appear:

```typescript
// In maze generation
if (this.mazeGenerationAttempts > this.maxAttempts) {
  console.warn('Maze generation failed, using fallback maze');
  this.createFallbackMaze();
}
```

Verify warning appears in browser console.

## Error Testing Checklist

- [ ] Maze generation can be forced to fail
- [ ] Fallback maze creation works
- [ ] Console warning appears
- [ ] Game continues with fallback maze
- [ ] User experience is acceptable

## Best Practices

- Use test seam commands for reusable error injection
- Verify fallback behavior works correctly
- Check console warnings appear
- Test that game doesn't crash
- Revert temporary code changes after testing
