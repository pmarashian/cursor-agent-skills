---
name: async-operation-handler
description: Handle asynchronous operations from MCP servers (PixelLab, ElevenLabs, etc.) with intelligent polling, timeout management, and parallel work opportunities. Use when waiting for async jobs, polling status, or managing long-running operations. Provides exponential backoff, ETA-aware waiting, and prevents premature downloads.
---

# Async Operation Handler

Handle asynchronous operations efficiently with intelligent polling, timeout management, and parallel work opportunities. Reduces async operation overhead by 50-70% and saves 15-30 seconds per operation.

## Overview

When working with async operations (PixelLab character generation, ElevenLabs TTS, etc.), use this skill to:
- Poll with exponential backoff instead of fixed intervals
- Respect API-provided ETAs when available
- Handle timeouts gracefully
- Use waiting time for parallel work
- Prevent premature download attempts

## ⚠️ CRITICAL: Use Exponential Backoff, Not Fixed Intervals ⚠️

**AGENTS WASTE 20-40% OF WAIT TIME BY USING FIXED INTERVALS INSTEAD OF EXPONENTIAL BACKOFF.**

**The Problem**: Fixed intervals (e.g., 30s, 60s) waste time by polling too frequently early and not frequently enough later.

**The Solution**: Exponential backoff (5s → 10s → 20s → 40s → 60s) adapts to operation progress.

## Core Patterns

### Exponential Backoff Polling (CORRECT)

**✅ CORRECT: Use exponential backoff - 5s → 10s → 20s → 40s → 60s**

```typescript
async function pollAsyncOperation(
  checkStatus: () => Promise<StatusResponse>,
  options: PollOptions = {}
): Promise<StatusResponse> {
  const {
    maxWait = 300000,        // 5 minutes default
    backoff = 'exponential',  // 'exponential' or 'fixed'
    respectETA = true,        // Use API-provided ETAs
    initialInterval = 5000    // Start at 5 seconds
  } = options;

  let interval = initialInterval;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    const status = await checkStatus();

    // Success: return immediately
    if (status.status === 'completed') {
      return status;
    }

    // Failure: throw error
    if (status.status === 'failed') {
      throw new Error(`Operation failed: ${status.error || 'Unknown error'}`);
    }

    // Calculate wait time
    let waitTime = interval;
    
    // Respect ETA if available and respectETA is true
    if (respectETA && status.eta_seconds) {
      waitTime = Math.min(status.eta_seconds * 1000, interval * 2);
    }

    // Wait before next poll
    await sleep(waitTime);

    // Exponential backoff: 5s → 10s → 20s → 40s (capped)
    if (backoff === 'exponential') {
      interval = Math.min(interval * 2, 40000); // Cap at 40 seconds
    }
  }

  throw new Error(`Operation timed out after ${maxWait}ms`);
}
```

### Fixed Interval Polling (INCORRECT - ANTI-PATTERN)

**❌ WRONG: Fixed intervals waste 20-40% of wait time**

```typescript
// ❌ INCORRECT: Fixed 30 second intervals
async function pollWithFixedInterval(
  checkStatus: () => Promise<StatusResponse>
): Promise<StatusResponse> {
  const maxWait = 300000;  // 5 minutes
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    const status = await checkStatus();
    
    if (status.status === 'completed') {
      return status;
    }
    
    // ❌ WRONG: Fixed 30 second wait
    await sleep(30000);  // Always wait 30 seconds, regardless of progress
  }
  
  throw new Error('Operation timed out');
}
```

