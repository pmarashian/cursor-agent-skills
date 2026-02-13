---
name: loop-detection-prevention
description: Monitor for identical tool calls in short timeframes, track progress metrics, and recognize stuck states. Use when agent behavior shows repetitive patterns, no progress, or excessive retries. Prevents infinite loops and stuck execution states.
---

# Loop Detection and Prevention

## Overview

Monitor agent execution for repetitive patterns and stuck states. Detect when identical tool calls are repeated without progress, and trigger intervention strategies.

## Core Principles

1. **Monitor tool call patterns**: Track identical tool calls with same arguments
2. **Track progress metrics**: Files edited, tests run, errors fixed
3. **Recognize stuck states**: No progress in 5 minutes, 10+ identical calls
4. **Intervene when needed**: Skip step, try alternative, or ask for help

## Detection Patterns

### Identical Tool Calls

**Monitor for**:
- Same tool + same arguments repeated >10 times
- Timeframe: Within 5 minutes
- No progress indicators (files edited, tests run)

**Example pattern**:
```
Call 1: text_to_speech("test", voice="Adam")
Call 2: text_to_speech("test", voice="Adam")
Call 3: text_to_speech("test", voice="Adam")
... (repeated 485+ times)
```

**Intervention trigger**: 10+ identical calls without progress

### Progress Metrics

**Track these metrics**:
- Files edited (count and names)
- Tests run (count and results)
- Errors fixed (count and types)
- Tool calls made (unique tools, not repeats)

**No progress indicators**:
- No files edited in 5 minutes
- No tests run in 5 minutes
- No errors fixed in 5 minutes
- Only identical tool calls

### Stuck States

**Recognize when stuck**:
- Tool consistently failing (API errors, network issues)
- Waiting for condition that never occurs
- Retrying same approach without variation
- No alternative strategy attempted

## Self-Monitoring Techniques

### Before Each Tool Call

**Check**:
1. "Have I done this before?" (same tool + same arguments)
2. "What have I accomplished since last check?" (progress metrics)
3. "Am I making progress or repeating?" (stuck state check)

### Progress Tracking

**Maintain mental checklist**:
- [ ] Files edited: X files
- [ ] Tests run: X tests
- [ ] Errors fixed: X errors
- [ ] Unique tools used: X tools

**Reset tracking**:
- After each major milestone (feature complete, test passing)
- After intervention (skipped step, tried alternative)
- After 5 minutes of work

## Intervention Triggers

### Automatic Triggers

**Intervene when**:
1. **10+ identical tool calls** in 5 minutes without progress
2. **No files edited** in 5 minutes
3. **No tests run** in 5 minutes
4. **Tool failures** without fallback strategy (3+ failures)

### Manual Triggers

**Intervene when**:
- User explicitly asks to stop
- Task requirements change
- External dependency unavailable

## Intervention Strategies

### Strategy 1: Skip Step

**When to use**:
- Tool consistently failing (API errors, network issues)
- Step not critical for task completion
- Alternative approach available

**Action**:
1. Document why step was skipped
2. Use alternative approach
3. Continue with remaining steps

**Example**:
```
Tool: text_to_speech (failing - API key invalid)
Action: Skip TTS, use console.log for verification
Reason: TTS not critical for task completion
```

### Strategy 2: Try Alternative

**When to use**:
- Primary tool failing but alternative exists
- Different approach might work
- Retry with variation

**Action**:
1. Identify alternative tool/approach
2. Try alternative
3. If alternative works, continue
4. If alternative fails, skip step

**Example**:
```
Primary: agent-browser (failing - timeout)
Alternative: Code review + compilation check
Action: Use alternative for verification
```

### Strategy 3: Ask for Help

**When to use**:
- All alternatives exhausted
- Task cannot proceed without intervention
- External dependency unavailable

**Action**:
1. Document what was attempted
2. Explain why stuck
3. Ask user for guidance
4. Wait for response before continuing

## When to Skip vs. Retry

### Skip When

- **Tool consistently failing**: API errors, network issues, invalid credentials
- **Step not critical**: Nice-to-have feature, optional verification
- **Alternative available**: Different tool or approach works
- **External dependency unavailable**: Service down, file missing

### Retry When

- **Transient failures**: Timeouts, temporary network issues
- **Step is critical**: Required for task completion
- **No alternative available**: Must use this tool/approach
- **Likely to succeed**: Previous attempts showed progress

### Retry Limits

**Maximum retries**: 3 attempts
- **First retry**: 1 second delay
- **Second retry**: 2 second delay
- **Third retry**: 4 second delay
- **After 3 retries**: Skip and use alternative

## Implementation Patterns

### Pattern 1: Tool Call Tracking

```javascript
// Pseudo-code for tracking
const toolCallHistory = [];
const MAX_IDENTICAL_CALLS = 10;
const TIME_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function shouldIntervene(tool, args) {
  const callSignature = `${tool}:${JSON.stringify(args)}`;
  const recentCalls = toolCallHistory.filter(
    call => call.signature === callSignature &&
    Date.now() - call.timestamp < TIME_WINDOW_MS
  );
  
  if (recentCalls.length >= MAX_IDENTICAL_CALLS) {
    return { shouldIntervene: true, reason: 'too_many_identical_calls' };
  }
  
  return { shouldIntervene: false };
}
```

### Pattern 2: Progress Tracking

```javascript
// Pseudo-code for progress tracking
const progressMetrics = {
  filesEdited: [],
  testsRun: [],
  errorsFixed: [],
  lastProgressTime: Date.now()
};

function checkProgress() {
  const timeSinceProgress = Date.now() - progressMetrics.lastProgressTime;
  const NO_PROGRESS_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  
  if (timeSinceProgress > NO_PROGRESS_THRESHOLD) {
    return { shouldIntervene: true, reason: 'no_progress' };
  }
  
  return { shouldIntervene: false };
}
```

## Best Practices

1. **Monitor continuously**: Check before each tool call
2. **Track progress**: Maintain mental checklist of accomplishments
3. **Intervene early**: Don't wait for 100+ identical calls
4. **Document interventions**: Explain why step was skipped/retried
5. **Use alternatives**: Always have fallback strategy

## Resources

- `agent-workflow-guidelines` skill - General workflow guidelines
- `error-recovery-patterns` skill - Error handling and recovery strategies
