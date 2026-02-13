---
name: refactoring-workflow-optimization
description: Systematic approach to code refactoring with pre-analysis, batch planning, and validation checkpoints. Use when refactoring code to reduce refactoring time by 60-70% and improve first-attempt success rate.
---

# Refactoring Workflow Optimization

## Overview

Systematic approach to code refactoring with pre-analysis, batch planning, and validation checkpoints. Reduces refactoring time and improves first-attempt success rate.

**Problem**: Refactoring tasks show 20+ individual edits when batch operations would be more efficient, TypeScript errors discovered after incomplete refactoring passes, agents miss local constant declarations that shadow class-level constants.

**Solution**: Pre-analysis phase to find ALL occurrences, categorize by type, create refactoring plan with logical batches, validate after each batch.

**Impact**: Reduce refactoring time by 60-70%, improve first-attempt success rate.

## Pre-Analysis Phase

### Step 1: Find ALL Occurrences

**Use grep to find ALL occurrences of the pattern (not just first few):**

```typescript
// ❌ INEFFICIENT: Only finding first few occurrences
grep('TILE_SIZE', 'src/**/*.ts', { head_limit: 10 });

// ✅ EFFICIENT: Find ALL occurrences
grep('TILE_SIZE', 'src/**/*.ts');
// No head_limit - get complete picture
```

### Step 2: Categorize Occurrences

**Categorize occurrences by type and location:**

```typescript
// Categorize findings
const occurrences = {
  declarations: [
    { file: 'GameScene.ts', line: 15, type: 'class constant' },
    { file: 'GameScene.ts', line: 45, type: 'local constant' },
  ],
  usages: [
    { file: 'GameScene.ts', line: 100, context: 'method call' },
    { file: 'MainMenu.ts', line: 50, context: 'property access' },
  ],
  testCode: [
    { file: 'GameScene.test.ts', line: 20, context: 'test setup' },
  ],
  comments: [
    { file: 'GameScene.ts', line: 12, context: 'inline comment' },
  ],
};
```

### Step 3: Identify Shadowing Issues

**Identify local constants that shadow class-level constants:**

```typescript
// Example shadowing issue
class GameScene {
  private static readonly TILE_SIZE = 32; // Class constant
  
  someMethod() {
    const TILE_SIZE = 16; // Local constant shadows class constant
    // This local declaration needs special handling
  }
}

// Identify shadowing
const shadowingIssues = occurrences.declarations.filter(
  occ => occ.type === 'local constant' && 
  hasClassConstant(occ.file, 'TILE_SIZE')
);
```

### Step 4: Create Refactoring Plan

**Create refactoring plan with logical edit batches:**

```typescript
// Refactoring plan with logical batches
const refactoringPlan = {
  batch1: {
    name: 'Class constant declarations',
    files: ['GameScene.ts'],
    edits: [
      { line: 15, change: 'Replace class constant TILE_SIZE with TILE_WIDTH' },
    ],
    validation: 'TypeScript check after batch',
  },
  batch2: {
    name: 'Local constant declarations',
    files: ['GameScene.ts'],
    edits: [
      { line: 45, change: 'Replace local constant TILE_SIZE with TILE_WIDTH' },
    ],
    validation: 'TypeScript check after batch',
  },
  batch3: {
    name: 'Usage sites',
    files: ['GameScene.ts', 'MainMenu.ts'],
    edits: [
      { file: 'GameScene.ts', line: 100, change: 'Update usage' },
      { file: 'MainMenu.ts', line: 50, change: 'Update usage' },
    ],
    validation: 'TypeScript check after batch',
  },
};
```

## Batch Strategy

### Pattern 1: Group Related Edits

**Group related edits (e.g., all TILE_SIZE declarations in one batch):**

```typescript
// ✅ EFFICIENT: Batch all declarations together
const declarations = [
  { file: 'GameScene.ts', line: 15 },
  { file: 'GameScene.ts', line: 45 },
  { file: 'MainMenu.ts', line: 20 },
];

// Batch edit all declarations
for (const decl of declarations) {
  search_replace(decl.file, 'TILE_SIZE', 'TILE_WIDTH', { 
    // Context around line
  });
}

// Then validate once after batch
run_terminal_cmd('npx tsc --noEmit');
```

