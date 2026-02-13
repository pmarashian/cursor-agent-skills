---
name: phaser-hud-component-patterns
description: Reusable patterns for implementing HUD elements in Phaser games, including positioning, styling, and test seam integration. Use when creating HUD components, timer displays, score counters, or health bars. Provides templates and patterns for consistent HUD implementation.
---

# Phaser HUD Component Patterns

## Overview

Reusable patterns for implementing HUD elements in Phaser games. Accelerate HUD implementation and ensure consistency.

## HUD Background Pattern

- Use `Phaser.GameObjects.Graphics` for rounded rectangles
- Set depth to 100+ to appear above game elements
- Use semi-transparent backgrounds (alpha: 0.7-0.8)
- Position relative to camera dimensions

## Text Element Pattern

- Position text relative to HUD background
- Set depth to 101+ (above background)
- Use consistent font families and sizes
- Update text in real-time via `setText()`

## Test Seam Integration

- Expose HUD properties: colors, positions, text content
- Include visual state accessors: `getTimerColor()`, `getCoinCount()`
- Document HUD structure in test seam

## Common HUD Elements

See `references/hud-elements.md` for patterns:
- Timer display (MM:SS format)
- Score/coin counter
- Health bar (if applicable)
- Minimap (if applicable)

## Test in Isolation

Before or while integrating a HUD component into GameScene, create a standalone component test scene that only renders this HUD element (e.g. `HUDTimerTestScene`). Test layout, test seam, and behavior there. Use the **phaser-component-test-scenes** skill for workflow and template.

## Template

See `assets/hud-template.ts` for HUD component template.

## Resources

- `references/hud-elements.md` - Timer display, score counter, health bar patterns
- `assets/hud-template.ts` - Template for HUD components
- **phaser-component-test-scenes** - Standalone test scenes for UI components
