# Unit Testing Setup with Vitest

Complete guide to setting up Vitest for unit testing pure game logic.

## Why Unit Tests for Game Logic?

Browser automation (agent-browser) is slow and complex. For pure logic functions, unit tests provide:
- **Speed**: Run in milliseconds, not seconds
- **Determinism**: No browser, no flakiness
- **Isolation**: Test logic without game engine
- **Fast feedback**: Run on every save

## Vitest Configuration

### Installation

```bash
npm install -D vitest @vitest/ui
```

### Basic Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Use describe, it, expect without imports
    environment: 'node', // Run in Node, not browser
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

### TypeScript Support

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest --coverage"
  }
}
```

## Example Unit Tests

### Testing Maze Generation

```typescript
// src/utils/maze.test.ts
import { describe, it, expect } from 'vitest';
import { generateMaze, seededRandom } from './maze';

describe('generateMaze', () => {
  it('generates same maze with same seed', () => {
    const maze1 = generateMaze(10, 10, 42);
    const maze2 = generateMaze(10, 10, 42);
    expect(maze1).toEqual(maze2);
  });

  it('generates different mazes with different seeds', () => {
    const maze1 = generateMaze(10, 10, 42);
    const maze2 = generateMaze(10, 10, 43);
    expect(maze1).not.toEqual(maze2);
  });

  it('generates valid maze dimensions', () => {
    const maze = generateMaze(20, 15, 123);
    expect(maze.length).toBe(15);
    expect(maze[0].length).toBe(20);
  });

  it('has entrance and exit', () => {
    const maze = generateMaze(10, 10, 42);
    const hasEntrance = maze[0].some(row => row === 0);
    const hasExit = maze[maze.length - 1].some(row => row === 0);
    expect(hasEntrance).toBe(true);
    expect(hasExit).toBe(true);
  });
});
```

### Testing Seeded RNG

```typescript
// src/utils/rng.test.ts
import { describe, it, expect } from 'vitest';
import { SeededRandom } from './rng';

describe('SeededRandom', () => {
  it('produces same sequence with same seed', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);
    
    const values1 = Array.from({ length: 10 }, () => rng1.next());
    const values2 = Array.from({ length: 10 }, () => rng2.next());
    
    expect(values1).toEqual(values2);
  });

  it('produces different sequences with different seeds', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(43);
    
    const values1 = Array.from({ length: 10 }, () => rng1.next());
    const values2 = Array.from({ length: 10 }, () => rng2.next());
    
    expect(values1).not.toEqual(values2);
  });

  it('generates integers in range', () => {
    const rng = new SeededRandom(42);
    for (let i = 0; i < 100; i++) {
      const value = rng.nextInt(1, 10);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
    }
  });
});
```

### Testing Score Sorting

```typescript
// src/utils/score.test.ts
import { describe, it, expect } from 'vitest';
import { sortScores, validateScore } from './score';

describe('sortScores', () => {
  it('sorts scores in descending order', () => {
    const scores = [
      { name: 'Alice', score: 100 },
      { name: 'Bob', score: 200 },
      { name: 'Charlie', score: 50 },
    ];
    
    const sorted = sortScores(scores);
    
    expect(sorted[0].score).toBe(200);
    expect(sorted[1].score).toBe(100);
    expect(sorted[2].score).toBe(50);
  });

  it('handles empty array', () => {
    expect(sortScores([])).toEqual([]);
  });

  it('handles duplicate scores', () => {
    const scores = [
      { name: 'Alice', score: 100 },
      { name: 'Bob', score: 100 },
    ];
    
    const sorted = sortScores(scores);
    expect(sorted.length).toBe(2);
    expect(sorted[0].score).toBe(100);
    expect(sorted[1].score).toBe(100);
  });
});

describe('validateScore', () => {
  it('accepts valid scores', () => {
    expect(validateScore(100)).toBe(true);
    expect(validateScore(0)).toBe(true);
    expect(validateScore(9999)).toBe(true);
  });

  it('rejects negative scores', () => {
    expect(validateScore(-1)).toBe(false);
  });

  it('rejects non-numeric values', () => {
    expect(validateScore(NaN)).toBe(false);
    expect(validateScore(Infinity)).toBe(false);
  });
});
```

### Testing Storage Utilities

```typescript
// src/utils/storage.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageManager } from './storage';

