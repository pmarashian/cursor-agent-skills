---
name: browser-automation-reliability
description: Patterns for reliable browser automation, including timeout handling, retry logic, and fallback strategies. Use when browser automation commands hang, timeout, or fail. Provides configurable timeouts, exponential backoff retry logic, and fallback verification methods for Phaser games and web applications.
---

# Browser Automation Reliability

## Overview

Improve browser automation reliability with timeout handling, retry logic, and fallback strategies. Prevents hanging commands and abandoned testing.

## Timeout Handling

**Default timeout**: 10 seconds for all commands

**Configurable per command type**:
- Text search: 10s
- Element interaction: 10s
- Navigation: 15s
- Test seam commands: 5s

See `references/timeout-patterns.md` for detailed timeout configuration.

## Retry Logic

**Retry failed commands up to 3 times** with exponential backoff:
- First retry: 1 second delay
- Second retry: 2 second delay
- Third retry: 4 second delay

See `references/retry-strategies.md` for retry implementation patterns.

## Fallback Strategies

Use fallback methods in order when primary method fails:

1. **Primary**: Test seam commands** (for Phaser games)
2. **Secondary**: Console log verification
3. **Tertiary**: Screenshot comparison
4. **Last resort**: Code review + TypeScript compilation

See `references/fallback-order.md` for detailed fallback workflow.

## Phaser Game Testing

**PRIMARY METHOD**: Use test seam commands (`window.__TEST__.commands`)

**Why**: 
- DOM text search doesn't work with canvas-rendered text
- Keyboard events may not register with canvas focus
- Test seams are reliable and fast

**Pattern**:
```javascript
// Check for test seam first
if (window.__TEST__ && window.__TEST__.commands) {
  window.__TEST__.commands.clickStartGame();
} else {
  // Fallback to other methods
}
```

## Common Issues

- **Phaser canvas doesn't respond to DOM-based text search**
  - Solution: Use test seam commands
  
- **Keyboard events may not register with canvas focus**
  - Solution: Use test seam commands or verify focus first
  
- **Scene transitions require wait time**
  - Solution: Wait 1-2 seconds after transition
  
- **Test seam may lag behind actual scene state**
  - Solution: Use console logs as fallback

## Best Practices

1. **Always have a fallback verification method**
2. **Don't abandon testing on first failure**
3. **Use test seams as primary method for game testing**
4. **Document fallback strategies in progress.txt**
5. **Set explicit timeouts for all commands**

## Resources

- `references/timeout-patterns.md` - Configurable timeouts, exponential backoff
- `references/retry-strategies.md` - Retry logic with logging
- `references/fallback-order.md` - Primary → Secondary → Tertiary → Last resort
