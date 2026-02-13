---
name: timer-testing-patterns
description: Efficient patterns for testing time-based game features, including timer manipulation and countdown verification. Use when testing timer functionality, countdown features, or time-based game mechanics. Never wait for natural countdown - use test seam setTimer() commands instead.
---

# Timer Testing Patterns

## Overview

Efficiently test timer functionality without waiting for natural countdown. Use test seam commands to manipulate timers directly.

## Timer Manipulation

**Use test seam commands**:
- `setTimer(seconds)` - Set timer to specific value
- `fastForwardTimer(seconds)` - Decrease timer by specified amount
- `triggerGameOver()` - Force game over condition

See `references/timer-commands.md` for detailed command usage.

## Testing Workflow

1. Use test seam to set timer to low value (e.g., 3 seconds)
2. Start game
3. Wait for timer to expire
4. Verify game over/level complete behavior
5. Test boundary conditions (9, 10, 11 seconds for color changes)

## Avoid Natural Countdown

**Never wait for natural countdown** (e.g., 60 seconds)

**Always use timer manipulation** for testing:
- Set timer to low value for quick testing
- Test boundary conditions efficiently
- Verify both positive (timer works) and negative (timer expires) cases

## Test Seam Implementation

See `references/test-seam-implementation.md` for code examples of adding timer commands to test seam.

## Resources

- `references/timer-commands.md` - setTimer(), fastForwardTimer(), triggerGameOver()
- `references/test-seam-implementation.md` - Code examples for adding timer commands
