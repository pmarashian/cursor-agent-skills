# Fallback Verification Strategies

When primary verification methods fail, use these alternatives in order:

## 1. Test Seam Commands (Phaser Games)

**When to use**: Browser automation fails, DOM interactions don't work

**Method**: Use `window.__TEST__.commands` directly in browser console

**Example**:
```javascript
// In browser console
window.__TEST__.commands.clickStartGame();
window.__TEST__.commands.setTimer(5);
```

## 2. Console Log Verification

**When to use**: Can't verify via UI, need to check internal state

**Method**: Add console.log statements, check browser console

**Example**:
```typescript
// In code
console.log('Scene transitioned to:', this.scene.key);
console.log('Game state:', this.gameState);
```

## 3. Screenshot Comparison

**When to use**: Visual verification needed, automation fails

**Method**: Take screenshots, compare visually or programmatically

**Limitations**: May not catch functional issues

## 4. Code Review

**When to use**: All other methods fail, need to verify logic

**Method**: Review code changes, verify:
- Logic is correct
- All success criteria addressed in code
- TypeScript compilation passes
- No obvious errors

**Limitations**: Doesn't verify runtime behavior

## 5. TypeScript Compilation

**When to use**: Always, as minimum verification

**Method**: Run `npx tsc --noEmit`

**Verifies**:
- No syntax errors
- No type errors
- Code structure is correct

## Choosing a Fallback

**Priority order**:
1. Test seam commands (for Phaser games)
2. Console log verification
3. Screenshot comparison
4. Code review + TypeScript compilation

**Document choice**: Always note in progress.txt which fallback method was used and why.
