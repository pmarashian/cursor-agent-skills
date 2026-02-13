---
name: maze-generation-patterns
description: Document maze generation algorithms (recursive backtracking, etc.), provide error handling patterns, include retry logic with limited attempts, document pathfinding validation patterns, and provide test patterns for maze generation. Use when implementing maze generation features.
---

# Maze Generation Patterns

## Overview

Patterns for implementing maze generation algorithms, including error handling, retry logic, pathfinding validation, and testing approaches.

## Maze Generation Algorithms

### Algorithm 1: Recursive Backtracking

**Most common algorithm** for maze generation:

```typescript
interface Cell {
  x: number;
  y: number;
  walls: {
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
  };
  visited: boolean;
}

function generateMazeRecursiveBacktracking(
  width: number,
  height: number,
  seed?: number
): Cell[][] {
  // Initialize grid
  const grid: Cell[][] = [];
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      grid[y][x] = {
        x,
        y,
        walls: { north: true, south: true, east: true, west: true },
        visited: false,
      };
    }
  }

  // Seed RNG if provided
  if (seed !== undefined) {
    seedRNG(seed);
  }

  // Stack for backtracking
  const stack: Cell[] = [];
  let current = grid[0][0];
  current.visited = true;
  stack.push(current);

  // Generate maze
  while (stack.length > 0) {
    const neighbors = getUnvisitedNeighbors(current, grid);
    
    if (neighbors.length > 0) {
      // Choose random neighbor
      const next = neighbors[Math.floor(seededRandom() * neighbors.length)];
      
      // Remove wall between current and next
      removeWall(current, next);
      
      // Mark next as visited
      next.visited = true;
      stack.push(next);
      current = next;
    } else {
      // Backtrack
      current = stack.pop()!;
    }
  }

  return grid;
}

function getUnvisitedNeighbors(cell: Cell, grid: Cell[][]): Cell[] {
  const neighbors: Cell[] = [];
  const { x, y } = cell;

  // Check all four directions
  const directions = [
    { x: 0, y: -1, name: 'north' },
    { x: 0, y: 1, name: 'south' },
    { x: 1, y: 0, name: 'east' },
    { x: -1, y: 0, name: 'west' },
  ];

  for (const dir of directions) {
    const nx = x + dir.x;
    const ny = y + dir.y;

    if (
      nx >= 0 &&
      nx < grid[0].length &&
      ny >= 0 &&
      ny < grid.length &&
      !grid[ny][nx].visited
    ) {
      neighbors.push(grid[ny][nx]);
    }
  }

  return neighbors;
}

function removeWall(current: Cell, next: Cell): void {
  const dx = next.x - current.x;
  const dy = next.y - current.y;

  if (dx === 1) {
    // Moving east
    current.walls.east = false;
    next.walls.west = false;
  } else if (dx === -1) {
    // Moving west
    current.walls.west = false;
    next.walls.east = false;
  } else if (dy === 1) {
    // Moving south
    current.walls.south = false;
    next.walls.north = false;
  } else if (dy === -1) {
    // Moving north
    current.walls.north = false;
    next.walls.south = false;
  }
}
```

### Algorithm 2: Kruskal's Algorithm

**Alternative algorithm** using union-find:

```typescript
function generateMazeKruskal(
  width: number,
  height: number,
  seed?: number
): Cell[][] {
  // Initialize grid with all walls
  const grid: Cell[][] = initializeGrid(width, height);
  
  // Create list of all walls
  const walls: Array<{ cell1: Cell; cell2: Cell }> = [];
  // ... populate walls list ...
  
  // Shuffle walls
  if (seed !== undefined) {
    seedRNG(seed);
  }
  shuffle(walls);
  
  // Union-find data structure
  const parent = new Map<Cell, Cell>();
  
  // Process walls
  for (const wall of walls) {
    if (find(wall.cell1) !== find(wall.cell2)) {
      removeWall(wall.cell1, wall.cell2);
      union(wall.cell1, wall.cell2);
    }
  }
  
  return grid;
}
```

## Error Handling Patterns

### Pattern 1: Try-Catch with Fallback

**Handle generation errors** with fallback maze:

```typescript
function generateMaze(seed: number): MazeData {
  try {
    // Check for test mode failure injection
    if ((window as any).__TEST_MAZE_FAILURE__) {
      throw new Error('Test mode: Forced maze generation failure');
    }
    
    return generateMazeRecursiveBacktracking(10, 10, seed);
  } catch (error) {
    console.error('Maze generation failed:', error);
    // Create simple fallback maze
    return createFallbackMaze();
  }
}

function createFallbackMaze(): MazeData {
  // Simple straight path from start to exit
  const grid: Cell[][] = [];
  for (let y = 0; y < 10; y++) {
    grid[y] = [];
    for (let x = 0; x < 10; x++) {
      grid[y][x] = {
        x,
        y,
        walls: {
          north: y !== 0,
          south: y !== 9,
          east: x !== 9,
          west: x !== 0,
        },
        visited: false,
      };
    }
  }
  
  // Create straight path
  for (let x = 0; x < 10; x++) {
    grid[0][x].walls.south = false;
    grid[1][x].walls.north = false;
  }
  
  return { grid, start: { x: 0, y: 0 }, exit: { x: 9, y: 1 } };
}
```