### Pattern 2: Use Multi-Edit Operations

**Use multi-edit operations when supported by tools:**

```typescript
// ✅ EFFICIENT: Multi-edit operation
search_replace('GameScene.ts', [
  { old: 'TILE_SIZE', new: 'TILE_WIDTH', line: 15 },
  { old: 'TILE_SIZE', new: 'TILE_WIDTH', line: 45 },
  { old: 'TILE_SIZE', new: 'TILE_WIDTH', line: 100 },
]);
```

### Pattern 3: Leverage file-edit-batching Skill

**Coordinate with file-edit-batching skill for effective batching:**

```typescript
// Use file-edit-batching patterns
// 1. Read all related files first
const files = await Promise.all([
  read_file('GameScene.ts'),
  read_file('MainMenu.ts'),
]);

// 2. Identify all changes needed
const changes = analyzeFiles(files);

// 3. Batch independent changes
batchIndependentChanges(changes);

// 4. Keep dependent changes separate
handleDependentChanges(changes);
```

## Validation Checkpoints

### Pattern 1: Validate After Logical Batches

**Run TypeScript check after each logical batch (not after every single edit):**

```typescript
// ✅ CORRECT: Validate after logical batch
// Batch 1: All declarations
editDeclarations();
run_terminal_cmd('npx tsc --noEmit'); // Validate batch 1

// Batch 2: All usages
editUsages();
run_terminal_cmd('npx tsc --noEmit'); // Validate batch 2

// ❌ WRONG: Validate after every edit
editDeclaration1();
run_terminal_cmd('npx tsc --noEmit');
editDeclaration2();
run_terminal_cmd('npx tsc --noEmit');
```

### Pattern 2: Validate Before Testing

**Always validate before starting browser testing phase:**

```typescript
// Complete all refactoring batches
editDeclarations();
editUsages();
editTestCode();

// Validate before testing
run_terminal_cmd('npx tsc --noEmit');
if (hasErrors) {
  fixErrors();
  run_terminal_cmd('npx tsc --noEmit');
}

// Only then proceed to browser testing
startBrowserTesting();
```

### Pattern 3: Re-validate After All Changes

**Re-validate after all changes complete:**

```typescript
// All refactoring complete
completeAllRefactoring();

// Final validation
run_terminal_cmd('npx tsc --noEmit');
run_terminal_cmd('npm run build'); // If applicable

// Document completion
updateProgressTxt('Refactoring complete, all validations pass');
```

## Documentation Patterns

### Pattern 1: Document Refactoring Patterns

**Document refactoring patterns in progress.txt:**

```markdown
## Refactoring: TILE_SIZE → TILE_WIDTH

### Pre-Analysis
- Found 15 occurrences total
- 3 declarations (1 class constant, 2 local constants)
- 10 usages
- 2 test code references

### Shadowing Issues
- GameScene.ts:45 - Local constant shadows class constant
- Handled by replacing local constant first, then class constant

### Batches
1. **Batch 1**: Local constant declarations (2 edits)
   - Validation: ✅ TypeScript passes
2. **Batch 2**: Class constant declaration (1 edit)
   - Validation: ✅ TypeScript passes
3. **Batch 3**: Usage sites (10 edits)
   - Validation: ✅ TypeScript passes
4. **Batch 4**: Test code (2 edits)
   - Validation: ✅ TypeScript passes

### Learnings
- Local constants can shadow class constants
- Need to handle shadowing before class constant changes
- Batching by type (declarations → usages → tests) works well
```

### Pattern 2: Record Shadowing Learnings

**Record learnings about shadowing and scope issues:**

```markdown
## Shadowing Detection Learnings

### Pattern
Local constants can shadow class-level constants:
```typescript
class GameScene {
  private static readonly TILE_SIZE = 32; // Class constant
  
  method() {
    const TILE_SIZE = 16; // Shadows class constant
  }
}
```

### Strategy
1. Identify shadowing during pre-analysis
2. Replace local constants first
3. Then replace class constants
4. Finally update usages

### Tools
- Use grep to find all declarations
- Check scope (local vs class) for each declaration
- Categorize by scope before batching
```

