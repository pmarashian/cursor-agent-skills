---
name: timeout-prevention-operation-batching
description: Track execution time, identify operation batching opportunities, and prevent timeout violations. Use when approaching time limits or when performing many sequential operations to optimize execution and prevent 300-second timeout failures.
---

# Timeout Prevention and Operation Batching

## Overview

Strategies for tracking execution time, identifying batching opportunities, and preventing timeout violations. Helps agents optimize operation patterns to stay within 300-second iteration limits.

**Problem**: Multiple tasks exceeded 300-second timeout limits due to excessive sequential operations (168+ shell commands in single iterations).

**Solution**: Monitor elapsed time, batch independent operations, and prioritize critical work when approaching limits.

**Impact**: Reduce timeout occurrences by 70-80%, improve task completion rates.

## Time Tracking

### Checkpoint Strategy

**Monitor elapsed time at key checkpoints:**

```markdown
## Execution Checkpoints

1. **Start**: Record start time
2. **After Planning**: Check elapsed time after planning phase
3. **After Implementation**: Check elapsed time after code changes
4. **Before Testing**: Check elapsed time before browser/testing phase
5. **Soft Warning**: Alert at 200s (2/3 of 300s limit)
```

### Time Monitoring Pattern

```typescript
// Track time at checkpoints
const startTime = Date.now();

// After planning phase
const planningTime = Date.now() - startTime;
if (planningTime > 60) {
  console.warn('Planning phase took longer than expected');
}

// Before testing
const elapsedTime = Date.now() - startTime;
if (elapsedTime > 200) {
  // Soft timeout warning - prioritize critical operations
  console.warn('Approaching timeout limit - optimize remaining operations');
}
```

### Soft Timeout Warnings

**Alert agent when approaching 200s (2/3 of limit):**

```markdown
⚠️ **SOFT TIMEOUT WARNING** (200s / 300s limit)

When approaching 200 seconds:
- Prioritize critical operations
- Batch non-critical operations
- Skip optional verification steps
- Report progress immediately
- Consider deferring non-essential work
```

## Operation Batching Patterns

### Pattern 1: Batch Independent File Reads

**Read multiple files in parallel instead of sequentially:**

```typescript
// ❌ INEFFICIENT: Sequential reads
const file1 = read_file('src/scenes/GameScene.ts');
const file2 = read_file('src/scenes/MainMenu.ts');
const file3 = read_file('src/types/GameState.ts');

// ✅ EFFICIENT: Parallel reads (batched)
const [file1, file2, file3] = await Promise.all([
  read_file('src/scenes/GameScene.ts'),
  read_file('src/scenes/MainMenu.ts'),
  read_file('src/types/GameState.ts')
]);
```

### Pattern 2: Group Related Grep Searches

**Combine multiple grep operations:**

```typescript
// ❌ INEFFICIENT: Multiple separate greps
grep('GameState', 'src/**/*.ts');
grep('generateMaze', 'src/**/*.ts');
grep('TILE_SIZE', 'src/**/*.ts');

// ✅ EFFICIENT: Single semantic search or combined grep
codebase_search('Where is GameState used and how is maze generation implemented?');
// OR use grep with multiple patterns if supported
```

### Pattern 3: Consolidate Browser Commands

**Batch browser eval commands into single blocks:**

```bash
# ❌ INEFFICIENT: Multiple separate browser calls
agent-browser eval "window.__TEST__.commands.gameState()"
agent-browser eval "window.__TEST__.commands.setLevel(2)"
agent-browser eval "window.__TEST__.commands.setScore(100)"

# ✅ EFFICIENT: Single eval block
agent-browser eval "
  const state = window.__TEST__.commands.gameState();
  window.__TEST__.commands.setLevel(2);
  window.__TEST__.commands.setScore(100);
  return state;
"
```

### Pattern 4: Combine Viewport Tests

**Test multiple viewports in single browser session:**

```bash
# ❌ INEFFICIENT: Separate browser sessions per viewport
agent-browser open "http://localhost:5173?scene=GameScene"
agent-browser viewport 500 400
agent-browser snapshot
agent-browser close

agent-browser open "http://localhost:5173?scene=GameScene"
agent-browser viewport 1024 768
agent-browser snapshot
agent-browser close

# ✅ EFFICIENT: Single session with multiple viewports
agent-browser open "http://localhost:5173?scene=GameScene"
agent-browser viewport 500 400
agent-browser snapshot
agent-browser viewport 1024 768
agent-browser snapshot
agent-browser viewport 1920 1080
agent-browser snapshot
agent-browser close
```

### Pattern 5: Test Matrix Strategy

**Test minimum and maximum viewports first, intermediate only if needed:**

