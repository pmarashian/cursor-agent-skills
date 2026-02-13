---
name: phaser-component-test-scenes
description: Standalone test scenes for Phaser UI components. Use when building or testing a Phaser UI component (slider, toggle, HUD, button, modal, volume control). Create one scene per component, boot via ?scene=ComponentNameTestScene, and test in isolation instead of on the full game page. Unit-test methodology for Phaser components.
---

# Phaser Component Test Scenes

## Overview

Test Phaser UI components in isolation by giving each component its own **component test scene**. Boot with `?scene=<TestSceneKey>` and verify behavior via the test seam—no full game or navigation required.

## When to Use

- Building or testing a Phaser UI component: slider, toggle, HUD element, button, modal, volume control, control-scheme selector, etc.
- Verifying layout, interaction, or test seam for a single component without loading the full scene where it is used.

## Rule

Do not rely on testing the component only inside the full scene where it is used. Create a **component test scene** for that component and test there first.

## Workflow

1. **Implement or extract the component** (reusable class or clearly bounded logic).
2. **Add a dedicated scene** that only instantiates this component (and minimal deps: assets, mock callbacks).
3. **Register the scene in main.ts** so it can be booted via `?scene=<TestSceneKey>`.
4. **Expose a test seam** on the test scene: `window.__TEST__.commands` for that component only (e.g. `setSliderValue`, `getSliderValue`, `clickToggle`, `getToggleState`).
5. **Run verification** by opening `http://localhost:<port>?scene=<TestSceneKey>` and using the test seam (and optional screenshots), not by navigating through the full game.

## Naming and Layout

- **Scene key**: `SliderTestScene`, `ToggleTestScene`, `HUDTimerTestScene`, etc. (suffix `TestScene`).
- **Path**: `src/scenes/component-tests/<ComponentName>TestScene.ts` (or `src/scenes/test-scenes/` if the repo prefers).

## Test Scene Structure

- **preload()**: Only assets needed for this component.
- **create()**: Create the component under test (centered or at fixed position), then call `setupTestSeam()` with commands that drive/query only this component.
- No game logic, no navigation to other scenes (optional "Back" or link to main menu for manual use is fine).

## Test Seam Shape

Use the same structure as other Phaser scenes: `window.__TEST__.sceneKey`, `window.__TEST__.commands`, and a `gameState()` (or equivalent) that returns component state. See **phaser-test-seam-patterns** for test seam shape and **phaser-scene-template** for the base scene/test-seam checklist. Component test scenes are a *variant*: single component + minimal harness.

## Template

See `assets/component-test-scene-template.ts` for a minimal Phaser scene with a placeholder component and example test seam commands.

## Resources

- `assets/component-test-scene-template.ts` - Template for new component test scenes
- `references/why-component-test-scenes.md` - Rationale for isolation and faster feedback
- **phaser-test-seam-patterns** - Test seam discovery and commands
- **phaser-scene-template** - Base scene lifecycle and test seam checklist