describe('StorageManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('saves and loads data', () => {
    const storage = new StorageManager();
    const data = { score: 100, level: 5 };
    
    storage.save('gameState', data);
    const loaded = storage.load('gameState');
    
    expect(loaded).toEqual(data);
  });

  it('returns null for missing keys', () => {
    const storage = new StorageManager();
    expect(storage.load('missing')).toBeNull();
  });

  it('handles invalid JSON gracefully', () => {
    localStorage.setItem('invalid', 'not json');
    const storage = new StorageManager();
    
    expect(() => storage.load('invalid')).not.toThrow();
    expect(storage.load('invalid')).toBeNull();
  });

  it('removes data', () => {
    const storage = new StorageManager();
    storage.save('test', { value: 1 });
    storage.remove('test');
    
    expect(storage.load('test')).toBeNull();
  });
});
```

### Testing Math/Algorithm Utilities

```typescript
// src/utils/pathfinding.test.ts
import { describe, it, expect } from 'vitest';
import { findPath, manhattanDistance } from './pathfinding';

describe('manhattanDistance', () => {
  it('calculates distance correctly', () => {
    expect(manhattanDistance(0, 0, 3, 4)).toBe(7);
    expect(manhattanDistance(1, 1, 1, 1)).toBe(0);
  });
});

describe('findPath', () => {
  it('finds path in simple grid', () => {
    const grid = [
      [0, 0, 0],
      [0, 1, 0], // 1 = wall
      [0, 0, 0],
    ];
    
    const path = findPath(grid, { x: 0, y: 0 }, { x: 2, y: 2 });
    
    expect(path.length).toBeGreaterThan(0);
    expect(path[0]).toEqual({ x: 0, y: 0 });
    expect(path[path.length - 1]).toEqual({ x: 2, y: 2 });
  });

  it('returns empty path when no route exists', () => {
    const grid = [
      [0, 1, 0],
      [1, 1, 1], // Completely blocked
      [0, 1, 0],
    ];
    
    const path = findPath(grid, { x: 0, y: 0 }, { x: 2, y: 2 });
    
    expect(path).toEqual([]);
  });
});
```

### Testing State Management Logic

```typescript
// src/utils/gameState.test.ts
import { describe, it, expect } from 'vitest';
import { gameStateReducer, initialState } from './gameState';

describe('gameStateReducer', () => {
  it('handles ADD_SCORE action', () => {
    const state = gameStateReducer(initialState, {
      type: 'ADD_SCORE',
      payload: 10,
    });
    
    expect(state.score).toBe(10);
  });

  it('handles SET_LEVEL action', () => {
    const state = gameStateReducer(initialState, {
      type: 'SET_LEVEL',
      payload: 5,
    });
    
    expect(state.level).toBe(5);
  });

  it('handles unknown action gracefully', () => {
    const state = gameStateReducer(initialState, {
      type: 'UNKNOWN_ACTION',
    });
    
    expect(state).toEqual(initialState);
  });
});
```

## Patterns for Testing Seeded RNG

### Seeded Random Implementation

```typescript
// src/utils/rng.ts
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Linear congruential generator
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % Math.pow(2, 32);
    return this.seed / Math.pow(2, 32);
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}
```

### Testing Pattern

```typescript
// src/utils/rng.test.ts
import { describe, it, expect } from 'vitest';
import { SeededRandom } from './rng';

describe('SeededRandom', () => {
  it('is deterministic with same seed', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);
    
    // Generate 100 values
    const values1 = Array.from({ length: 100 }, () => rng1.next());
    const values2 = Array.from({ length: 100 }, () => rng2.next());
    
    expect(values1).toEqual(values2);
  });
});
```

## Patterns for Testing localStorage Operations

### Mocking localStorage

```typescript
// src/utils/storage.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('StorageManager with mocked localStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });
  
  // Tests here...
});
```

## Running Tests

### Watch Mode (Development)

```bash
npm test
# Runs in watch mode, re-runs on file changes
```

### UI Mode

```bash
npm run test:ui
# Opens Vitest UI in browser
```

### Single Run (CI)

```bash
npm run test:run
# Runs once and exits (for CI)
```

### Coverage

```bash
npm run test:coverage
# Generates coverage report
```

## When to Use Unit Tests vs Browser Automation

| Use Unit Tests For | Use Browser Automation For |
|-------------------|---------------------------|
| Pure functions | UI interactions |
| Algorithms | Scene transitions |
| Data transformations | Visual verification |
| Math utilities | Full game flows |
| State management | Integration testing |
| Storage operations | End-to-end scenarios |

## Summary

- **Install Vitest**: `npm install -D vitest @vitest/ui`
- **Configure**: Create `vitest.config.ts` with TypeScript support
- **Test pure logic**: Maze generation, score sorting, storage, math
- **Use seeded RNG**: Test deterministic algorithms
- **Mock dependencies**: localStorage, external APIs
- **Fast feedback**: Watch mode during development
- **Reserve browser automation**: For UI flows and integration tests
