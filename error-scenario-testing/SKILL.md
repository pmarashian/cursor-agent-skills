---
name: error-scenario-testing
description: Techniques for forcing error conditions in code to test error handling paths, including mock failure injection. Use when testing error handling, maze generation failures, or when error conditions are hard to trigger naturally. Create test scenarios to force error conditions and verify error handling works correctly.
---

# Error Scenario Testing

## Overview

Test error handling by forcing error conditions. Don't commit error handling code without testing error paths.

## Forcing Error Conditions

**Methods**:
- Add test mode flags to enable error injection
- Create test seam commands to trigger errors
- Temporarily modify code to force failures (revert after testing)
- Use environment variables to enable error testing

See `references/error-injection.md` for detailed error injection patterns.

## Maze Generation Error Testing

For maze generation failures:
- Add `forceMazeFailure()` test seam command
- Modify maze generation to fail after N attempts
- Test fallback maze creation
- Verify console warnings appear

See `references/maze-generation-errors.md` for specific patterns.

## Error Testing Checklist

- [ ] Error condition can be triggered
- [ ] Error handling code executes
- [ ] Fallback behavior works correctly
- [ ] User experience is acceptable
- [ ] Console warnings/logs appear
- [ ] Game doesn't crash

## Test Mode Pattern

See `references/error-injection.md` for test mode implementation pattern.

## Test Seam Error Injection

**Add test seam commands to trigger errors:**

```typescript
// Force error conditions via test seam
window.__TEST__.commands.forceMazeFailure = () => {
  // Force maze generation to fail
  this.mazeGenerator.forceFailure = true;
};

window.__TEST__.commands.restoreMazeGeneration = () => {
  // Restore normal maze generation
  this.mazeGenerator.forceFailure = false;
};
```

**Error scenario test commands:**

```typescript
window.__TEST__.commands = {
  forceMazeFailure: () => {
    this.mazeGenerator.forceFailure = true;
  },
  restoreMazeGeneration: () => {
    this.mazeGenerator.forceFailure = false;
  },
  triggerAssetLoadError: () => {
    // Simulate asset load failure
    this.assetLoader.simulateError = true;
  },
  restoreAssetLoading: () => {
    this.assetLoader.simulateError = false;
  }
};
```

**Test error handling paths:**

```bash
# Test error scenario
agent-browser eval "window.__TEST__.commands.forceMazeFailure()"
agent-browser eval "window.__TEST__.commands.generateMaze()"
# Verify fallback behavior
agent-browser eval "window.__TEST__.commands.restoreMazeGeneration()"
```

## Error Recovery Patterns

**Retry logic with configurable attempts:**

```typescript
async function generateWithRetry(
  generator: () => Promise<Result>,
  maxAttempts: number = 3
): Promise<Result> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await generator();
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error);
      if (attempt === maxAttempts) {
        throw new Error(`Failed after ${maxAttempts} attempts`);
      }
      // Wait before retry
      await sleep(1000 * attempt); // Exponential backoff
    }
  }
  throw new Error('Max attempts reached');
}
```

**Fallback mechanisms for critical operations:**

```typescript
async function loadAssetWithFallback(
  assetKey: string,
  primaryUrl: string,
  fallbackUrl: string
): Promise<void> {
  try {
    this.load.image(assetKey, primaryUrl);
  } catch (error) {
    console.warn(`Failed to load ${assetKey} from primary URL, using fallback`);
    this.load.image(assetKey, fallbackUrl);
  }
}
```

**Console warning patterns:**

```typescript
if (!this.textures.exists('asset-key')) {
  console.warn('Asset not found:', 'asset-key');
  console.warn('Using fallback placeholder');
  // Use fallback
}
```

**Graceful degradation strategies:**

```typescript
create() {
  try {
    // Try primary implementation
    this.initPrimaryFeature();
  } catch (error) {
    console.warn('Primary feature failed, using fallback:', error);
    // Graceful degradation
    this.initFallbackFeature();
  }
}
```

## Verification Checklists

**Verify error handling works:**

```markdown
## Error Handling Verification

- [ ] Error condition can be triggered
- [ ] Error handling code executes
- [ ] Fallback behavior works correctly
- [ ] User experience is acceptable
- [ ] Console warnings/logs appear
- [ ] Game doesn't crash
```

**Test fallback mechanisms:**

```bash
# Test fallback by forcing error
agent-browser eval "window.__TEST__.commands.forceMazeFailure()"
agent-browser eval "window.__TEST__.commands.generateMaze()"
# Verify fallback maze is created
agent-browser eval "window.__TEST__.gameState().maze"
```

**Check console warnings:**

```bash
# Check for console warnings
agent-browser console | grep -i "warn\|error"

# Verify warnings appear for error scenarios
agent-browser eval "window.__TEST__.commands.forceMazeFailure()"
agent-browser console
```

**Validate recovery behavior:**

```bash
# Test recovery after error
agent-browser eval "window.__TEST__.commands.forceMazeFailure()"
agent-browser eval "window.__TEST__.commands.generateMaze()"
agent-browser eval "window.__TEST__.commands.restoreMazeGeneration()"
agent-browser eval "window.__TEST__.commands.generateMaze()"
# Verify normal generation works after recovery
```

## Resources

- `references/error-injection.md` - Test mode flags, test seam commands, environment variables
- `references/maze-generation-errors.md` - Specific patterns for maze generation failures