### Pattern 2: Retry Logic with Limited Attempts

**Retry generation** with limited attempts:

```typescript
function generateMazeWithRetry(
  seed: number,
  maxAttempts: number = 3
): MazeData {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return generateMazeRecursiveBacktracking(10, 10, seed + attempt);
    } catch (error) {
      console.warn(`Maze generation attempt ${attempt} failed:`, error);
      
      if (attempt === maxAttempts) {
        console.error('All maze generation attempts failed, using fallback');
        return createFallbackMaze();
      }
    }
  }
  
  // Should never reach here, but TypeScript needs it
  return createFallbackMaze();
}
```

### Pattern 3: Validation Before Return

**Validate maze** before returning:

```typescript
function generateMaze(seed: number): MazeData {
  const maze = generateMazeRecursiveBacktracking(10, 10, seed);
  
  // Validate maze
  if (!validateMaze(maze)) {
    console.error('Generated maze failed validation, using fallback');
    return createFallbackMaze();
  }
  
  return maze;
}

function validateMaze(maze: MazeData): boolean {
  // Check if start and exit exist
  if (!maze.start || !maze.exit) {
    return false;
  }
  
  // Check if path exists from start to exit
  if (!pathExists(maze.start, maze.exit, maze.grid)) {
    return false;
  }
  
  return true;
}
```

## Pathfinding Validation Patterns

### Pattern 1: BFS Pathfinding

**Verify path exists** using breadth-first search:

```typescript
function pathExists(
  start: { x: number; y: number },
  exit: { x: number; y: number },
  grid: Cell[][]
): boolean {
  const queue: Array<{ x: number; y: number }> = [start];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Check if reached exit
    if (current.x === exit.x && current.y === exit.y) {
      return true;
    }

    // Check all neighbors
    const neighbors = getNeighbors(current, grid);
    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }

  return false;
}

function getNeighbors(
  cell: { x: number; y: number },
  grid: Cell[][]
): Array<{ x: number; y: number }> {
  const neighbors: Array<{ x: number; y: number }> = [];
  const { x, y } = cell;
  const cellData = grid[y][x];

  // Check all four directions
  if (!cellData.walls.north && y > 0) {
    neighbors.push({ x, y: y - 1 });
  }
  if (!cellData.walls.south && y < grid.length - 1) {
    neighbors.push({ x, y: y + 1 });
  }
  if (!cellData.walls.east && x < grid[0].length - 1) {
    neighbors.push({ x: x + 1, y });
  }
  if (!cellData.walls.west && x > 0) {
    neighbors.push({ x: x - 1, y });
  }

  return neighbors;
}
```

### Pattern 2: A* Pathfinding

**More efficient pathfinding** for larger mazes:

```typescript
function findPathAStar(
  start: { x: number; y: number },
  exit: { x: number; y: number },
  grid: Cell[][]
): Array<{ x: number; y: number }> | null {
  // A* implementation
  // ... (standard A* algorithm) ...
  return path;
}
```

## Test Patterns for Maze Generation

### Test 1: Deterministic Generation

**Verify same seed produces same maze**:

```typescript
describe('Maze Generation', () => {
  it('generates same maze with same seed', () => {
    const seed = 42;
    const maze1 = generateMaze(seed);
    const maze2 = generateMaze(seed);
    expect(maze1).toEqual(maze2);
  });
});
```

### Test 2: Path Validation

**Verify path exists from start to exit**:

```typescript
it('generates maze with valid path', () => {
  const maze = generateMaze(42);
  const pathExists = pathExists(maze.start, maze.exit, maze.grid);
  expect(pathExists).toBe(true);
});
```

### Test 3: Error Handling

**Verify error handling works**:

```typescript
it('handles generation errors with fallback', () => {
  (window as any).__TEST_MAZE_FAILURE__ = true;
  const maze = generateMaze(42);
  expect(maze).toBeDefined();
  expect(maze.grid).toBeDefined();
  (window as any).__TEST_MAZE_FAILURE__ = false;
});
```

### Test 4: Retry Logic

**Verify retry logic works**:

```typescript
it('retries generation on failure', () => {
  let attemptCount = 0;
  const originalGenerate = generateMazeRecursiveBacktracking;
  
  // Mock to fail first two attempts
  generateMazeRecursiveBacktracking = jest.fn(() => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error('Generation failed');
    }
    return originalGenerate(10, 10, 42);
  });
  
  const maze = generateMazeWithRetry(42, 3);
  expect(maze).toBeDefined();
  expect(attemptCount).toBe(3);
});
```

## Best Practices

1. **Use seeded RNG**: Deterministic generation for testing
2. **Handle errors gracefully**: Fallback maze if generation fails
3. **Validate mazes**: Verify path exists before using
4. **Retry with limits**: Don't retry forever
5. **Test thoroughly**: Test generation, validation, error handling

## Resources

- `rng-seeding-patterns` skill - RNG seed management
- `phaser-game-testing` skill - Testing patterns
