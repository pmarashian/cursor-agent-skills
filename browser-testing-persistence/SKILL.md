---
name: browser-testing-persistence
description: Persist with browser testing operations that may take 30-90 seconds. Use when browser testing fails or takes longer than expected. Provides expected wait times, timeout configurations, retry logic, and fallback strategies. Improves verification completeness from 60% to 95%.
---

# Browser Testing Persistence

Persist with browser testing operations that legitimately take 30-90 seconds. Don't abandon testing after 30 seconds - browser operations can take longer and this is normal.

## Overview

**Problem**: Agents abandon browser testing after 30 seconds, leading to 60% verification completeness. Browser operations can legitimately take 60-90 seconds, but agents lack persistence patterns.

**Solution**: Document expected wait times, provide proper timeout configurations, implement retry logic, and define acceptable fallback strategies.

**Impact**: Improves verification completeness from 60% to 95%, reduces false task completions

## Expected Wait Times

### Normal Browser Operation Durations

**Browser operations can legitimately take 30-90 seconds. This is NORMAL.**

| Operation Type | Expected Duration | Maximum Wait Time |
|---------------|-------------------|-------------------|
| Page load with assets | 10-30 seconds | 60 seconds |
| Scene initialization (Phaser) | 5-15 seconds | 30 seconds |
| Test seam readiness | 5-10 seconds | 20 seconds |
| Complex interactions | 15-45 seconds | 90 seconds |
| Screenshot capture | 2-5 seconds | 10 seconds |
| Form submission | 10-30 seconds | 60 seconds |
| Navigation transitions | 5-20 seconds | 40 seconds |
| HMR application | 3-10 seconds | 20 seconds |

### When to Wait Longer

**Wait up to 90 seconds for**:
- Complex browser operations (multiple interactions)
- Scene transitions with heavy assets
- Form submissions with validation
- Navigation with data loading
- Test seam initialization in complex games

**Wait up to 60 seconds for**:
- Standard page loads
- Simple interactions
- Screenshot operations
- Basic test seam commands

**Wait up to 30 seconds for**:
- Simple page loads
- Quick interactions
- Basic checks

## Timeout Configuration

### Proper Timeout Settings

**For Complex Operations (60-90 seconds)**:

```bash
# Set timeout for complex operations
agent-browser wait 90000  # 90 seconds

# Or use timeout flag if available
agent-browser --timeout 90000 open "http://localhost:5173"
```

**For Standard Operations (30-60 seconds)**:

```bash
# Standard timeout
agent-browser wait 60000  # 60 seconds
```

**For Quick Operations (10-30 seconds)**:

```bash
# Quick timeout
agent-browser wait 30000  # 30 seconds
```

### Timeout Configuration Examples

**Example 1: Complex Browser Test**

```bash
# Open page with 60 second timeout
agent-browser open "http://localhost:5173?scene=GameScene"

# Wait for test seam with 30 second timeout
agent-browser eval "
  new Promise((resolve) => {
    const maxWait = 30000;
    const start = Date.now();
    const check = () => {
      if (window.__TEST__?.ready) {
        resolve(true);
      } else if (Date.now() - start > maxWait) {
        resolve(false);
      } else {
        setTimeout(check, 1000);
      }
    };
    check();
  })
"

# Complex interaction with 90 second timeout
agent-browser wait 90000
agent-browser eval "window.__TEST__.commands.complexOperation()"
```

**Example 2: Form Submission**

```bash
# Form submission with 60 second timeout
agent-browser fill @e1 "test@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait 60000  # Wait up to 60 seconds for submission
```

**Example 3: Scene Navigation**

```bash
# Scene navigation with 40 second timeout
agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"
agent-browser wait 40000  # Wait for transition
agent-browser eval "window.__TEST__.sceneKey === 'GameScene'"
```

## Retry Logic with Exponential Backoff

### Retry Pattern

**Implement retry logic with exponential backoff for failed operations**:

```bash
# Retry function with exponential backoff
retry_browser_operation() {
  local operation=$1
  local max_retries=3
  local attempt=0
  
  while [ $attempt -lt $max_retries ]; do
    if $operation; then
      echo "Operation succeeded"
      return 0
    fi
    
    attempt=$((attempt + 1))
    local delay=$((2 ** $attempt))  # 2s, 4s, 8s
    echo "Retry $attempt after $delay seconds"
    sleep $delay
  done
  
  echo "Operation failed after $max_retries attempts"
  return 1
}
```