## Complete Workflow Example

### Example: Refactoring TILE_SIZE to TILE_WIDTH

```typescript
// Step 1: Pre-Analysis
const allOccurrences = grep('TILE_SIZE', 'src/**/*.ts');
const categorized = categorizeOccurrences(allOccurrences);
const shadowingIssues = identifyShadowing(categorized);

// Step 2: Create Plan
const plan = createRefactoringPlan(categorized, shadowingIssues);

// Step 3: Execute Batch 1 - Local Constants
for (const edit of plan.batch1.localConstants) {
  search_replace(edit.file, edit.old, edit.new);
}
run_terminal_cmd('npx tsc --noEmit'); // Validate

// Step 4: Execute Batch 2 - Class Constants
for (const edit of plan.batch2.classConstants) {
  search_replace(edit.file, edit.old, edit.new);
}
run_terminal_cmd('npx tsc --noEmit'); // Validate

// Step 5: Execute Batch 3 - Usages
for (const edit of plan.batch3.usages) {
  search_replace(edit.file, edit.old, edit.new);
}
run_terminal_cmd('npx tsc --noEmit'); // Validate

// Step 6: Execute Batch 4 - Test Code
for (const edit of plan.batch4.testCode) {
  search_replace(edit.file, edit.old, edit.new);
}
run_terminal_cmd('npx tsc --noEmit'); // Validate

// Step 7: Final Validation
run_terminal_cmd('npx tsc --noEmit');
updateProgressTxt('Refactoring complete');
```

## Best Practices

1. **Find ALL occurrences**: Use grep without head_limit
2. **Categorize by type**: Declarations, usages, test code, comments
3. **Identify shadowing**: Check local vs class constants
4. **Create plan**: Logical batches before executing
5. **Batch related edits**: Group by type and location
6. **Validate after batches**: TypeScript check after logical batches
7. **Document patterns**: Record in progress.txt
8. **Learn from shadowing**: Document scope issues

## Common Pitfalls

### Pitfall 1: Incomplete Analysis

**Problem**: Only finding first few occurrences

**Solution**: Find ALL occurrences before planning

```typescript
// ❌ WRONG: Limited search
grep('TILE_SIZE', 'src/**/*.ts', { head_limit: 10 });

// ✅ CORRECT: Complete search
grep('TILE_SIZE', 'src/**/*.ts');
```

### Pitfall 2: Missing Shadowing

**Problem**: Missing local constants that shadow class constants

**Solution**: Check scope for each declaration

```typescript
// ❌ WRONG: Not checking scope
const declarations = findAllDeclarations('TILE_SIZE');

// ✅ CORRECT: Check scope
const declarations = findAllDeclarations('TILE_SIZE');
const shadowing = declarations.filter(d => isLocalConstant(d) && hasClassConstant(d));
```

### Pitfall 3: Validating After Every Edit

**Problem**: Running TypeScript check after every single edit

**Solution**: Validate after logical batches

```typescript
// ❌ WRONG: Validate after every edit
edit1();
run_terminal_cmd('npx tsc --noEmit');
edit2();
run_terminal_cmd('npx tsc --noEmit');

// ✅ CORRECT: Validate after batch
edit1();
edit2();
edit3();
run_terminal_cmd('npx tsc --noEmit'); // Validate batch
```

## Integration with Other Skills

- **`file-edit-batching`**: Uses batching patterns for refactoring edits
- **`file-operation-optimization`**: Uses file caching during analysis
- **`timeout-prevention-operation-batching`**: Uses time tracking during refactoring

## Related Skills

- `file-edit-batching` - File editing batching strategies
- `file-operation-optimization` - File reading and caching
- `timeout-prevention-operation-batching` - Time tracking patterns

## Remember

1. **Pre-analyze**: Find ALL occurrences before planning
2. **Categorize**: Group by type (declarations, usages, tests)
3. **Identify shadowing**: Check local vs class constants
4. **Plan batches**: Create logical edit batches
5. **Validate after batches**: TypeScript check after logical batches
6. **Document**: Record patterns in progress.txt
7. **Learn**: Document shadowing and scope issues
