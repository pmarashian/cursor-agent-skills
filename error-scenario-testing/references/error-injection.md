# Error Injection Patterns

## Test Mode Flag

Enable error injection via test mode:

```typescript
const TEST_MODE = import.meta.env.DEV && 
                  window.location.search.includes('test=true');

if (TEST_MODE && window.__TEST__?.forceError) {
  // Trigger error condition
  throw new Error('Test error injection');
}
```

## Test Seam Commands

Add error injection commands to test seam:

```typescript
window.__TEST__ = {
  commands: {
    forceMazeFailure: () => {
      // Force maze generation to fail
      this.mazeGenerationAttempts = 999; // Exceed max attempts
      this.generateMaze();
    },
    forceNetworkError: () => {
      // Simulate network error
      throw new Error('Network error');
    }
  }
};
```

## Environment Variables

Use environment variables to enable error testing:

```typescript
if (import.meta.env.VITE_FORCE_ERROR === 'true') {
  // Trigger error condition
}
```

## Temporarily Modify Code

For one-time testing, temporarily modify code:

```typescript
// TEMPORARY: Force error for testing
if (true) { // Change to false after testing
  throw new Error('Test error');
}
```

**Important**: Revert after testing!

## Error Injection Workflow

1. **Add test mode flag or test seam command**
2. **Trigger error condition**
3. **Verify error handling executes**
4. **Check fallback behavior**
5. **Verify console warnings/logs**
6. **Revert temporary changes**

## Best Practices

- Use test mode flags for reusable error injection
- Use test seam commands for game-specific errors
- Revert temporary code changes after testing
- Document error injection methods in progress.txt
- Test both error condition and recovery
