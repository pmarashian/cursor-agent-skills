---
name: error-recovery-patterns
description: Document common error types, provide recovery strategies, retry patterns with limits, and fallback strategies. Use when encountering compilation errors, test failures, tool failures, or other execution errors. Provides systematic approach to error handling and recovery.
---

# Error Recovery Patterns

## Overview

Systematic approach to handling and recovering from common errors during task execution. Provides recovery strategies, retry patterns, and fallback approaches for different error types.

## Common Error Types

### 1. Compilation Errors

**Symptoms**:
- TypeScript compilation fails
- Syntax errors (missing braces, semicolons)
- Type mismatches
- Import path errors
- Method name mismatches

**Recovery Strategy**:
1. **Read error message carefully**: Understand what's wrong
2. **Fix syntax/type errors immediately**: Don't proceed with broken code
3. **Re-run compilation check**: `npx tsc --noEmit`
4. **If errors persist**: Check for missing imports or type definitions

**Common Patterns**:
- **Syntax errors**: Check for missing/extra braces, parentheses, semicolons
- **Type mismatches**: Verify interface compatibility, check actual types
- **Import errors**: Use relative paths, check file existence
- **Method name mismatches**: Check actual method names in source code

**When to skip**: Never skip compilation errors - must fix before proceeding

### 2. Test Failures

**Symptoms**:
- Tests fail with assertion errors
- Tests timeout
- Tests are flaky (pass/fail intermittently)
- Test setup/teardown fails

**Recovery Strategy**:
1. **Read test output**: Understand what failed and why
2. **Classify failure**: Is test flaky or code broken?
3. **Fix code if broken**: Update implementation to match test expectations
4. **Skip test if flaky**: Document why test was skipped
5. **Re-run tests**: Verify fix or skip

**Common Patterns**:
- **Assertion failures**: Code doesn't match test expectations
- **Timeouts**: Test takes too long (increase timeout or optimize code)
- **Flaky tests**: Non-deterministic behavior (seed RNG, fix timing)
- **Setup failures**: Test environment not configured correctly

**When to skip**: Only skip if test is flaky and not critical for task

### 3. Tool Failures

**Symptoms**:
- API errors (401, 403, 500)
- Network timeouts
- Invalid credentials
- Tool unavailable
- Rate limiting

**Recovery Strategy**:
1. **Check error message**: Understand root cause
2. **If API key missing/invalid**: Skip tool usage (don't retry)
3. **If network timeout**: Retry with exponential backoff (max 3 times)
4. **If tool unavailable**: Use alternative approach
5. **Document fallback**: Explain why alternative was used

**Common Patterns**:
- **API errors**: Check credentials, verify API key, check rate limits
- **Network timeouts**: Retry with delays, check network connectivity
- **Tool unavailable**: Service down, use alternative tool
- **Rate limiting**: Wait and retry, or use alternative approach

**When to skip**: Skip if tool consistently failing or not critical

### 4. Browser Testing Failures

**Symptoms**:
- Browser commands timeout
- Elements not found
- Test seam unavailable
- Scene navigation fails

**Recovery Strategy**:
1. **Check timeout**: Increase timeout or use polling
2. **Verify element exists**: Check DOM, wait for element
3. **Check test seam**: Verify `window.__TEST__` is available
4. **Use fallback**: Console logs, screenshots, code review

**Common Patterns**:
- **Timeouts**: Increase timeout, use polling instead of fixed wait
- **Element not found**: Wait for element, check selector
- **Test seam unavailable**: Check scene initialization, wait for ready
- **Navigation fails**: Verify scene key, check scene registration

**When to skip**: Skip if browser testing not critical, use code review instead

## Retry Patterns with Limits

### Exponential Backoff

**Pattern**:
- **First retry**: 1 second delay
- **Second retry**: 2 second delay
- **Third retry**: 4 second delay
- **After 3 retries**: Skip and use alternative

**When to use**:
- Transient failures (timeouts, network issues)
- Likely to succeed on retry
- No alternative available

**When NOT to use**:
- API key errors (won't succeed on retry)
- Tool unavailable (service down)
- Invalid credentials (won't succeed on retry)

### Retry Limits

**Maximum retries**: 3 attempts

**After 3 retries**:
1. Skip tool/step
2. Use alternative approach
3. Document why skipped

## Fallback Strategies

### Strategy 1: Use Alternative Tool

**When primary tool fails**:
- Use different tool with same functionality
- Example: `agent-browser` fails → use code review + compilation check

**Pattern**:
1. Identify alternative tool
2. Try alternative
3. If alternative works, continue
4. If alternative fails, try next fallback

### Strategy 2: Graceful Degradation

**When cost-incurring tool fails**:
- Use free alternative
- Example: ElevenLabs TTS fails → use console.log for verification

**Pattern**:
1. Check if free alternative exists
2. Use free alternative
3. Document why alternative was used

### Strategy 3: Skip Non-Critical Steps

**When step is not critical**:
- Skip step and continue
- Document why skipped
- Example: Visual verification skipped → use code review

**Pattern**:
1. Verify step is not critical
2. Skip step
3. Document why skipped
4. Continue with remaining steps

### Strategy 4: Code Review + Compilation Check

**When browser testing fails**:
- Use code review to verify implementation
- Run TypeScript compilation check
- Verify logic matches requirements

**Pattern**:
1. Review code changes
2. Run `npx tsc --noEmit`
3. Verify logic matches requirements
4. Document verification method

## Error Classification

### Critical Errors (Must Fix)

- **Compilation errors**: Code won't run
- **Type errors**: Type safety violated
- **Syntax errors**: Code invalid

**Action**: Fix immediately, don't proceed

### Non-Critical Errors (Can Skip)

- **Visual verification**: Can use code review
- **Optional features**: Not required for task
- **Cost-incurring tools**: Can use free alternatives

**Action**: Skip if alternative available

### Transient Errors (Retry)

- **Network timeouts**: Likely to succeed on retry
- **Rate limiting**: Wait and retry
- **Temporary service issues**: Retry with backoff

**Action**: Retry with exponential backoff (max 3 times)

## Recovery Workflow

### Step 1: Classify Error

1. **Read error message**: Understand what failed
2. **Identify error type**: Compilation, test, tool, browser
3. **Determine severity**: Critical, non-critical, transient

### Step 2: Choose Recovery Strategy

1. **Critical errors**: Fix immediately
2. **Non-critical errors**: Skip if alternative available
3. **Transient errors**: Retry with backoff

### Step 3: Execute Recovery

1. **Fix errors**: Update code, fix syntax, correct types
2. **Retry with backoff**: Wait and retry (max 3 times)
3. **Use alternative**: Switch to different tool/approach
4. **Skip step**: Document why skipped

### Step 4: Verify Recovery

1. **Re-run checks**: Compilation, tests, verification
2. **Verify fix**: Confirm error is resolved
3. **Document recovery**: Explain what was done

## Best Practices

1. **Fix errors immediately**: Don't accumulate errors
2. **Use retries wisely**: Only for transient failures
3. **Have fallback strategies**: Always know alternative approach
4. **Document recoveries**: Explain why alternative was used
5. **Don't retry forever**: Set limits (max 3 retries)

## Resources

- `agent-workflow-guidelines` skill - General workflow guidelines
- `loop-detection-prevention` skill - Prevent infinite retry loops
- `typescript-incremental-check` skill - TypeScript error patterns
