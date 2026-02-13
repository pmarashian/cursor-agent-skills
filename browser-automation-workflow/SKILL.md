---
name: browser-automation-workflow
description: Comprehensive guide to agent-browser usage patterns, test seam planning workflow, browser testing optimization patterns, and when to use agent-browser vs alternatives. Use when working with web applications, frontend tasks, or when development servers are running.
---

# Browser Automation Workflow

This skill provides comprehensive guidance on using agent-browser for web application testing, test seam planning, and browser testing optimization.

## Overview

**CRITICAL: Load the `agent-browser` skill first before using browser automation tools.** Search for it using `search_skills("agent-browser")` or `search_skills("browser")` and then load it with `load_skill("agent-browser")` to get complete instructions and best practices.

## When to Use agent-browser

**Use agent-browser when:**

- Working with web applications
- A development server is running (e.g., "server is running on port 5174", "dev server started on http://localhost:3000")
- You need to test or verify web application functionality in a browser
- **agent-browser is the preferred method for browser testing and verification** - prefer using agent-browser over creating test scripts for browser interaction

## Core Workflow

### Basic Workflow

1. **Load the skill**: `load_skill("agent-browser")` (after searching for it if needed)
2. **Open page**: `agent-browser open <url>` - Navigate to page
3. **Get interactive elements**: `agent-browser snapshot -i` - Get interactive elements with refs (@e1, @e2)
4. **Interact**: `agent-browser click @e1` / `fill @e2 "text"` - Interact using refs
5. **Re-snapshot**: After page changes, take another snapshot to get updated element refs

### Mandatory Skill Loading

**MANDATORY: Always load the `agent-browser` skill for web applications.** Before starting ANY work on web applications, frontend tasks, or when you see development servers running, execute these commands IMMEDIATELY:

```javascript
// Load browser testing skill
load_skill("agent-browser");

// MANDATORY: Load screenshot-handling skill if screenshots will be captured
// This is REQUIRED, not optional - screenshots MUST go to screenshots/ folder
load_skill("screenshot-handling");
```

**Use agent-browser for ALL verification steps that require browser interaction.** Do NOT skip browser testing - it is mandatory for web application tasks.

### Screenshot Handling

**CRITICAL: When capturing screenshots, ALWAYS use the `screenshot-handling` skill and save to `screenshots/` folder.** See the screenshot-handling skill for mandatory requirements.

## Test Seam Planning Workflow

**CRITICAL: Plan test seams before implementation**

Before starting implementation:

1. **Review task requirements** - Understand what needs to be tested
2. **Identify testing needs** - Determine what functionality requires verification
3. **Check existing test seam commands** - Review codebase for existing test seams
4. **Plan additional test seam commands** - Determine what new test seams are needed
5. **Implement feature + test seam commands together** - Build both simultaneously
6. **Build once** - Compile/build the application
7. **Test comprehensively** - Run all tests using test seams

### Benefits of Test Seam Planning

This prevents:

- Multiple rebuild cycles
- Mid-testing code changes
- Incomplete test coverage
- Wasted time on redundant builds

### Test Seam Readiness

**Efficient test seam checking:**

- Check `window.**TEST**?.sceneKey` directly
- Avoid Promise-based polling for readiness
- Use `Object.keys(window.**TEST**.commands)` for verification
- Use simple property checks instead of Promise polling

## Browser Testing Optimization

**Optimize browser testing to reduce overhead by 40-50%:**

### 1. Use Test Seams Efficiently

- Create composite test functions for common flows
- Batch independent checks with Promise.all()
- Use simple property checks instead of Promise polling

### 2. Command Batching

- Group related verifications in single calls
- Use test seam composite functions when available
- Reduce wait times between commands

### 3. Cache Management

- Always use hard refresh in development
- Clear cache before testing code changes
- Use cache-busting URL parameters when needed

### 4. Snapshot Strategy

- Take snapshots only when page state changes
- Re-use element refs when possible
- Don't snapshot unnecessarily between interactions

## Quality Assurance Requirement

**Never mark a task complete without demonstrating working functionality.** You MUST:

- Run the application and verify it works
- Test core user flows in the actual environment
- Check for console errors and runtime issues
- Verify UI/UX matches specifications
- Only mark complete after functional verification, not just code completion
- Verify TypeScript compilation succeeds without errors for any TypeScript code

## Integration with Other Skills

This skill works with:

- **screenshot-handling**: For proper screenshot file management (MANDATORY when capturing screenshots)
- **typescript-incremental-check**: For TypeScript validation after changes
- **task-verification-workflow**: For comprehensive task verification
- **error-recovery-patterns**: For handling browser automation failures

## Common Patterns

### Pattern 1: Page Navigation and Verification

```bash
# Open page
agent-browser open http://localhost:3000

# Get interactive elements
agent-browser snapshot -i

# Interact with elements
agent-browser click @e1
agent-browser fill @e2 "test input"

# Verify changes
agent-browser snapshot -i
```

### Pattern 2: Test Seam Integration

```javascript
// Check test seam readiness
if (window.**TEST**?.sceneKey) {
  // Use test seam commands
  window.**TEST**.commands.verifyState();
}
```

### Pattern 3: Error Handling

If browser automation fails:
- Use fallback testing methods (manual browser, unit tests, console verification)
- Document verification method used
- Never mark complete without functional verification

## Troubleshooting

### Common Issues

1. **Element not found**: Re-snapshot after page changes
2. **Stale element refs**: Take new snapshot to get fresh refs
3. **Cache issues**: Use hard refresh or cache-busting parameters
4. **Port conflicts**: Check if dev server is running on expected port

### Fallback Strategies

If primary testing tool fails:
- Use manual browser testing with checklist
- Run unit tests if available
- Verify console output for errors
- Document verification method used