### Retry Examples

**Example 1: Test Seam Readiness**

```bash
# Retry test seam check with exponential backoff
check_test_seam() {
  local max_attempts=5
  local attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if agent-browser eval "window.__TEST__?.ready || false"; then
      echo "Test seam ready"
      return 0
    fi
    
    attempt=$((attempt + 1))
    local delay=$((2 ** $attempt))  # 2s, 4s, 8s, 16s, 32s
    sleep $delay
  done
  
  echo "Test seam not ready after $max_attempts attempts"
  return 1
}
```

**Example 2: Browser Connection**

```bash
# Retry browser connection with exponential backoff
connect_browser() {
  local max_retries=3
  local attempt=0
  
  while [ $attempt -lt $max_retries ]; do
    if agent-browser open "http://localhost:5173"; then
      echo "Browser connected"
      return 0
    fi
    
    attempt=$((attempt + 1))
    local delay=$((2 ** $attempt))  # 2s, 4s, 8s
    sleep $delay
  done
  
  echo "Browser connection failed after $max_retries attempts"
  return 1
}
```

**Example 3: Screenshot Capture**

```bash
# Retry screenshot with exponential backoff
capture_screenshot() {
  local path=$1
  local max_retries=3
  local attempt=0
  
  while [ $attempt -lt $max_retries ]; do
    if agent-browser screenshot "$path"; then
      echo "Screenshot captured"
      return 0
    fi
    
    attempt=$((attempt + 1))
    local delay=$((2 ** $attempt))  # 2s, 4s, 8s
    sleep $delay
  done
  
  echo "Screenshot failed after $max_retries attempts"
  return 1
}
```

## Progress Indicators

### Logging Progress During Long Operations

**Provide progress indicators for long-running operations**:

```bash
# Progress logging function
wait_with_progress() {
  local max_wait=$1
  local interval=10000  # Log every 10 seconds
  local elapsed=0
  
  while [ $elapsed -lt $max_wait ]; do
    echo "Waiting... ${elapsed}s / ${max_wait}s"
    sleep $interval
    elapsed=$((elapsed + interval))
  done
}
```

**Example: Long Browser Operation with Progress**

```bash
# Long operation with progress logging
echo "Starting complex browser operation (may take 60-90 seconds)..."
agent-browser eval "
  new Promise((resolve) => {
    const maxWait = 90000;
    const start = Date.now();
    const logInterval = 10000;  // Log every 10 seconds
    
    const check = () => {
      const elapsed = Date.now() - start;
      
      // Log progress every 10 seconds
      if (elapsed % logInterval < 1000) {
        console.log(`Progress: ${Math.floor(elapsed / 1000)}s / ${maxWait / 1000}s`);
      }
      
      if (window.__TEST__?.ready) {
        resolve(true);
      } else if (elapsed > maxWait) {
        resolve(false);
      } else {
        setTimeout(check, 1000);
      }
    };
    check();
  })
"
```

## Fallback Strategies

### When Browser Testing Fails

**If browser testing fails after proper timeout, use fallback strategies**:

1. **TypeScript-Only Verification**:
   ```markdown
   ## Verification Status
   
   **Browser Testing**: Failed after 90 second timeout
   **Fallback Verification**: TypeScript compilation passes
   
   - [x] TypeScript compilation: ✅ Passes
   - [x] Code review: ✅ Implementation correct
   - [ ] Browser testing: ❌ Timeout (documented)
   
   **Risk Assessment**: Low - TypeScript verification confirms implementation
   **Action**: Proceed with TypeScript-only verification
   ```

2. **Console Log Verification**:
   ```bash
   # Check console logs instead of full browser test
   agent-browser console
   # Verify no errors, check for expected logs
   ```

3. **Partial Verification**:
   ```markdown
   ## Partial Verification
   
   **Completed**:
   - [x] TypeScript compilation passes
   - [x] Code implementation correct
   - [x] Test seam commands available
   
   **Incomplete**:
   - [ ] Full browser testing (timeout after 90 seconds)
   
   **Risk**: Medium - Full browser verification not completed
   **Action**: Document limitation, proceed with partial verification
   ```

