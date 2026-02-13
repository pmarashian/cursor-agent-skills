# Common TypeScript Errors

## Syntax Errors

### Extra/Missing Braces

**Error**: `Expected '}'` or `Unexpected token`

**Common causes**:
- Missing closing brace
- Extra opening brace
- Mismatched parentheses

**Solution**: Check brace matching, use IDE to highlight matching braces

### Semicolon Issues

**Error**: `Expected ';'` or `Unexpected token`

**Solution**: Check for missing semicolons (if project uses them)

## Method Name Mismatches

### Method Doesn't Exist

**Error**: `Property 'methodName' does not exist on type`

**Common causes**:
- Typo in method name
- Method name changed but not updated everywhere
- Wrong object/class reference

**Solution**: 
- Check actual method name in source code
- Use IDE autocomplete to verify
- Search codebase for method definition

### Example

```typescript
// Wrong
this.updateTimerDisplay();

// Correct (check actual method name)
this.updateTimer();
```

## Type Mismatches

### Interface Compatibility

**Error**: `Type 'X' is not assignable to type 'Y'`

**Common causes**:
- Property types don't match
- Missing required properties
- Extra properties not in interface

**Solution**: 
- Verify interface definition
- Check property types match
- Ensure all required properties present

### Example

```typescript
interface GameState {
  score: number;
  level: number;
}

// Wrong
const state: GameState = {
  score: "100",  // string, not number
  level: 1
};

// Correct
const state: GameState = {
  score: 100,  // number
  level: 1
};
```

## Import Path Errors

### Module Not Found

**Error**: `Cannot find module './path/to/module'`

**Common causes**:
- Wrong relative path
- File doesn't exist
- Missing file extension (if required)

**Solution**: 
- Use relative paths from current file
- Verify file exists
- Check path spelling

### Example

```typescript
// Wrong
import { GameState } from '../game-state';

// Correct (check actual path)
import { GameState } from './types/GameState';
```

## Best Practices to Avoid Errors

1. **Check method names** in source code before using
2. **Verify interface compatibility** before assignment
3. **Use relative paths** for imports
4. **Check brace matching** after edits
5. **Run compilation check** immediately after edits