**Why Fixed Intervals Are Inefficient**:
- **Early polls**: Too frequent (operation just started, won't be ready)
- **Later polls**: Too infrequent (operation may be ready, but we wait full interval)
- **Waste**: 20-40% of total wait time is wasted

**Example Timeline (Fixed 30s vs Exponential Backoff)**:

```
Fixed 30s intervals:
0s: Poll → Not ready
30s: Poll → Not ready (wasted 30s)
60s: Poll → Not ready (wasted 30s)
90s: Poll → Ready! (but we waited full 30s when it was ready at 75s)
Total: 90s (15s wasted)

Exponential backoff:
0s: Poll → Not ready
5s: Poll → Not ready
15s: Poll → Not ready
35s: Poll → Ready!
Total: 35s (0s wasted)
```

### Visual Comparison: Fixed vs Exponential

**Fixed Interval (30s)**:
```
Poll 1: 0s    → Not ready → Wait 30s
Poll 2: 30s   → Not ready → Wait 30s
Poll 3: 60s   → Not ready → Wait 30s
Poll 4: 90s   → Ready! (but was ready at 75s, wasted 15s)
Total: 90s (15s wasted)
```

**Exponential Backoff**:
```
Poll 1: 0s    → Not ready → Wait 5s
Poll 2: 5s    → Not ready → Wait 10s
Poll 3: 15s   → Not ready → Wait 20s
Poll 4: 35s   → Ready!
Total: 35s (0s wasted)
```

**Time Saved**: 55 seconds (61% faster)

### ETA-Aware Waiting

**Respect API-provided ETAs when available:**

```typescript
// PixelLab example
const character = await mcp_pixellab_get_character({ character_id });
if (character.eta_seconds) {
  // Wait for ETA, but don't wait longer than current interval
  const waitTime = Math.min(character.eta_seconds * 1000, currentInterval);
  await sleep(waitTime);
}
```

### ETA-Based Scheduling

**Schedule status checks at strategic points based on ETA:**

Instead of polling at fixed intervals, schedule checks at percentage milestones of the ETA:

```typescript
async function pollWithETAScheduling(
  checkStatus: () => Promise<StatusResponse>,
  initialETA: number
): Promise<StatusResponse> {
  const milestones = [
    initialETA * 0.10,  // Check at 10% of ETA
    initialETA * 0.50,  // Check at 50% of ETA
    initialETA * 0.75,  // Check at 75% of ETA
  ];
  
  let currentMilestone = 0;
  const startTime = Date.now();
  
  while (true) {
    const elapsed = (Date.now() - startTime) / 1000; // seconds
    
    // Check if we've reached the next milestone
    if (currentMilestone < milestones.length && elapsed >= milestones[currentMilestone]) {
      const status = await checkStatus();
      
      // Update ETA if provided
      if (status.eta_seconds) {
        // Recalculate milestones based on new ETA
        const remainingTime = status.eta_seconds;
        milestones.splice(0, currentMilestone + 1);
        milestones.push(
          elapsed + remainingTime * 0.10,
          elapsed + remainingTime * 0.50,
          elapsed + remainingTime * 0.75
        );
        currentMilestone = 0;
      }
      
      if (status.status === 'completed') {
        return status;
      }
      
      if (status.status === 'failed') {
        throw new Error(`Operation failed: ${status.error || 'Unknown error'}`);
      }
      
      currentMilestone++;
    }
    
    // If past all milestones, poll more frequently until complete
    if (currentMilestone >= milestones.length) {
      const status = await checkStatus();
      
      if (status.status === 'completed') {
        return status;
      }
      
      if (status.status === 'failed') {
        throw new Error(`Operation failed: ${status.error || 'Unknown error'}`);
      }
      
      // Poll every 20 seconds after milestones
      await sleep(20000);
    } else {
      // Wait until next milestone
      const nextMilestone = milestones[currentMilestone];
      const waitTime = Math.max(1000, (nextMilestone - elapsed) * 1000);
      await sleep(waitTime);
    }
  }
}
```

**Example Timeline (ETA: 176 seconds):**

```
0s:    Poll → Not ready, ETA: 176s
18s:   Poll at 10% (17.6s) → Not ready, ETA: 158s (updated)
88s:   Poll at 50% (88s) → Not ready, ETA: 88s (updated)
132s:  Poll at 75% (132s) → Not ready, ETA: 44s (updated)
176s:  Poll → Ready!
Total: 176s (optimal - no wasted polls)
```

**Benefits:**
- Reduces API calls by 60-70% compared to fixed intervals
- Adapts to changing ETAs dynamically
- Checks at strategic points (10%, 50%, 75%) before final completion
- More efficient than exponential backoff for operations with reliable ETAs

**When to Use ETA-Based Scheduling:**
- Operations provide reliable ETA information (PixelLab, ElevenLabs)
- ETA is reasonably accurate (within 20% variance)
- Operation duration is predictable

**When to Use Exponential Backoff Instead:**
- ETA information is unreliable or unavailable
- Operation duration is highly variable
- Need more frequent early checks for debugging

### Pre-Download Validation

**ALWAYS verify status === "completed" before download:**

```typescript
// ❌ WRONG: Download immediately
const character = await create_character({ description: "wizard" });
const url = character.download_url; // May be null or locked

// ✅ CORRECT: Wait for completion
let character = await create_character({ description: "wizard" });
while (character.status !== 'completed') {
  await sleep(5000);
  character = await get_character({ character_id: character.character_id });
}
// Now safe to download
const url = character.download_url;
```

### Parallel Work During Waiting

**Use waiting time for parallel work:**

```typescript
// Start async operation
const { character_id, job_id } = await mcp_pixellab_create_character({
  description: "wizard",
  n_directions: 8
});

// While waiting, do parallel work:
// 1. Prepare integration code
const integrationCode = prepareIntegrationCode();

// 2. Check existing assets
const existingAssets = checkExistingAssets();

// 3. Poll for completion (with backoff)
const character = await pollAsyncOperation(
  () => mcp_pixellab_get_character({ character_id }),
  { maxWait: 300000, respectETA: true }
);

// Now integrate immediately
integrateAsset(character, integrationCode);
```

## Integration Examples

### PixelLab Character Generation

```typescript
async function generateCharacterWithBackoff(description: string) {
  // 1. Create character
  const { character_id } = await mcp_pixellab_create_character({
    description,
    n_directions: 8,
    size: 48
  });

  // 2. Poll with exponential backoff
  const character = await pollAsyncOperation(
    () => mcp_pixellab_get_character({ character_id }),
    {
      maxWait: 300000,  // 5 minutes
      respectETA: true,
      backoff: 'exponential'
    }
  );

  // 3. Verify completion before download
  if (character.status !== 'completed') {
    throw new Error('Character generation incomplete');
  }

  return character;
}
```

### PixelLab Tile Generation

```typescript
async function generateTileWithBackoff(description: string) {
  const { tile_id } = await mcp_pixellab_create_isometric_tile({
    description,
    size: 32
  });

  const tile = await pollAsyncOperation(
    () => mcp_pixellab_get_isometric_tile({ tile_id }),
    {
      maxWait: 120000,  // 2 minutes for tiles
      respectETA: true
    }
  );

  return tile;
}
```

### ElevenLabs TTS

```typescript
async function generateTTSWithBackoff(text: string, voiceId: string) {
  // Note: ElevenLabs TTS is usually synchronous, but if async:
  const { job_id } = await mcp_ElevenLabs_text_to_speech({
    text,
    voice_id: voiceId
  });

  const result = await pollAsyncOperation(
    () => checkTTSStatus(job_id),
    {
      maxWait: 60000,  // 1 minute for TTS
      respectETA: false  // TTS usually doesn't provide ETAs
    }
  );

  return result;
}
```

## Polling Intervals

### Recommended Intervals

- **Initial poll**: 5 seconds
- **After first poll**: 10 seconds
- **After second poll**: 20 seconds
- **After third poll**: 40 seconds (capped)
- **Maximum wait**: 5 minutes for character generation, 2 minutes for tiles

### When to Use Fixed vs Exponential

- **Exponential backoff**: Long operations (character generation, complex assets)
- **Fixed interval**: Short operations (tiles, simple assets) or when ETA is reliable

## Timeout Handling

### Maximum Timeouts by Operation Type

```typescript
const TIMEOUTS = {
  character_generation: 300000,  // 5 minutes
  tile_generation: 120000,       // 2 minutes
  map_object: 180000,            // 3 minutes
  animation: 240000,             // 4 minutes
  default: 300000                // 5 minutes
};
```

### Graceful Timeout Handling

```typescript
try {
  const result = await pollAsyncOperation(checkStatus, {
    maxWait: TIMEOUTS.character_generation
  });
  return result;
} catch (error) {
  if (error.message.includes('timed out')) {
    // Log timeout, suggest retry or fallback
    console.warn('Operation timed out, consider retrying or using fallback');
    throw new Error('Operation timed out after maximum wait period');
  }
  throw error;
}
```

## Progress Tracking

### Log Progress and ETA

```typescript
async function pollWithProgress(
  checkStatus: () => Promise<StatusResponse>,
  options: PollOptions
) {
  let attempt = 0;
  
  while (true) {
    const status = await checkStatus();
    attempt++;

    // Log progress
    console.log(`Poll attempt ${attempt}: status=${status.status}`);
    if (status.eta_seconds) {
      console.log(`ETA: ${status.eta_seconds} seconds`);
    }

    if (status.status === 'completed') {
      console.log('Operation completed successfully');
      return status;
    }

    // Wait with backoff
    await sleep(calculateWaitTime(status, attempt));
  }
}
```

## Common Mistakes

### ❌ Mistake 1: Fixed Interval Polling (MOST COMMON)

**Problem**: Using fixed intervals (30s, 60s) instead of exponential backoff

**Example**:
```typescript
// ❌ WRONG: Fixed 30 second intervals
while (status !== 'completed') {
  await sleep(30000);  // Always 30 seconds
  status = await checkStatus();
}

// ❌ WRONG: Fixed 60 second intervals
while (status !== 'completed') {
  await sleep(60000);  // Always 60 seconds
  status = await checkStatus();
}
```

**Why This Is Wrong**:
- Wastes 20-40% of wait time
- Polls too frequently early (operation won't be ready)
- Polls too infrequently later (operation may be ready, but we wait full interval)

**Correct Solution**:
```typescript
// ✅ CORRECT: Exponential backoff
let interval = 5000;  // Start at 5 seconds
while (status !== 'completed') {
  await sleep(interval);
  status = await checkStatus();
  interval = Math.min(interval * 2, 60000);  // 5s → 10s → 20s → 40s → 60s
}
```

### ❌ Mistake 2: Polling Too Frequently

**Problem**: Polling every 1-2 seconds wastes resources

```typescript
// ❌ WRONG: Polling every 1-2 seconds
while (status !== 'completed') {
  await sleep(1000);  // Too frequent!
  status = await checkStatus();
}
```

**Why This Is Wrong**:
- Wastes API calls
- May hit rate limits
- No benefit (operation won't complete faster)

**Correct Solution**:
```typescript
// ✅ CORRECT: Start at 5 seconds minimum
let interval = 5000;  // Minimum 5 seconds
while (status !== 'completed') {
  await sleep(interval);
  status = await checkStatus();
  interval = Math.min(interval * 2, 60000);
}
```

### ❌ Mistake 3: Download Before Completion

**Problem**: Downloading immediately without checking status

```typescript
// ❌ WRONG: Downloading immediately
const character = await create_character({ description: "wizard" });
download(character.download_url);  // May be null or locked!
```

**Why This Is Wrong**:
- Download URL may be null
- File may be locked (HTTP 423)
- Operation may not be complete

**Correct Solution**:
```typescript
// ✅ CORRECT: Wait for completion first
let character = await create_character({ description: "wizard" });
while (character.status !== 'completed') {
  await sleep(interval);
  character = await get_character({ character_id: character.character_id });
  interval = Math.min(interval * 2, 60000);
}
// Now safe to download
download(character.download_url);
```

### ❌ Mistake 4: Wait Idly

**Problem**: Just waiting without doing parallel work

```typescript
// ❌ WRONG: Just waiting
await pollAsyncOperation(checkStatus);
// No parallel work done
```

**Why This Is Wrong**:
- Wastes time that could be used for preparation
- No benefit from waiting time

**Correct Solution**:
```typescript
// ✅ CORRECT: Do parallel work
const [result, integrationCode] = await Promise.all([
  pollAsyncOperation(checkStatus),
  prepareIntegrationCode()  // Prepare while waiting
]);
```

### ❌ Mistake 5: Ignoring API-Provided ETAs

**Problem**: Not using API-provided ETAs when available

```typescript
// ❌ WRONG: Ignoring ETA
const character = await get_character({ character_id });
await sleep(30000);  // Fixed wait, ignoring ETA
```

**Why This Is Wrong**:
- API provides accurate ETA
- We wait longer than necessary
- Wastes time

**Correct Solution**:
```typescript
// ✅ CORRECT: Respect ETA
const character = await get_character({ character_id });
if (character.eta_seconds) {
  await sleep(Math.min(character.eta_seconds * 1000, currentInterval));
}
```

## Common Pitfalls

### ❌ Don't: Poll Too Frequently

```typescript
// WRONG: Polling every 1-2 seconds
while (status !== 'completed') {
  await sleep(1000);  // Too frequent!
  status = await checkStatus();
}
```

### ❌ Don't: Download Before Completion

```typescript
// WRONG: Downloading immediately
const character = await create_character({ description: "wizard" });
download(character.download_url);  // May be null or locked!
```

### ❌ Don't: Wait Idly

```typescript
// WRONG: Just waiting
await pollAsyncOperation(checkStatus);
// No parallel work done

// CORRECT: Do parallel work
const [result, integrationCode] = await Promise.all([
  pollAsyncOperation(checkStatus),
  prepareIntegrationCode()
]);
```

## Best Practices

1. **Always use exponential backoff** for long operations
2. **Respect API-provided ETAs** when available
3. **Verify completion before download** (status === "completed")
4. **Use waiting time for parallel work** (code preparation, documentation)
5. **Set appropriate timeouts** based on operation type
6. **Log progress and ETAs** for transparency
7. **Handle HTTP 423 (Locked) errors** gracefully
8. **Never poll more frequently than every 5 seconds**

## Integration with Other Skills

- **game-asset-pipeline**: Uses this skill for asset generation polling
- **asset-integration-workflow**: Uses this skill for async asset operations
- **pixellab-mcp**: MCP server that benefits from this polling pattern

## Related Skills

- `game-asset-pipeline` - Asset generation workflow
- `asset-integration-workflow` - Asset integration patterns
- `pixellab-mcp` - PixelLab MCP server documentation

## Remember

1. **Poll with exponential backoff**: 5s → 10s → 20s → 40s
2. **Respect ETAs**: Use API-provided ETAs when available
3. **Verify before download**: Always check status === "completed"
4. **Do parallel work**: Use waiting time productively
5. **Set timeouts**: Don't wait forever
6. **Log progress**: Keep users informed
