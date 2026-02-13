---
name: agent-workflow-guidelines
description: Essential workflow guidelines for AI agents working on development tasks. Use at the start of every task to ensure proper workflow, skill discovery, port detection, testing methodology, and verification. Consolidates critical prompt updates for consistent agent behavior across all tasks.
---

# Agent Workflow Guidelines

## Overview

Essential workflow guidelines to ensure efficient and reliable task execution. Follow these guidelines at the start of every task.

## High Priority Guidelines

### 1. Mandatory Skill Discovery

**MANDATORY WORKFLOW - Do not skip**:

1. Read task file (tasks/next_task.md)
2. Read progress file (tasks/progress.txt)
3. Call `search_skills("")` to list ALL available skills
4. Load relevant skills before starting implementation
5. Only then proceed with task work

**This is a blocking requirement** - the orchestrator will verify skill discovery was performed.

**Limiting search breadth**: If two skill searches return no relevant match, load the standard set for the task type (e.g. progress-tracking, pre-implementation-check) and proceed. Do not run additional broad queries (e.g. `search_skills("backend")`) repeatedly.

### 2. Port Detection Before Browser Connection

**Before opening browser for testing**:

1. Check `vite.config.ts` for `server.port` configuration
2. Check `package.json` for `PORT` environment variable
3. Check running processes or terminal output for actual port
4. Don't assume default ports (3000, 5173, etc.)
5. Use discovered port in browser commands

**If port detection fails**, try common ports sequentially with timeout.

### 3. Phaser Game Testing Methodology

**For Phaser game tasks**:
- **PRIMARY METHOD**: Use test seam commands (`window.__TEST__.commands`)
- Test seams are the **ONLY reliable way** to interact with Phaser canvas games
- DOM text search (`find text`) does **NOT work** with canvas-rendered text
- Keyboard simulation may not work - use test seam commands instead
- Always check for test seam availability before attempting DOM interactions

**If test seam sceneKey doesn't update on transitions**, use console logs as fallback verification.

### 4. Success Criteria Validation

**Before marking task complete**:

1. Verify **ALL success criteria** are met
2. **Don't mark complete** if progress shows 0/X criteria
3. For each criterion, document how it was verified
4. If browser testing fails, use fallback verification (console logs, code review)
5. Don't abandon testing on first failure - try alternative methods

**Completion Checklist**:
- [ ] All code changes implemented
- [ ] TypeScript compilation passes
- [ ] All success criteria verified
- [ ] Browser testing completed (for web/game tasks)
- [ ] Progress.txt updated
- [ ] Git commit with proper format

## Medium Priority Guidelines

### 5. TypeScript Compilation After Edits

**After making code edits**:

1. Run `npx tsc --noEmit` **immediately** to check for errors
2. Fix any compilation errors before proceeding
3. Don't wait until end of task to check compilation
4. Use smaller, incremental edits with verification

**Common errors to watch for**:
- Syntax errors (extra/missing braces)
- Method name mismatches (check actual method names in code)
- Type mismatches (verify interface compatibility)
- Import path errors (use relative paths)

### 6. Server Readiness Before Testing

**When starting dev server for testing**:

1. Start server with `npm run dev`
2. **Poll server health endpoint** until ready (don't use fixed sleep)
3. Check for "Local:" message in terminal output
4. Implement retry logic with timeout (max 30 seconds)
5. Only proceed with browser testing when server is confirmed ready

**Pattern**:
```bash
for i in {1..10}; do
  if curl -s http://localhost:PORT > /dev/null; then break; fi
  sleep 2
done
```

### 7. Timer Testing Efficiency

**For timer-related features**:
- **NEVER wait for natural countdown** (e.g., 60 seconds)
- Use test seam `setTimer(seconds)` to set timer directly
- Test boundary conditions (9, 10, 11 seconds for color changes)
- Add timer manipulation commands to test seam if not available
- Test both positive (timer works) and negative (timer expires) cases

**If test seam doesn't have timer commands**, add them before testing.

### 8. Error Handling Testing

**For error handling tasks**:
- Create test scenarios to force error conditions
- Add test seam commands to trigger errors (e.g., `forceMazeFailure()`)
- Test fallback behavior works correctly
- Verify console warnings/logs appear
- **Don't commit error handling code without testing error paths**

**If error condition is hard to trigger naturally**, create test mode or test seam command.

### 9. localStorage Key Verification

**Before using localStorage**:

1. Read the storage utility file to find the correct key name
2. Check for constants file with exported storage keys
3. Verify key format (camelCase, kebab-case, etc.) matches codebase
4. Don't assume naming conventions - check actual implementation

**This codebase uses camelCase**: `pixelGameSettings` (not `pixel-game-settings`)

### 10. Scene Transition Testing

**For scene transition testing**:
- Use test seam navigation commands when available
- Wait 1-2 seconds after transition before checking test seam
- Test seam sceneKey may lag - use console logs as fallback
- Don't rely solely on test seam sceneKey for verification
- Document scene navigation patterns in progress.txt

### 11. Browser Automation Timeout

**When browser automation commands hang or timeout**:

1. Set explicit timeout (default: 10 seconds)
2. If command exceeds timeout, try alternative method
3. Don't abandon testing - use fallback verification
4. Document timeout issues in progress.txt

**Fallback order**:
1. Test seam commands (for Phaser games)
2. Console log verification
3. Screenshot comparison
4. Code review + compilation check

### 12. Test Seam Command Discovery

**When testing Phaser games**:

1. First check source code for available test seam commands
2. Look for `window.__TEST__.commands` in scene files
3. Document discovered commands in progress.txt
4. Use test seam commands instead of DOM interactions
5. If command doesn't exist, add it to test seam before testing

## Low Priority Guidelines

### 13. Task Verification Before Starting

**Before implementing new features**:

1. Check if functionality already exists in codebase
2. Search for similar implementations
3. Verify task dependencies are complete
4. If feature exists, still verify it works correctly before marking complete

### 14. Progress Tracking Accuracy

**Note**: If progress tracking shows 0/X criteria despite completion:
- This is a **known orchestrator issue**
- Still verify all success criteria manually
- Don't let progress tracking prevent completion if criteria are met
- Document verification in progress.txt

### 15. Incremental Development Pattern

**For complex implementations**:
- Make smaller, incremental edits
- Verify after each logical change (compile, test)
- Build functionality layer by layer
- Don't make large changes without intermediate verification

**Pattern**: Edit → Compile → Test → Next Edit

## Workflow Summary

**Start of Task**:
1. Read task file and progress file
2. Call `search_skills("")` to discover all skills
3. Load relevant skills
4. Detect port before browser connection
5. Begin implementation

**During Implementation**:
- Run TypeScript compilation after each edit
- Use test seam commands for Phaser games
- Verify server readiness before testing
- Use timer manipulation, not natural countdown

**Before Completion**:
- Verify all success criteria
- Don't mark complete if 0/X criteria shown
- Use fallback verification if primary method fails
- Update progress.txt with learnings

### 16. Loop Detection and Prevention

**Monitor for identical tool calls in short timeframes**:

1. Track tool call patterns (same tool + same arguments)
2. If identical calls >10 times in 5 minutes, **STOP and reassess**
3. Check for progress metrics (files edited, tests run, errors fixed)
4. If no progress in 5 minutes, **intervene** (skip step, try alternative, or ask for help)

**Intervention triggers**:
- 10+ identical tool calls without progress
- No files edited in 5 minutes
- No tests run in 5 minutes
- Tool failures without fallback strategy

**Self-monitoring techniques**:
- Before each tool call, check: "Have I done this before?"
- Track progress: "What have I accomplished since last check?"
- Recognize stuck states: "Am I making progress or repeating?"

**When to skip vs. retry**:
- **Skip**: Tool consistently failing (API errors, network issues)
- **Retry**: Transient failures (timeouts, temporary errors)
- **Alternative**: Use different tool or approach if primary fails

### 17. Error Recovery Patterns

**For common error types**:

**Compilation errors**:
1. Read error message carefully
2. Fix syntax/type errors immediately
3. Re-run compilation check
4. If errors persist, check for missing imports or type definitions

**Test failures**:
1. Read test output to understand failure
2. Check if test is flaky or code is broken
3. Fix code if broken, skip test if flaky (document why)
4. Re-run tests to verify fix

**Tool failures**:
1. Check error message for root cause
2. If API key missing/invalid, skip tool usage (don't retry)
3. If network timeout, retry with exponential backoff (max 3 times)
4. If tool unavailable, use alternative approach
5. Document fallback strategy in progress.txt

**Retry patterns with limits**:
- **First retry**: 1 second delay
- **Second retry**: 2 second delay
- **Third retry**: 4 second delay
- **After 3 retries**: Skip and use alternative

**Graceful degradation**:
- If cost-incurring tool fails, use free alternative
- If browser testing fails, use code review + compilation check
- If test seam unavailable, use console logs + screenshots

### 18. Tool Usage Guardrails

**Before using cost-incurring tools** (ElevenLabs, PixelLab, etc.):

1. **Verify user explicitly requested** the tool usage
2. **Check if free alternative exists** (e.g., browser testing vs. TTS)
3. **Don't use for non-functional purposes** (testing, "thinking", exploration)
4. **Only use when necessary** for task completion

**Validation checklist**:
- [ ] User explicitly requested this tool?
- [ ] Is this necessary for task completion?
- [ ] Is there a free alternative?
- [ ] Is this for functional testing or just exploration?

**If validation fails**: Use alternative approach or skip tool usage.

## Resources

These guidelines consolidate recommendations from log analysis of 32 task execution logs. For detailed patterns, see:
- `dev-server-port-detection` skill
- `phaser-test-seam-patterns` skill
- `task-verification-workflow` skill
- `browser-automation-reliability` skill
- `loop-detection-prevention` skill
- `error-recovery-patterns` skill
- Other specialized skills as needed