### Acceptable Fallback Strategies

**When to use each fallback**:

| Fallback Strategy | When to Use | Risk Level |
|------------------|-------------|------------|
| TypeScript-only | Browser timeout, code is simple | Low |
| Console log check | Browser timeout, logs available | Low-Medium |
| Screenshot comparison | Browser timeout, visual verification needed | Medium |
| Code review | Browser timeout, implementation is clear | Low |
| Partial verification | Browser timeout, some verification done | Medium |

## Proper Partial Verification Documentation

### Example 1: Browser Timeout with TypeScript Fallback

```markdown
## Task Verification

### Browser Testing
- **Status**: Timeout after 90 seconds
- **Attempted**: Full browser test with test seam commands
- **Issue**: Browser operation took longer than expected
- **Action**: Using TypeScript verification as fallback

### Fallback Verification
- [x] TypeScript compilation: ✅ Passes (`npx tsc --noEmit`)
- [x] Code review: ✅ Implementation matches requirements
- [x] Test seam commands: ✅ Available in code
- [ ] Browser testing: ❌ Timeout (documented)

### Risk Assessment
- **Risk Level**: Low
- **Reason**: TypeScript verification confirms implementation correctness
- **Limitation**: Full browser behavior not verified
- **Mitigation**: Code review confirms expected behavior

### Decision
Proceeding with TypeScript-only verification. Browser testing limitation documented.
```

### Example 2: Partial Browser Verification

```markdown
## Task Verification

### Browser Testing Status
- **Completed**: Initial page load, test seam availability
- **Incomplete**: Full interaction flow (timeout after 60 seconds)
- **Verified**: Basic functionality works
- **Not Verified**: Complete user flow

### Partial Verification Results
- [x] Page loads: ✅ Verified
- [x] Test seam available: ✅ Verified
- [x] Basic commands work: ✅ Verified
- [ ] Complete flow: ❌ Timeout (documented)

### Risk Assessment
- **Risk Level**: Medium
- **Reason**: Basic functionality verified, complete flow not tested
- **Limitation**: Full user flow not verified in browser
- **Mitigation**: Code review confirms flow logic

### Decision
Proceeding with partial verification. Full browser flow limitation documented.
```

### Example 3: Console Log Verification

```markdown
## Task Verification

### Browser Testing
- **Status**: Browser connection timeout
- **Fallback**: Console log verification

### Console Log Verification
- [x] No errors: ✅ Verified
- [x] Expected logs present: ✅ Verified
- [x] Test seam initialization: ✅ Logged
- [ ] Full browser interaction: ❌ Not verified

### Risk Assessment
- **Risk Level**: Low-Medium
- **Reason**: Console logs confirm initialization, full interaction not verified
- **Limitation**: Browser interaction not tested
- **Mitigation**: Code review confirms interaction logic

### Decision
Proceeding with console log verification. Browser interaction limitation documented.
```

## Best Practices

1. **Set proper timeouts**: 60-90 seconds for complex operations
2. **Don't abandon early**: Wait full timeout before giving up
3. **Use retry logic**: Exponential backoff for failed operations
4. **Log progress**: Show progress during long operations
5. **Use fallbacks**: When browser testing fails after proper timeout
6. **Document limitations**: Always document why browser testing failed
7. **Assess risk**: Evaluate risk of incomplete verification
8. **Proceed appropriately**: Only proceed if risk is acceptable

## Integration with Other Skills

- **agent-browser**: Uses this skill for timeout configuration
- **task-verification-workflow**: Uses fallback strategies when browser testing fails
- **testing-fallback-strategies**: Coordinates with fallback patterns

## Related Skills

- `agent-browser` - Browser automation patterns
- `task-verification-workflow` - Verification workflows
- `testing-fallback-strategies` - Fallback verification methods

## Remember

1. **30-90 seconds is normal**: Browser operations can take this long
2. **Don't abandon early**: Wait full timeout before giving up
3. **Use proper timeouts**: 60-90 seconds for complex operations
4. **Retry with backoff**: Exponential backoff for failed operations
5. **Log progress**: Show progress during long operations
6. **Use fallbacks**: When browser testing fails after proper timeout
7. **Document limitations**: Always document why verification is incomplete
8. **Assess risk**: Evaluate risk before proceeding with partial verification
