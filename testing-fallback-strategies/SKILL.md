---
name: testing-fallback-strategies
description: Multiple testing approaches when primary methods fail, ensuring verification always completes even when tools are unavailable. Use when browser testing fails, agent-browser is unavailable, or primary testing tools don't work. Ensures 100% verification coverage with fallback methods.
---

# Testing Fallback Strategies

Provide multiple testing approaches when primary methods fail, ensuring verification always completes. Ensures 100% verification coverage even when tools are unavailable.

## Overview

**Critical**: Never abandon testing on first failure. Always use fallback methods to ensure verification completes.

**Pattern observed**: Single tool failure → Testing abandoned → Task marked complete without verification.

## Decision Tree

```
Primary Method: Browser Automation (agent-browser)
    ↓ (fails)
Fallback 1: Manual Browser + Verification Checklist
    ↓ (unavailable)
Fallback 2: Unit Test Creation for Critical Paths
    ↓ (fails)
Fallback 3: Console Log Verification
    ↓ (fails)
Fallback 4: Build Output Inspection
    ↓ (fails)
Fallback 5: TypeScript Compilation Verification
```

## Primary Method: Browser Automation

**Use agent-browser for web/game applications:**

```bash
# Standard browser testing workflow
agent-browser open http://localhost:3000
agent-browser eval "window.__TEST__?.ready"
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser eval "window.__TEST__.gameState()"
```

**When to use:**
- Web applications
- Phaser games
- Canvas/WebGL applications
- DOM-based UI testing

## Fallback 1: Manual Browser + Verification Checklist

**When browser automation fails, use manual verification:**

```markdown
# Manual Browser Verification Checklist

## Setup
- [ ] Open browser manually
- [ ] Navigate to http://localhost:3000
- [ ] Open browser console (F12)

## Verification Steps
- [ ] Application loads without errors
- [ ] Console shows no errors
- [ ] Feature X works as expected
- [ ] UI elements render correctly
- [ ] Interactions respond correctly

## Test Seam Verification
- [ ] Open console
- [ ] Type: window.__TEST__
- [ ] Verify test seam exists
- [ ] Test commands manually:
  * window.__TEST__.commands.clickStartGame()
  * window.__TEST__.gameState()
```

**Documentation pattern:**
```markdown
## Verification Method
- Primary: agent-browser (failed)
- Fallback: Manual browser + checklist
- Result: Feature verified manually, works correctly
```

## Fallback 2: Unit Test Creation

**Create unit tests for critical paths:**

```typescript
// Create unit test for critical functionality
import { describe, it, expect } from 'vitest';
import { featureFunction } from './feature';

describe('Feature Function', () => {
  it('should work correctly', () => {
    const result = featureFunction(input);
    expect(result).toBe(expected);
  });
});
```

**When to use:**
- Pure logic functions
- Algorithms (maze generation, pathfinding)
- Data transformations
- State management logic

**Run tests:**
```bash
npm test
# or
npx vitest
```

## Fallback 3: Console Log Verification

**Use console logs to verify functionality:**

```typescript
// Add console logs to verify execution
function featureFunction(input) {
  console.log('Feature function called with:', input);
  const result = processInput(input);
  console.log('Feature function result:', result);
  return result;
}
```

**Verify in browser console:**
```javascript
// Open browser console
// Check for expected logs
// Verify function execution
```

**Documentation pattern:**
```markdown
## Verification Method
- Primary: agent-browser (failed)
- Fallback 1: Manual browser (unavailable)
- Fallback 2: Console log verification
- Result: Console logs confirm feature works
```

## Fallback 4: Build Output Inspection

**Inspect build output for errors:**

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Check build output
npm run build

# Inspect bundle
ls -la dist/
```

**Verify:**
- No compilation errors
- Build succeeds
- Output files generated correctly
- No warnings in build output

## Fallback 5: TypeScript Compilation Verification

**Verify TypeScript compilation passes:**

```bash
# Run TypeScript check
npx tsc --noEmit

# If compilation passes, code is at least syntactically correct
# Use code review to verify logic
```

**Code review checklist:**
- [ ] Code matches requirements
- [ ] Logic is correct
- [ ] Error handling present
- [ ] TypeScript types correct

## Complete Fallback Workflow

### Example: Browser Testing Fails

```markdown
## Testing Workflow

1. **Primary Method**: agent-browser
   - Status: Failed (connection timeout)
   - Action: Try fallback

2. **Fallback 1**: Manual browser + checklist
   - Status: Unavailable (no browser access)
   - Action: Try next fallback

3. **Fallback 2**: Unit test creation
   - Status: Created and passed
   - Result: Feature verified via unit tests
   - Documentation: Unit tests confirm functionality
```

## Verification Documentation

**Always document verification method used:**

```markdown
## Verification

**Method**: Fallback 2 - Unit Test Creation
**Reason**: Browser automation failed, manual browser unavailable
**Tests Created**:
- test-feature-function.ts
- test-feature-logic.ts
**Result**: All tests pass, feature verified
**Coverage**: Critical paths tested
```

## Common Scenarios

### Scenario 1: Browser Automation Fails

**Symptoms:**
- agent-browser connection timeout
- Browser not responding
- Test seam unavailable

**Fallback:**
1. Try manual browser + checklist
2. If unavailable, create unit tests
3. If tests fail, use console logs
4. If logs unavailable, verify compilation

### Scenario 2: Manual Browser Unavailable

**Symptoms:**
- No browser access
- Headless environment
- CI/CD environment

**Fallback:**
1. Create unit tests for critical paths
2. Verify console logs (if available)
3. Inspect build output
4. Verify TypeScript compilation

### Scenario 3: All Testing Methods Fail

**Symptoms:**
- Browser automation fails
- Manual browser unavailable
- Unit tests fail
- Console logs unavailable

**Fallback:**
1. Verify TypeScript compilation passes
2. Code review for logic correctness
3. Document verification limitations
4. Mark as verified via code review

## Anti-Patterns

### ❌ Don't: Abandon Testing on First Failure

```typescript
// WRONG: Give up after first failure
try {
  agent-browser.open(url);
} catch (error) {
  // Abandon testing
  markComplete(); // ❌ No verification!
}
```

### ❌ Don't: Skip Verification

```typescript
// WRONG: Skip verification entirely
implementFeature();
markComplete(); // ❌ No verification!
```

### ✅ Do: Use Fallback Methods

```typescript
// CORRECT: Try fallbacks
try {
  await testWithBrowser();
} catch (error) {
  try {
    await testWithManualBrowser();
  } catch (error) {
    await testWithUnitTests();
  }
}
```

## Integration with Other Skills

- **phaser-game-testing**: Primary testing method
- **agent-browser**: Browser automation tool
- **task-verification-workflow**: Uses fallback strategies
- **error-recovery-patterns**: Error handling patterns

## Related Skills

- `phaser-game-testing` - Primary testing methodology
- `agent-browser` - Browser automation
- `task-verification-workflow` - Task completion verification
- `error-recovery-patterns` - Error handling patterns

## Remember

1. **Never abandon testing** on first failure
2. **Always use fallback methods** to ensure verification
3. **Document verification method** used
4. **Try fallbacks in order**: Browser → Manual → Unit Tests → Console → Build → Compilation
5. **At minimum**: Verify via code review + TypeScript compilation
6. **100% verification coverage** is the goal
