# Timer Commands

## setTimer(seconds)

Set timer to specific value:

```javascript
window.__TEST__.commands.setTimer(5); // Set to 5 seconds
```

**Use when**: Testing timer expiration, boundary conditions

**Example**:
```javascript
// Test timer expiration
window.__TEST__.commands.setTimer(3);
// Wait 3+ seconds
// Verify game over triggered
```

## fastForwardTimer(seconds)

Decrease timer by specified amount:

```javascript
window.__TEST__.commands.fastForwardTimer(10); // Subtract 10 seconds
```

**Use when**: Testing timer countdown, intermediate states

**Example**:
```javascript
// Test timer at 50 seconds
window.__TEST__.commands.setTimer(60);
window.__TEST__.commands.fastForwardTimer(10);
// Timer now at 50 seconds
```

## triggerGameOver()

Force game over condition:

```javascript
window.__TEST__.commands.triggerGameOver();
```

**Use when**: Testing game over behavior without waiting for timer

**Example**:
```javascript
// Test game over screen
window.__TEST__.commands.triggerGameOver();
// Verify game over scene displayed
```

## Boundary Condition Testing

Test color changes or other boundary conditions:

```javascript
// Test at 9 seconds (before color change)
window.__TEST__.commands.setTimer(9);
// Verify color

// Test at 10 seconds (at boundary)
window.__TEST__.commands.setTimer(10);
// Verify color change

// Test at 11 seconds (after color change)
window.__TEST__.commands.setTimer(11);
// Verify color
```

## Best Practices

- Use `setTimer()` for direct value setting
- Use `fastForwardTimer()` for incremental testing
- Test boundary conditions (9, 10, 11 seconds)
- Never wait for natural countdown
- Test both positive and negative cases