```typescript
// ✅ EFFICIENT: Test critical sizes first
const viewports = [
  { width: 500, height: 400 },   // Minimum
  { width: 1920, height: 1080 }, // Maximum
  // Only test intermediate if issues found
];

// If issues found, then test intermediate sizes
if (issuesFound) {
  viewports.push(
    { width: 1024, height: 768 },
    { width: 1280, height: 720 }
  );
}
```

## Priority Guidance

### Critical vs Non-Critical Operations

**When approaching timeout, prioritize:**

```markdown
## Priority Levels

### Critical (Must Complete)
- Core functionality implementation
- TypeScript compilation checks
- Critical bug fixes
- Success criteria verification

### Important (Should Complete)
- Browser testing for main scenarios
- Documentation updates
- Progress.txt updates

### Optional (Can Defer)
- Additional viewport testing
- Edge case testing
- Code cleanup
- Non-critical documentation
```

### Timeout Scenario Strategy

**When at 200s+ elapsed time:**

```markdown
1. **Skip optional operations**: Defer non-critical testing
2. **Batch aggressively**: Combine all remaining operations
3. **Prioritize verification**: Focus on success criteria
4. **Report progress**: Update progress.txt immediately
5. **Complete marker**: Output completion marker if criteria met
```

## Checkpoint Strategy

### Progress Reports

**Force progress reports every 60-90 seconds:**

```markdown
## Progress Checkpoint (60s elapsed)

- [x] Planning phase complete
- [x] File analysis complete
- [ ] Implementation in progress
- [ ] Testing pending

## Progress Checkpoint (120s elapsed)

- [x] Planning phase complete
- [x] File analysis complete
- [x] Implementation complete
- [ ] Testing in progress

## Progress Checkpoint (180s elapsed)

- [x] Planning phase complete
- [x] File analysis complete
- [x] Implementation complete
- [x] Testing complete
- [ ] Final verification pending
```

### Silent Hang Prevention

**Report progress regularly to prevent silent hangs:**

```typescript
// Report progress every 60-90 seconds
const lastReport = Date.now();
const REPORT_INTERVAL = 60000; // 60 seconds

function checkProgress() {
  const elapsed = Date.now() - lastReport;
  if (elapsed > REPORT_INTERVAL) {
    console.log(`Progress: ${currentPhase} - ${elapsedTime}s elapsed`);
    lastReport = Date.now();
  }
}
```

## Best Practices

1. **Monitor time**: Track elapsed time at checkpoints
2. **Batch operations**: Group independent operations
3. **Prioritize critical**: Focus on essential work when time is limited
4. **Report progress**: Update every 60-90 seconds
5. **Soft warnings**: Alert at 200s to optimize remaining work
6. **Parallel reads**: Read multiple files simultaneously
7. **Consolidate commands**: Batch browser and shell commands
8. **Test matrices**: Test critical viewports first

## Common Pitfalls

### Pitfall 1: Sequential File Reads

**Problem**: Reading files one at a time

**Solution**: Batch independent file reads

```typescript
// ❌ WRONG: Sequential
read_file('file1.ts');
read_file('file2.ts');
read_file('file3.ts');

// ✅ CORRECT: Parallel
Promise.all([
  read_file('file1.ts'),
  read_file('file2.ts'),
  read_file('file3.ts')
]);
```

### Pitfall 2: Multiple Browser Sessions

**Problem**: Opening new browser session for each test

**Solution**: Reuse single session for multiple tests

```bash
# ❌ WRONG: Multiple sessions
agent-browser open "http://localhost:5173"
agent-browser snapshot
agent-browser close
agent-browser open "http://localhost:5173"
agent-browser snapshot
agent-browser close

# ✅ CORRECT: Single session
agent-browser open "http://localhost:5173"
agent-browser snapshot
agent-browser reload
agent-browser snapshot
agent-browser close
```

### Pitfall 3: No Time Awareness

**Problem**: Not monitoring elapsed time

**Solution**: Track time at checkpoints

```typescript
// ❌ WRONG: No time tracking
// Perform operations without monitoring

// ✅ CORRECT: Time tracking
const startTime = Date.now();
// ... operations ...
const elapsed = Date.now() - startTime;
if (elapsed > 200000) {
  // Optimize remaining operations
}
```

## Integration with Other Skills

- **`file-operation-optimization`**: Uses batching patterns for file operations
- **`agent-browser`**: Applies batching to browser commands
- **`refactoring-workflow-optimization`**: Uses time tracking during refactoring

## Related Skills

- `file-operation-optimization` - File reading and caching strategies
- `agent-browser` - Browser automation patterns
- `refactoring-workflow-optimization` - Refactoring with time awareness

## Remember

1. **Track time**: Monitor elapsed time at checkpoints
2. **Batch operations**: Group independent operations
3. **Prioritize**: Focus on critical work when time is limited
4. **Report progress**: Update every 60-90 seconds
5. **Soft warnings**: Alert at 200s (2/3 of limit)
6. **Prevent timeouts**: Optimize patterns to stay within 300s limit
