---
name: phaser-scene-navigation
description: Standardized patterns for Phaser scene transitions, navigation testing, and scene lifecycle management. Use when testing scene transitions, navigating between game scenes, or when scene navigation discovery issues occur. Documents scene transition methods, wait patterns, and console log fallback verification.
---

# Phaser Scene Navigation

## Overview

Standardize Phaser scene transitions and navigation testing patterns. Improve reliability of scene navigation testing.

## Scene Transition Methods

- `this.scene.start('SceneName', data)` - Start new scene with data
- `this.scene.switch('SceneName')` - Switch to existing scene
- Test seam: `window.__TEST__.commands.clickStartGame()` - Navigate via UI

See `references/transition-methods.md` for detailed transition patterns.

## Navigation Testing

**Use test seam commands when available**:
- `clickStartGame()` - Navigate to game
- `clickPlayAgain()` - Restart game

**Wait patterns**:
- Wait for scene initialization before accessing test seam
- Wait 1-2 seconds after transition before checking test seam
- Use console logs to verify scene transitions

**Don't rely solely on test seam sceneKey** (may lag on transitions)

See `references/navigation-testing.md` for detailed testing patterns.

## Scene Lifecycle

- Test seams are set up in `create()` method
- Each scene creates its own `window.__TEST__` object
- Old scene's test seam may persist briefly after transition
- Wait 1-2 seconds after transition before checking test seam

## Common Navigation Patterns

- **MainMenu → GameScene**: Use `clickStartGame()` test command
- **GameScene → LevelCompleteScene**: Automatic on exit reach
- **GameScene → GameOverScene**: Automatic on timer expire
- **Any scene → MainMenu**: Use `this.scene.start('MainMenu')`

## Resources

- `references/transition-methods.md` - Scene transition methods and data passing
- `references/navigation-testing.md` - Wait patterns, console log verification
