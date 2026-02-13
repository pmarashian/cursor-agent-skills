---
name: file-operation-optimization
description: Strategies for efficient file reading, caching, and operation planning. Use when reading multiple files, performing code investigation, or when same files are accessed multiple times to reduce file operation overhead by 30-40%.
---

# File Operation Optimization

## Overview

Strategies for efficient file reading, caching, and operation planning. Reduces redundant file reads and improves code investigation efficiency.

**Problem**: Same files read 4-8 times in single tasks (e.g., GameScene.ts read multiple times), multiple grep searches on same files, no file content caching.

**Solution**: Cache file contents after first read, plan file operations upfront, batch related operations, use semantic search instead of multiple greps.

**Impact**: Reduce file operation overhead by 30-40%, improve code investigation efficiency.

## File Caching Patterns

### Pattern 1: Cache After First Read

**Cache file contents in agent context after first read:**

```typescript
// Cache file contents
const fileCache = new Map<string, string>();

function getFileContent(path: string): string {
  if (!fileCache.has(path)) {
    const content = read_file(path);
    fileCache.set(path, content);
  }
  return fileCache.get(path)!;
}

// Use cached content
const gameScene = getFileContent('src/scenes/GameScene.ts');
// Subsequent reads use cache
const gameSceneAgain = getFileContent('src/scenes/GameScene.ts'); // Uses cache
```

### Pattern 2: Invalidate Cache on Modification

**Re-read file only when modified:**

```typescript
// Track file modifications
const fileModifications = new Map<string, number>();

function readFileWithCache(path: string, modificationTime: number): string {
  const cached = fileCache.get(path);
  const lastModified = fileModifications.get(path) || 0;
  
  if (!cached || modificationTime > lastModified) {
    const content = read_file(path);
    fileCache.set(path, content);
    fileModifications.set(path, modificationTime);
    return content;
  }
  
  return cached;
}
```

### Pattern 3: Cache Between Operations

**Reuse cached content for subsequent operations:**

```typescript
// First operation: Read and cache
const gameScene = read_file('src/scenes/GameScene.ts');
// Cache in context for subsequent operations

// Second operation: Use cached content
// Instead of re-reading, analyze cached content
const lines = gameScene.split('\n');
const functions = lines.filter(line => line.includes('function'));

// Third operation: Still use cached content
const classes = lines.filter(line => line.includes('class'));
```

## Pre-Planning Strategies

### Pattern 1: Analyze Required Files Upfront

**Create file reading plan before starting implementation:**

```typescript
// Analyze task requirements
const task = read_file('task.md');
const requiredFiles = analyzeTaskRequirements(task);

// Create reading plan
const readingPlan = [
  'src/scenes/GameScene.ts',
  'src/scenes/MainMenu.ts',
  'src/types/GameState.ts',
  'src/utils/mazeGenerator.ts',
];

// Execute planned file reads (batched)
const files = await Promise.all(
  readingPlan.map(file => read_file(file))
);
```

### Pattern 2: Map File Dependencies

**Identify file dependencies before reading:**

```typescript
// Map dependencies
const dependencies = {
  'GameScene.ts': ['GameState.ts', 'mazeGenerator.ts'],
  'MainMenu.ts': ['GameState.ts'],
  'GameState.ts': [],
  'mazeGenerator.ts': [],
};

// Read in dependency order
function readWithDependencies(file: string, read: Set<string> = new Set()) {
  if (read.has(file)) return; // Already read
  
  const deps = dependencies[file] || [];
  for (const dep of deps) {
    readWithDependencies(dep, read);
  }
  
  read_file(file);
  read.add(file);
}
```

### Pattern 3: Plan File Operations

**Plan all file operations before execution:**

```typescript
// Plan file operations
const fileOperations = {
  read: [
    'src/scenes/GameScene.ts',
    'src/scenes/MainMenu.ts',
  ],
  search: [
    { pattern: 'GameState', files: 'src/**/*.ts' },
    { pattern: 'generateMaze', files: 'src/**/*.ts' },
  ],
  edit: [
    'src/scenes/GameScene.ts',
  ],
};

// Execute planned operations
// 1. Batch all reads
const files = await Promise.all(
  fileOperations.read.map(file => read_file(file))
);

// 2. Batch all searches
const searchResults = await Promise.all(
  fileOperations.search.map(({ pattern, files }) => 
    codebase_search(`Where is ${pattern} used?`, files)
  )
);
```

## Reading Strategy

### Pattern 1: Read Full Files Once

**Read full files once, analyze in memory:**

```typescript
// ❌ INEFFICIENT: Multiple partial reads
read_file('GameScene.ts', { offset: 0, limit: 50 });
read_file('GameScene.ts', { offset: 50, limit: 50 });
read_file('GameScene.ts', { offset: 100, limit: 50 });

// ✅ EFFICIENT: Single full read
const fullFile = read_file('GameScene.ts');
// Analyze in memory
const lines = fullFile.split('\n');
const functions = extractFunctions(lines);
const classes = extractClasses(lines);
```

### Pattern 2: Use Semantic Search

**Use semantic search instead of multiple grep operations:**

```typescript
// ❌ INEFFICIENT: Multiple greps
grep('GameState', 'src/**/*.ts');
grep('gameState', 'src/**/*.ts');
grep('GameStateType', 'src/**/*.ts');

// ✅ EFFICIENT: Single semantic search
codebase_search('How is GameState used throughout the codebase?');
```

