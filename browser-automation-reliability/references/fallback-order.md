# Fallback Order

When primary verification method fails, try alternatives in this order:

## 1. Primary: Test Seam Commands (Phaser Games)

**When to use**: Testing Phaser games, canvas-rendered content

**Method**: Use `window.__TEST__.commands` directly

**Example**:
```javascript
window.__TEST__.commands.clickStartGame();
window.__TEST__.commands.setTimer(5);
```

**Why**: Most reliable for Phaser games, fast, deterministic

## 2. Secondary: Console Log Verification

**When to use**: Need to check internal state, UI verification fails

**Method**: Check browser console for logged information

**Example**:
```typescript
// In code
console.log('Scene:', this.scene.key);
console.log('Game state:', this.gameState);
```

**Why**: Reliable, doesn't depend on UI rendering

## 3. Tertiary: Screenshot Comparison

**When to use**: Visual verification needed, other methods fail

**Method**: Take screenshots, compare visually or programmatically

**Limitations**: May not catch functional issues, slower

## 4. Last Resort: Code Review + TypeScript Compilation

**When to use**: All other methods fail

**Method**: 
- Review code changes
- Verify logic is correct
- Run `npx tsc --noEmit`
- Ensure all success criteria addressed in code

**Limitations**: Doesn't verify runtime behavior

## Decision Tree

```
Primary method fails?
  ├─ Is it a Phaser game?
  │   ├─ Yes → Try test seam commands
  │   └─ No → Try console logs
  │
  ├─ Console logs available?
  │   ├─ Yes → Use console logs
  │   └─ No → Try screenshot
  │
  └─ Screenshot comparison possible?
      ├─ Yes → Use screenshot
      └─ No → Code review + TypeScript compilation
```

## Documenting Fallback Usage

Always document which fallback method was used in progress.txt:

```
Verification Method: Test seam commands (primary method failed)
Reason: Browser automation timeout
Result: Successfully verified via window.__TEST__.commands.setTimer(5)
```
