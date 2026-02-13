---
name: typescript-incremental-check
description: Fast TypeScript error detection patterns and best practices for immediate compilation verification. Use immediately after code edits, before proceeding to testing, or when TypeScript errors are discovered late. Run npx tsc --noEmit immediately after edits to catch errors early.
---

# TypeScript Incremental Check

## Overview

Catch TypeScript errors immediately after code edits. Don't wait until end of task to check compilation.

## Immediate Verification

**Run `npx tsc --noEmit` immediately after code edits**

**Critical**: Check TypeScript compilation **BEFORE** proceeding to testing or browser automation.

**Workflow**:
1. Make code edit
2. Run `npx tsc --noEmit` **immediately**
3. Fix any errors
4. Continue with next edit or testing

**Workflow Timing**:
- **After file edits**: Run check immediately
- **Before browser testing**: Run check first
- **Before running tests**: Run check first
- **Before marking complete**: Run check to verify

**Don't wait** until end of task to check compilation - catch errors early.

### Run from correct package directory

- Run `npx tsc --noEmit` from the **correct package directory** (e.g. `cd backend && npx tsc --noEmit` or use `--project backend/tsconfig.json` from repo root). Do not assume shell CWD from a previous command.
- **Do not run tsc** until a TypeScript/Next.js project exists (e.g. after create-next-app). Use presence of `tsconfig.json` or `next.config` to decide.
- **After a successful tsc in the same turn**, do not run it again unless source files were changed in between.

## Quick Check Script

Use `scripts/check-ts.sh` for quick TypeScript compilation check:

```bash
./scripts/check-ts.sh
```

## Common Errors to Prevent

See `references/common-errors.md` for detailed error patterns:

- Syntax errors (extra/missing braces)
- Method name mismatches (check actual method names)
- Type mismatches (verify interface compatibility)
- Import path errors (use relative paths)

## Common Error Patterns and Quick Fixes

### Syntax Errors

**Pattern**: Missing/extra braces, parentheses, semicolons
**Quick fix**: Check for balanced brackets, verify semicolons

```typescript
// ❌ Missing closing brace
if (condition) {
  doSomething();

// ✅ Fixed
if (condition) {
  doSomething();
}
```

### Method Name Mismatches

**Pattern**: Calling method that doesn't exist or wrong name
**Quick fix**: Check actual method names in source code

```typescript
// ❌ Wrong method name
scene.restartGame();

// ✅ Correct method name
scene.restart();
```

### Type Mismatches

**Pattern**: Type doesn't match expected interface
**Quick fix**: Verify interface compatibility, check actual types

```typescript
// ❌ Type mismatch
const score: number = gameState.score; // gameState.score is string

// ✅ Fixed
const score: number = parseInt(gameState.score);
```

### Import Path Errors

**Pattern**: Import path doesn't resolve
**Quick fix**: Use relative paths, check file existence

```typescript
// ❌ Wrong path
import { GameState } from '@/types/GameState';

// ✅ Correct relative path
import { GameState } from '../types/GameState';
```

## Strict Mode Handling

**When strict mode is enabled**:
- Null/undefined checks required
- No implicit any types
- Stricter type checking

**Patterns**:
```typescript
// Strict mode requires null checks
if (this.player) {
  this.player.update();
}

// Use optional chaining
this.player?.update();

// Use type guards
if (value !== null && value !== undefined) {
  // value is now non-null
}
```

## Type Definition Patterns

### Test Seam Type Definitions

```typescript
// Extend Window interface for test seam
declare global {
  interface Window {
    __TEST__?: {
      ready: boolean;
      sceneKey: string | null;
      gameState: () => any;
      commands: {
        [key: string]: (...args: any[]) => void;
      };
    };
  }
}
```

### Window Extensions

```typescript
// Extend Window for game access
declare global {
  interface Window {
    game?: Phaser.Game;
  }
}
```

## Best Practices