### Pattern 3: Combine Grep Operations

**Combine related grep searches where possible:**

```typescript
// ❌ INEFFICIENT: Separate greps
grep('TILE_SIZE', 'src/**/*.ts');
grep('TILE_WIDTH', 'src/**/*.ts');
grep('TILE_HEIGHT', 'src/**/*.ts');

// ✅ EFFICIENT: Combined search
codebase_search('Where are tile size constants defined and used?');
// OR use grep with regex if supported
grep('TILE_(SIZE|WIDTH|HEIGHT)', 'src/**/*.ts');
```

## Operation Batching

### Pattern 1: Group by Purpose

**Group file reads by purpose:**

```typescript
// Group by purpose
const taskFiles = [
  'task.md',
  'progress.txt',
];

const codeFiles = [
  'src/scenes/GameScene.ts',
  'src/scenes/MainMenu.ts',
  'src/types/GameState.ts',
];

// Batch reads by purpose
const [taskData, codeData] = await Promise.all([
  Promise.all(taskFiles.map(f => read_file(f))),
  Promise.all(codeFiles.map(f => read_file(f))),
]);
```

### Pattern 2: Parallel Independent Reads

**Read independent files in parallel:**

```typescript
// ❌ INEFFICIENT: Sequential reads
const file1 = read_file('file1.ts');
const file2 = read_file('file2.ts');
const file3 = read_file('file3.ts');

// ✅ EFFICIENT: Parallel reads
const [file1, file2, file3] = await Promise.all([
  read_file('file1.ts'),
  read_file('file2.ts'),
  read_file('file3.ts'),
]);
```

### Pattern 3: Batch Related Operations

**Batch related file operations together:**

```typescript
// Batch related operations
async function analyzeCodebase() {
  // 1. Read all relevant files
  const files = await Promise.all([
    read_file('src/scenes/GameScene.ts'),
    read_file('src/scenes/MainMenu.ts'),
    read_file('src/types/GameState.ts'),
  ]);
  
  // 2. Search for patterns (using cached file knowledge)
  const patterns = await Promise.all([
    codebase_search('How does scene navigation work?'),
    codebase_search('Where is GameState used?'),
  ]);
  
  // 3. Analyze results
  return { files, patterns };
}
```

## Best Practices

1. **Cache after first read**: Store file contents in context
2. **Invalidate on modification**: Re-read only when files change
3. **Plan upfront**: Analyze required files before starting
4. **Read full files**: Read once, analyze in memory
5. **Use semantic search**: Instead of multiple greps
6. **Batch operations**: Group related file reads
7. **Parallel reads**: Read independent files simultaneously
8. **Reuse cached content**: Don't re-read same files

## Common Pitfalls

### Pitfall 1: Re-reading Same Files

**Problem**: Reading same file multiple times

**Solution**: Cache file contents

```typescript
// ❌ WRONG: Multiple reads
read_file('GameScene.ts');
read_file('GameScene.ts'); // Re-reading
read_file('GameScene.ts'); // Re-reading again

// ✅ CORRECT: Cache and reuse
const gameScene = read_file('GameScene.ts');
// Use cached content for subsequent operations
```

### Pitfall 2: Multiple Grep Searches

**Problem**: Multiple separate grep operations on same files

**Solution**: Use semantic search or combine greps

```typescript
// ❌ WRONG: Multiple greps
grep('pattern1', 'src/**/*.ts');
grep('pattern2', 'src/**/*.ts');
grep('pattern3', 'src/**/*.ts');

// ✅ CORRECT: Semantic search
codebase_search('Where are pattern1, pattern2, and pattern3 used?');
```

### Pitfall 3: No Planning

**Problem**: Reading files incrementally without plan

**Solution**: Plan file operations upfront

```typescript
// ❌ WRONG: Incremental reads
read_file('file1.ts');
// Do something
read_file('file2.ts');
// Do something else
read_file('file3.ts');

// ✅ CORRECT: Planned reads
const files = await Promise.all([
  read_file('file1.ts'),
  read_file('file2.ts'),
  read_file('file3.ts'),
]);
// Use all files together
```

### Pitfall 4: Partial Reads

**Problem**: Reading files in chunks instead of full read

**Solution**: Read full files once

```typescript
// ❌ WRONG: Partial reads
read_file('file.ts', { offset: 0, limit: 100 });
read_file('file.ts', { offset: 100, limit: 100 });

// ✅ CORRECT: Full read
const fullFile = read_file('file.ts');
// Analyze in memory
```

## Integration with Other Skills

- **`timeout-prevention-operation-batching`**: Uses batching patterns for file operations
- **`refactoring-workflow-optimization`**: Uses file caching during refactoring
- **`file-edit-batching`**: Coordinates with file reading strategies

## Related Skills

- `timeout-prevention-operation-batching` - Operation batching patterns
- `refactoring-workflow-optimization` - Refactoring with file optimization
- `file-edit-batching` - File editing strategies

## Remember

1. **Cache files**: Store contents after first read
2. **Plan upfront**: Analyze required files before starting
3. **Read full files**: Read once, analyze in memory
4. **Use semantic search**: Instead of multiple greps
5. **Batch operations**: Group related file reads
6. **Parallel reads**: Read independent files simultaneously
7. **Reuse cache**: Don't re-read same files
