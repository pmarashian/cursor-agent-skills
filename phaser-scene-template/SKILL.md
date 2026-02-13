---
name: phaser-scene-template
description: Standardized Phaser scene template with test seam, lifecycle methods, and common patterns. Use when creating new Phaser scenes to ensure consistency, test seam setup, and proper lifecycle management. Provides template code for new scenes.
---

# Phaser Scene Template

## Overview

Standardized Phaser scene template with test seam, lifecycle methods, and common patterns. Accelerate scene creation and ensure consistency.

## Template Structure

See `assets/scene-template.ts` for complete scene template code.

## Key Components

- **Lifecycle methods**: `preload()`, `create()`, `update()`
- **Test seam setup**: Standardized test seam structure
- **Game state management**: Common state patterns
- **Scene navigation**: Transition methods

## Mandatory Test Seam Setup Checklist

**Every scene MUST include test seam setup**:

- [ ] Check for `window.__TEST__` availability
- [ ] Register scene with TestManager (if using singleton pattern)
- [ ] Set up `window.__TEST__.commands` object
- [ ] Implement `gameState()` method for state access
- [ ] Add scene-specific commands (navigation, actions)
- [ ] Set `window.__TEST__.ready = true` after initialization
- [ ] Set `window.__TEST__.sceneKey` to current scene key
- [ ] Document available commands in code comments

**Example**:
```typescript
setupTestSeam() {
  if (!window.__TEST__) {
    window.__TEST__ = {};
  }
  
  window.__TEST__.sceneKey = this.scene.key;
  window.__TEST__.ready = true;
  
  window.__TEST__.commands = {
    goToScene: (key: string) => {
      this.scene.start(key);
    },
    gameState: () => {
      return {
        scene: this.scene.key,
        score: this.score,
        // Scene-specific state
      };
    }
  };
}
```

## Test Seam Debugging Patterns

**If test seam not working**:
1. Check if `window.__TEST__` is defined
2. Verify scene is initialized (check `create()` method)
3. Wait for `window.__TEST__.ready === true`
4. Check scene key matches Phaser scene registration
5. Verify commands are defined in `window.__TEST__.commands`

**Common test seam issues**:
- **Test seam undefined**: Scene not initialized, check `create()` method
- **Commands not found**: Commands not defined in `window.__TEST__.commands`
- **SceneKey doesn't update**: Known issue, use console logs as fallback
- **Ready flag false**: Scene still initializing, wait for ready

## Verification Patterns for Test Seams

**Verify test seam setup**:
```typescript
// In browser console or test
console.log(window.__TEST__); // Should be defined
console.log(window.__TEST__.ready); // Should be true
console.log(window.__TEST__.sceneKey); // Should match scene key
console.log(window.__TEST__.commands); // Should have commands
```

**Test seam command verification**:
```bash
# In agent-browser
agent-browser eval "window.__TEST__ && window.__TEST__.ready"
agent-browser eval "window.__TEST__.commands.gameState()"
agent-browser eval "window.__TEST__.commands.goToScene('MainMenu')"
```

## Lifecycle Patterns

See `references/lifecycle-patterns.md` for detailed lifecycle patterns:
- `preload()` - Load assets
- `create()` - Initialize scene, set up test seam
- `update()` - Game loop

## Usage

1. Copy `assets/scene-template.ts` to your scene file
2. Customize for your scene's needs
3. Add scene-specific logic
4. Update test seam commands

## Component Test Scene Variant

When the scene's purpose is to test a single UI component, use the same lifecycle and test seam checklist but with minimal content: only that component plus the test seam. For the full workflow and naming (e.g. `ComponentNameTestScene`, boot via `?scene=...`), use the **phaser-component-test-scenes** skill.

## Resources

- `assets/scene-template.ts` - Template code for new scenes
- `references/lifecycle-patterns.md` - preload, create, update patterns
- **phaser-component-test-scenes** - Standalone test scenes for UI components (workflow and template)