- Use smaller, incremental edits
- Verify compilation after each logical change
- Check method names in source code before using
- Use IDE/linter for real-time error detection if available
- Don't wait until end of task to check compilation

## Early Type Checking Workflow

**Run type-check immediately after code changes:**

```bash
# Pattern: Run type-check immediately after code changes
# 1. Make code changes
edit_file("src/scenes/GameScene.ts", ...)

# 2. Run type-check immediately
npx tsc --noEmit

# 3. Fix errors before extensive testing
# 4. Re-check after fixes
```

**Fix errors before extensive testing:**

```bash
# ❌ WRONG: Test first, then check types
# Make changes
# Run tests
# Discover type errors
# Fix types
# Re-test

# ✅ CORRECT: Check types first
# Make changes
# Run type-check immediately
# Fix types
# Then test
```

**Re-check after fixes:**

```bash
# After fixing errors, re-check
npx tsc --noEmit

# If passes, continue with testing
# If errors remain, fix before proceeding
```

## Export/Import Validation

**Validate exports before imports:**

```bash
# Before importing, check export exists
grep -r "export.*functionName" src/

# Check all exports in file
grep -r "^export" src/utils.ts
```

**Check import/export consistency:**

```typescript
// In source file (utils.ts)
export function myFunction() { }

// In importing file
import { myFunction } from './utils'; // ✅ Matches export

// ❌ WRONG: Import doesn't match export
import { myOtherFunction } from './utils'; // Error: doesn't exist
```

**Use tsc --noEmit for quick validation:**

```bash
# Quick validation without building
npx tsc --noEmit

# Faster than full build, catches type errors immediately
```

**Fix before full build:**

```bash
# ✅ CORRECT: Fix types before building
npx tsc --noEmit  # Quick check
# Fix errors
npm run build     # Full build

# ❌ WRONG: Build first, then fix types
npm run build     # Fails with type errors
# Fix types
npm run build     # Rebuild
```

## Common Error Patterns

**Missing exports:**

```typescript
// ❌ WRONG: Function not exported
function myFunction() { }

// ✅ CORRECT: Export function
export function myFunction() { }
```

**Type conflicts (Settings class vs type):**

```typescript
// ❌ WRONG: Class and type with same name
class Settings { }
type Settings = { }; // Error: Duplicate identifier

// ✅ CORRECT: Use distinct names
class Settings { }
type SettingsData = { };
```

**Property initialization issues:**

```typescript
// ❌ WRONG: Uninitialized property
class GameScene {
  private player: Player; // Error: No initializer
}

// ✅ CORRECT: Initialize in constructor
class GameScene {
  private player: Player;
  constructor() {
    this.player = new Player();
  }
}
```

**Global type extensions:**

```typescript
// ✅ CORRECT: Declare Window extension
declare global {
  interface Window {
    __TEST__?: {
      ready: boolean;
      sceneKey: string | null;
    };
  }
}
```

## Workflow Integration

### Immediate Type Checking

**After code changes:**

```bash
# 1. Make code edit
edit_file("src/scenes/GameScene.ts", ...)

# 2. Run type-check immediately
npx tsc --noEmit

# 3. Fix errors if any
# 4. Continue with next edit
```

### Before Testing

**Always check types before testing:**

```bash
# Before browser testing
npx tsc --noEmit && agent-browser open http://localhost:3000

# Before running tests
npx tsc --noEmit && npm test
```

### Before Completion

**Verify types before marking complete:**

```bash
# Final type check
npx tsc --noEmit

# If passes, proceed with completion
```

## Integration with Other Skills

- **typescript-type-safety**: Complements with type definition patterns
- **pre-implementation-check**: Validates types before implementation
- **task-verification-workflow**: Includes type checking in verification

## Resources

- `scripts/check-ts.sh` - Quick TypeScript compilation check script
- `references/common-errors.md` - Syntax errors, method name mismatches, type mismatches
