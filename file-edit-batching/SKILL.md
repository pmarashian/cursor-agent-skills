---
name: file-edit-batching
description: Identify all related changes before editing, batch independent changes in single edit, keep incremental edits for dependent changes, use comprehensive file reads before major refactorings, and document edit planning strategies. Use when making multiple related code changes to reduce edit count and improve efficiency.
---

# File Edit Batching

## Overview

Strategies for batching file edits to reduce edit count and improve efficiency. Identify related changes, batch independent edits, and plan edits before execution.

## Safe / incremental edits

Prefer **small, targeted search-and-replace** edits with **unique context** and **minimal span** (at least 3–5 lines of unique context before and after). Avoid replacing entire files or large sections unless you are intentionally doing a full rewrite. If an edit could match multiple locations, narrow the context so the match is unique. **After two failed or ambiguous edits**, consider a smaller span or a different anchor. This reduces "file corruption" or accidentally replacing the whole file.

## Identify All Related Changes Before Editing

### Pattern 1: Read All Related Files First

**Read all files** that need changes before editing:

```typescript
// Before editing, read all related files
const gameScene = read_file('src/scenes/GameScene.ts');
const mainMenu = read_file('src/scenes/MainMenu.ts');
const types = read_file('src/types/GameState.ts');

// Identify all changes needed
// Then make edits
```

### Pattern 2: Map Dependencies

**Map file dependencies** before editing:

```typescript
// Map dependencies
const dependencies = {
  'GameScene.ts': ['GameState.ts', 'mazeGenerator.ts'],
  'MainMenu.ts': ['GameState.ts'],
  'GameState.ts': [],
};

// Read all dependencies first
for (const file of Object.keys(dependencies)) {
  read_file(file);
  for (const dep of dependencies[file]) {
    read_file(dep);
  }
}
```

### Pattern 3: Search for Related Code

**Search codebase** for related code before editing:

```typescript
// Search for related code
codebase_search('How does scene navigation work?');
codebase_search('Where is GameState used?');

// Identify all locations that need changes
// Then plan edits
```

## Batch Independent Changes in Single Edit

### Pattern 1: Multiple Independent Changes

**Batch unrelated changes** in single edit:

```typescript
// ❌ INEFFICIENT: Multiple edits for independent changes
search_replace('GameScene.ts', 'score = 0', 'score = 0');
search_replace('GameScene.ts', 'level = 1', 'level = 1');
search_replace('GameScene.ts', 'timer = 60', 'timer = 60');

// ✅ EFFICIENT: Single edit for independent changes
search_replace('GameScene.ts', 
  `score = 0;
level = 1;
timer = 60;`,
  `score = 0;
level = 1;
timer = 60;`
);
```

### Pattern 2: Multiple Function Additions

**Add multiple functions** in single edit:

```typescript
// ✅ EFFICIENT: Add multiple functions at once
search_replace('GameScene.ts',
  '  update() {',
  `  update() {
    this.updatePlayer();
    this.updateEnemies();
    this.updateTimer();
  }

  updatePlayer() {
    // Player update logic
  }

  updateEnemies() {
    // Enemy update logic
  }

  updateTimer() {
    // Timer update logic
  }`
);
```

### Pattern 3: Multiple Import Statements

**Add multiple imports** in single edit:

```typescript
// ✅ EFFICIENT: Add all imports at once
search_replace('GameScene.ts',
  "import Phaser from 'phaser';",
  `import Phaser from 'phaser';
import { GameState } from '../types/GameState';
import { generateMaze } from '../utils/mazeGenerator';
import { saveHighScore } from '../utils/highScoreStorage';`
);
```

## Keep Incremental Edits for Dependent Changes

### Pattern 1: Dependent Changes

**Keep dependent changes** separate:

```typescript
// ✅ CORRECT: Incremental edits for dependent changes
// Step 1: Add function
search_replace('GameScene.ts', '  create() {', 
  `  create() {
    this.setupTestSeam();`
);

// Step 2: Implement function (depends on step 1)
search_replace('GameScene.ts', '  update() {',
  `  setupTestSeam() {
    window.__TEST__ = {
      commands: {
        gameState: () => this.gameState,
      },
    };
  }

  update() {`
);
```

### Pattern 2: Verify After Each Step

**Verify after each dependent change**:

```typescript
// Step 1: Add interface
search_replace('types.ts', 'export interface GameState {', 
  `export interface GameState {
  score: number;
  level: number;`
);

// Verify compilation
run_terminal_cmd('npx tsc --noEmit');

// Step 2: Use interface (depends on step 1)
search_replace('GameScene.ts', 'private gameState;', 
  'private gameState: GameState;'
);
```

## Use Comprehensive File Reads Before Major Refactorings

### Pattern 1: Read Entire File

**Read entire file** before major refactoring:

```typescript
// Before major refactoring, read entire file
const file = read_file('src/scenes/GameScene.ts');

// Understand structure
// Plan all changes
// Then make edits
```

### Pattern 2: Read Related Files

**Read all related files** before refactoring:

```typescript
// Before refactoring, read all related files
const gameScene = read_file('src/scenes/GameScene.ts');
const mainMenu = read_file('src/scenes/MainMenu.ts');
const gameState = read_file('src/types/GameState.ts');

// Understand dependencies
// Plan refactoring
// Then make edits
```

### Pattern 3: Search for All Usages

**Search for all usages** before refactoring:

```typescript
// Before refactoring, search for all usages
grep('GameState', 'src/**/*.ts');
grep('generateMaze', 'src/**/*.ts');

// Identify all locations that need changes
// Plan refactoring
// Then make edits
```

## Edit Planning Strategies

### Strategy 1: Plan All Edits First

**Plan all edits** before executing:

```typescript
// Plan all edits
const edits = [
  { file: 'GameScene.ts', change: 'Add test seam' },
  { file: 'GameScene.ts', change: 'Add timer logic' },
  { file: 'MainMenu.ts', change: 'Add navigation' },
];

// Execute edits
for (const edit of edits) {
  // Make edit
}
```

### Strategy 2: Group by File

**Group edits by file**:

```typescript
// Group edits by file
const editsByFile = {
  'GameScene.ts': [
    'Add test seam',
    'Add timer logic',
    'Add coin collection',
  ],
  'MainMenu.ts': [
    'Add navigation',
    'Add high scores',
  ],
};

// Execute all edits for each file
for (const [file, changes] of Object.entries(editsByFile)) {
  // Batch all changes for this file
}
```

### Strategy 3: Identify Dependencies

**Identify edit dependencies**:

```typescript
// Identify dependencies
const edits = [
  { 
    file: 'types.ts', 
    change: 'Add GameState interface',
    dependencies: [] 
  },
  { 
    file: 'GameScene.ts', 
    change: 'Use GameState interface',
    dependencies: ['types.ts'] 
  },
];

// Execute in dependency order
const executed = new Set();
for (const edit of edits) {
  // Check dependencies
  if (edit.dependencies.every(dep => executed.has(dep))) {
    // Execute edit
    executed.add(edit.file);
  }
}
```

## Examples of Safe Batching Patterns

### Example 1: Add Multiple Methods

**Safe to batch**: Multiple independent method additions

```typescript
// ✅ SAFE: All methods are independent
search_replace('GameScene.ts',
  '  update() {',
  `  update() {
    this.updatePlayer();
    this.updateEnemies();
  }

  updatePlayer() {
    // Player logic
  }

  updateEnemies() {
    // Enemy logic
  }`
);
```

### Example 2: Update Multiple Properties

**Safe to batch**: Multiple independent property updates

```typescript
// ✅ SAFE: All properties are independent
search_replace('GameScene.ts',
  `this.score = 0;
this.level = 1;`,
  `this.score = 0;
this.level = 1;
this.timer = 60;
this.gameOver = false;`
);
```

### Example 3: Add Multiple Imports

**Safe to batch**: Multiple independent imports

```typescript
// ✅ SAFE: All imports are independent
search_replace('GameScene.ts',
  "import Phaser from 'phaser';",
  `import Phaser from 'phaser';
import { GameState } from '../types/GameState';
import { generateMaze } from '../utils/mazeGenerator';`
);
```

## Refactoring-Specific Patterns

### Pattern 1: Pre-Analysis Before Refactoring

**Before refactoring, perform comprehensive analysis:**

```typescript
// Step 1: Find ALL occurrences (not just first few)
const allOccurrences = grep('TILE_SIZE', 'src/**/*.ts');
// No head_limit - get complete picture

// Step 2: Categorize by type
const categorized = {
  declarations: allOccurrences.filter(o => isDeclaration(o)),
  usages: allOccurrences.filter(o => isUsage(o)),
  testCode: allOccurrences.filter(o => isTestCode(o)),
  comments: allOccurrences.filter(o => isComment(o)),
};

// Step 3: Identify shadowing issues
const shadowingIssues = identifyShadowing(categorized.declarations);

// Step 4: Create refactoring plan with logical batches
const refactoringPlan = createRefactoringPlan(categorized, shadowingIssues);
```

### Pattern 2: Batch Related Refactoring Edits

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

### Pattern 3: Scope Analysis Before Batching

**Analyze full scope before batching edits:**

```typescript
// Analyze scope for each occurrence
const scopeAnalysis = allOccurrences.map(occ => ({
  occurrence: occ,
  scope: getScope(occ), // 'class', 'local', 'global'
  shadowing: checkShadowing(occ),
}));

// Group by scope for batching
const batches = {
  localConstants: scopeAnalysis.filter(s => s.scope === 'local'),
  classConstants: scopeAnalysis.filter(s => s.scope === 'class'),
  usages: scopeAnalysis.filter(s => s.scope === 'usage'),
};
```

### Pattern 4: Validation After Logical Batches

**Run TypeScript check after logical batches (not after every edit):**

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

## Batch Validation Strategies

### Strategy 1: Validate After Logical Batches

**Validate after each logical batch of related changes:**

```typescript
// Logical batch 1: All constant declarations
batchEditDeclarations();
run_terminal_cmd('npx tsc --noEmit');

// Logical batch 2: All usage sites
batchEditUsages();
run_terminal_cmd('npx tsc --noEmit');

// Logical batch 3: All test code
batchEditTestCode();
run_terminal_cmd('npx tsc --noEmit');
```

### Strategy 2: Validate Before Testing

**Always validate before starting browser testing phase:**

```typescript
// Complete all refactoring batches
completeAllRefactoringBatches();

// Validate before testing
run_terminal_cmd('npx tsc --noEmit');
if (hasErrors) {
  fixErrors();
  run_terminal_cmd('npx tsc --noEmit');
}

// Only then proceed to browser testing
startBrowserTesting();
```

## Best Practices

1. **Read files first**: Understand structure before editing
2. **Batch independent changes**: Reduce edit count
3. **Keep dependent changes separate**: Verify after each step
4. **Plan edits**: Map dependencies before executing
5. **Verify after edits**: Check compilation after changes
6. **Pre-analyze refactoring**: Find ALL occurrences before planning
7. **Scope analysis**: Analyze full scope before batching
8. **Validate after batches**: TypeScript check after logical batches

## Resources

- `agent-workflow-guidelines` skill - General workflow guidelines
- `typescript-incremental-check` skill - Compilation patterns
- `refactoring-workflow-optimization` skill - Refactoring-specific workflows
