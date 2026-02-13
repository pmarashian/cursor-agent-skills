---
name: typescript-type-safety
description: Patterns for avoiding common TypeScript errors, proper type definitions, and early type checking workflows. Use when writing TypeScript code, encountering type errors, or before running tests. Prevents 50-60% of compilation errors and reduces fix cycles from 3-5 to 1-2.
---

# TypeScript Type Safety

Patterns for avoiding common TypeScript errors, proper type definitions, and early type checking workflows. Prevents 50-60% of compilation errors.

## Overview

**Problem**: TypeScript errors discovered late, requiring 3-5 fix cycles

**Solution**: Early type checking, proper type definitions, and systematic error prevention

**Impact**: Reduce fix cycles from 3-5 to 1-2, save 30-60 seconds per task

## Early Type Checking Workflow

### Immediate Validation

**Run type-check immediately after code changes:**

```bash
# After making ANY TypeScript changes
npx tsc --noEmit

# Or use npm script
npm run type-check
```

**Workflow:**
1. Make code edit
2. Run `npx tsc --noEmit` **immediately**
3. Fix any errors
4. Continue with next edit or testing

**Timing:**
- **After file edits**: Run check immediately
- **Before browser testing**: Run check first
- **Before running tests**: Run check first
- **Before marking complete**: Run check to verify

## Common Error Patterns

### Pattern 1: Export/Import Validation

**Problem**: Missing exports for imported functions

**Solution**: Validate exports before imports

```typescript
// ❌ WRONG: Import without checking export
import { someFunction } from './utils';
// Error: Module has no exported member 'someFunction'

// ✅ CORRECT: Check export exists
// In utils.ts
export function someFunction() { }

// Then import
import { someFunction } from './utils';
```

**Validation pattern:**
```bash
# Before importing, check export exists
grep -r "export.*someFunction" src/
```

### Pattern 2: Type Conflicts

**Problem**: Type conflicts (class vs type names)

**Solution**: Use distinct names or proper type definitions

```typescript
// ❌ WRONG: Class and type with same name
class Settings { }
type Settings = { }; // Error: Duplicate identifier

// ✅ CORRECT: Use distinct names
class Settings { }
type SettingsData = { };

// Or use interface
interface SettingsData { }
```

### Pattern 3: Property Initialization

**Problem**: Property initialization in constructors

**Solution**: Initialize in constructor or mark as optional

```typescript
// ❌ WRONG: Uninitialized property
class GameScene {
  private player: Player; // Error: Property 'player' has no initializer
}

// ✅ CORRECT: Initialize in constructor
class GameScene {
  private player: Player;
  
  constructor() {
    this.player = new Player();
  }
}

// Or mark as optional
class GameScene {
  private player?: Player;
}
```

### Pattern 4: Global Type Extensions

**Problem**: Window extensions not typed

**Solution**: Declare global type extensions

```typescript
// ✅ CORRECT: Declare Window extension
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

## Type Definition Patterns

### Global Type Extensions

**Window interface extensions:**

```typescript
declare global {
  interface Window {
    __TEST__?: {
      ready: boolean;
      sceneKey: string | null;
      seed: number | null;
      gameState: () => GameState;
      commands: TestCommands;
    };
    game?: Phaser.Game;
  }
}
```

### Union Types

**Flexible object types:**

```typescript
// Union type for flexible objects
type SpriteOrRectangle = Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;

function handleObject(obj: SpriteOrRectangle) {
  if (obj instanceof Phaser.GameObjects.Sprite) {
    // Sprite-specific code
  } else {
    // Rectangle-specific code
  }
}
```

### Discriminated Unions

**Better type safety with discriminated unions:**

```typescript
type GameEvent = 
  | { type: 'coin_collected'; value: number }
  | { type: 'timer_expired' }
  | { type: 'level_complete'; level: number };

function handleEvent(event: GameEvent) {
  switch (event.type) {
    case 'coin_collected':
      // event.value is available
      break;
    case 'timer_expired':
      // event.value is not available
      break;
    case 'level_complete':
      // event.level is available
      break;
  }
}
```

## Property Initialization Patterns

### Constructor Initialization

**Initialize all properties in constructor:**

```typescript
class GameScene extends Phaser.Scene {
  private player: Player;
  private score: number;
  private timer: number;

  constructor() {
    super({ key: 'GameScene' });
    // Initialize all properties
    this.player = new Player();
    this.score = 0;
    this.timer = 60;
  }
}
```

### Optional Properties

**Mark properties as optional if not initialized:**

```typescript
class GameScene extends Phaser.Scene {
  private player?: Player;
  private enemies?: Phaser.Physics.Arcade.Group;

  create() {
    // Initialize when needed
    this.player = new Player();
    this.enemies = this.physics.add.group();
  }
}
```

### Definite Assignment Assertion

**Use ! when property is definitely assigned later:**

```typescript
class GameScene extends Phaser.Scene {
  private player!: Player; // Definite assignment assertion

  create() {
    this.player = new Player(); // Assigned in create()
  }
}
```

## Export/Import Validation

### Check Exports Before Imports

**Validate exports exist:**

```bash
# Check if export exists
grep -r "export.*functionName" src/

# Check all exports in file
grep -r "^export" src/utils.ts
```

### Consistent Export Patterns

**Use consistent export patterns:**

```typescript
// ✅ CORRECT: Named export
export function utilityFunction() { }

// ✅ CORRECT: Default export
export default class MyClass { }

// ✅ CORRECT: Export list
export { function1, function2, class1 };

// ❌ WRONG: Mixing patterns inconsistently
export function func1() { }
export default function func2() { } // Confusing
```

## Common Error Fixes

### Missing Exports

**Error**: `Module has no exported member 'X'`

**Fix**:
1. Check if export exists in source file
2. Add export if missing
3. Verify export name matches import

```typescript
// In source file
export function myFunction() { }

// In importing file
import { myFunction } from './source';
```

### Type Conflicts

**Error**: `Duplicate identifier 'X'`

**Fix**:
1. Rename one of the conflicting types
2. Use namespace to separate
3. Use distinct names

```typescript
// Fix: Use distinct names
class Settings { }
type SettingsData = { };
```

### Property Initialization

**Error**: `Property 'X' has no initializer`

**Fix**:
1. Initialize in constructor
2. Mark as optional
3. Use definite assignment assertion

```typescript
// Fix 1: Initialize in constructor
constructor() {
  this.property = value;
}

// Fix 2: Mark as optional
private property?: Type;

// Fix 3: Definite assignment
private property!: Type;
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

## Best Practices

1. **Run type-check immediately** after code changes
2. **Fix errors systematically** (one type at a time)
3. **Validate exports** before importing
4. **Use proper type definitions** (global extensions, union types)
5. **Initialize properties** in constructor or mark optional
6. **Use discriminated unions** for better type safety
7. **Check types before testing** or marking complete

## Integration with Other Skills

- **typescript-incremental-check**: Uses early type checking workflow
- **pre-implementation-check**: Validates types before implementation
- **task-verification-workflow**: Includes type checking in verification

## Related Skills

- `typescript-incremental-check` - Fast type checking patterns
- `pre-implementation-check` - Pre-task verification
- `task-verification-workflow` - Task completion verification

## Remember

1. **Check types immediately** after code changes
2. **Fix errors systematically** before proceeding
3. **Validate exports** before importing
4. **Use proper type definitions** for global extensions
5. **Initialize properties** correctly
6. **Prevent 50-60%** of compilation errors
