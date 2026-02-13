---
name: visual-sizing-heuristics
description: Heuristics for visual sizing tasks to reduce refinement iterations. Use when making sprites larger, adjusting UI element sizes, or working with proportional relationships. Provides initial sizing formulas, proportional calculations, and framework-specific patterns. Reduces refinement iterations by 50-70%.
---

# Visual Sizing Heuristics

Heuristics for visual sizing tasks to reduce refinement iterations by 50-70%. Provides initial sizing formulas, proportional relationship calculations, and framework-specific sizing patterns.

## Overview

**Problem**: Visual sizing tasks (e.g., "make sprite larger") require refinement iterations because agents start with conservative values. Better initial heuristics could eliminate refinement cycles.

**Solution**: Initial sizing formulas for "make X more visible" tasks (20-30% increase vs minimum), proportional relationship calculations, and framework-specific sizing patterns.

**Impact**: Reduces refinement iterations by 50-70%, saves 15-30 seconds per visual sizing task, improves first-attempt success rate

## Initial Sizing Formulas

### "Make X More Visible" Tasks

**For tasks like "make sprite larger" or "make text more visible"**:

**Formula**: Start with 25-30% increase rather than minimum suggested value

```typescript
// ❌ WRONG: Starting with minimum suggested value
const suggestedSize = 18;  // Minimum suggested
sprite.setScale(suggestedSize / 32);  // Too conservative

// ✅ CORRECT: Start with 25-30% increase
const suggestedSize = 18;
const initialSize = suggestedSize * 1.25;  // 25% increase
sprite.setScale(initialSize / 32);
```

**Example**: If suggested range is 18/32-20/32, start with 24/32 to reduce iterations.

```typescript
// Suggested range: 18/32 to 20/32
const minSize = 18;
const maxSize = 20;

// ❌ WRONG: Start with minimum
sprite.setScale(minSize / 32);  // 18/32 - too small

// ✅ CORRECT: Start with 25% above minimum
const initialSize = minSize * 1.25;  // 22.5, round to 24
sprite.setScale(24 / 32);  // 24/32 - better initial value
```

### Proportional Relationship Calculations

**Calculate proportional relationships (sprite-to-tile size ratios)**:

```typescript
// Calculate sprite size relative to tile size
const tileSize = 32;
const spriteToTileRatio = 0.75;  // Sprite should be 75% of tile size
const spriteSize = tileSize * spriteToTileRatio;  // 24 pixels

sprite.setScale(spriteSize / sprite.texture.width);
```

**Common Proportional Relationships**:

| Element Type | Typical Ratio to Tile Size |
|-------------|---------------------------|
| Player sprite | 0.75 - 0.9 (75-90% of tile) |
| Enemy sprite | 0.6 - 0.8 (60-80% of tile) |
| Item sprite | 0.4 - 0.6 (40-60% of tile) |
| UI icon | 0.3 - 0.5 (30-50% of tile) |

**Example**:

```typescript
// Tile size: 32 pixels
const tileSize = 32;

// Player sprite should be 80% of tile size
const playerRatio = 0.8;
const playerSize = tileSize * playerRatio;  // 25.6 pixels

// Enemy sprite should be 60% of tile size
const enemyRatio = 0.6;
const enemySize = tileSize * enemyRatio;  // 19.2 pixels
```

## Framework-Specific Sizing Patterns

### Phaser 3 Sizing Patterns

**Pattern 1: Scale-Based Sizing**

```typescript
// Set scale based on desired size
const desiredSize = 48;  // Desired size in pixels
const textureWidth = sprite.texture.width;  // Original texture width
const scale = desiredSize / textureWidth;

sprite.setScale(scale);
```

**Pattern 2: Display Size Sizing**

```typescript
// Set display size directly
const desiredWidth = 48;
const desiredHeight = 48;

sprite.setDisplaySize(desiredWidth, desiredHeight);
```

**Pattern 3: Proportional Scaling**

```typescript
// Scale proportionally to tile size
const tileSize = 32;
const ratio = 0.75;  // 75% of tile size
const targetSize = tileSize * ratio;

sprite.setScale(targetSize / sprite.texture.width);
```

### React/Web Sizing Patterns

**Pattern 1: CSS-Based Sizing**

```typescript
// Use CSS for sizing
const style = {
  width: '48px',
  height: '48px'
};

<img src={spriteUrl} style={style} />
```

**Pattern 2: Responsive Sizing**

```typescript
// Responsive sizing based on viewport
const viewportWidth = window.innerWidth;
const baseSize = 48;
const scale = viewportWidth / 1920;  // Scale from 1920px base
const size = baseSize * scale;

const style = {
  width: `${size}px`,
  height: `${size}px`
};
```

### Canvas/WebGL Sizing Patterns

**Pattern 1: Canvas Drawing Size**

```typescript
// Draw at specific size
const desiredSize = 48;
const image = new Image();
image.onload = () => {
  ctx.drawImage(image, x, y, desiredSize, desiredSize);
};
```

## When to Use Aggressive vs Conservative Initial Values

### Use Aggressive Initial Values When

**Use aggressive initial values (25-30% increase) when**:
- Task explicitly says "make larger" or "more visible"
- User feedback indicates element is too small
- Element needs to stand out (UI buttons, important sprites)
- Refinement is acceptable (can reduce if too large)

**Example**:

```typescript
// Task: "Make player sprite larger"
const currentSize = 32;
const aggressiveSize = currentSize * 1.3;  // 30% increase
sprite.setScale(aggressiveSize / sprite.texture.width);
```

### Use Conservative Initial Values When

**Use conservative initial values (10-15% increase) when**:
- Task says "slightly larger" or "adjust size"
- Element is already visible but needs fine-tuning
- Precise sizing is critical (UI alignment, grid-based layouts)
- Risk of making element too large is high

**Example**:

```typescript
// Task: "Slightly increase button size"
const currentSize = 40;
const conservativeSize = currentSize * 1.15;  // 15% increase
button.setScale(conservativeSize / button.texture.width);
```

## Formulas for Common Visual Scaling Scenarios

### Scenario 1: "Make Sprite Larger"

**Formula**: Current size × 1.25-1.3 (25-30% increase)

```typescript
const currentSize = sprite.width;
const newSize = currentSize * 1.3;  // 30% increase
sprite.setScale(newSize / sprite.texture.width);
```

### Scenario 2: "Make Sprite More Visible"

**Formula**: Minimum visible size × 1.25 (25% above minimum)

```typescript
const minVisibleSize = 16;  // Minimum size to be visible
const visibleSize = minVisibleSize * 1.25;  // 20 pixels
sprite.setScale(visibleSize / sprite.texture.width);
```

### Scenario 3: "Make Sprite Proportional to Tile"

**Formula**: Tile size × ratio (0.6-0.9 depending on element type)

```typescript
const tileSize = 32;
const ratio = 0.75;  // 75% of tile size
const spriteSize = tileSize * ratio;  // 24 pixels
sprite.setScale(spriteSize / sprite.texture.width);
```

### Scenario 4: "Make UI Element Larger"

**Formula**: Current size × 1.2-1.3 (20-30% increase)

```typescript
const currentWidth = button.width;
const currentHeight = button.height;
const newWidth = currentWidth * 1.25;  // 25% increase
const newHeight = currentHeight * 1.25;
button.setDisplaySize(newWidth, newHeight);
```

## Patterns for Sprite-to-Tile Size Relationships

### Pattern 1: Player Sprite Sizing

**Player sprites should be 75-90% of tile size**:

```typescript
const tileSize = 32;
const playerRatio = 0.8;  // 80% of tile size
const playerSize = tileSize * playerRatio;  // 25.6 pixels

playerSprite.setScale(playerSize / playerSprite.texture.width);
```

### Pattern 2: Enemy Sprite Sizing

**Enemy sprites should be 60-80% of tile size**:

```typescript
const tileSize = 32;
const enemyRatio = 0.7;  // 70% of tile size
const enemySize = tileSize * enemyRatio;  // 22.4 pixels

enemySprite.setScale(enemySize / enemySprite.texture.width);
```

### Pattern 3: Item Sprite Sizing

**Item sprites should be 40-60% of tile size**:

```typescript
const tileSize = 32;
const itemRatio = 0.5;  // 50% of tile size
const itemSize = tileSize * itemRatio;  // 16 pixels

itemSprite.setScale(itemSize / itemSprite.texture.width);
```

### Pattern 4: UI Icon Sizing

**UI icons should be 30-50% of tile size**:

```typescript
const tileSize = 32;
const iconRatio = 0.4;  // 40% of tile size
const iconSize = tileSize * iconRatio;  // 12.8 pixels

iconSprite.setScale(iconSize / iconSprite.texture.width);
```

## Guide Initial Value Selection to Reduce Refinement Cycles

### Decision Tree for Initial Value Selection

**Step 1: Identify Task Type**
- "Make larger" → Use aggressive (25-30% increase)
- "Slightly larger" → Use conservative (10-15% increase)
- "Make visible" → Use 25% above minimum visible size
- "Proportional to X" → Use proportional calculation

**Step 2: Check Context**
- UI element → Use 20-30% increase
- Game sprite → Use proportional to tile size
- Text element → Use 15-25% increase

**Step 3: Select Initial Value**
- Aggressive: Current × 1.25-1.3
- Conservative: Current × 1.1-1.15
- Proportional: Tile size × ratio

**Step 4: Apply and Verify**
- Apply initial value
- Use screenshot analysis to verify
- Adjust if needed (but initial value should be close)

### Example: Reducing Refinement Cycles

**Before (Conservative Approach)**:
```
Iteration 1: Set to 18/32 (minimum) → Too small
Iteration 2: Set to 20/32 → Still too small
Iteration 3: Set to 22/32 → Still too small
Iteration 4: Set to 24/32 → Good
Total: 4 iterations
```

**After (Aggressive Approach)**:
```
Iteration 1: Set to 24/32 (25% above minimum) → Good
Total: 1 iteration
```

**Time Saved**: 3 iterations (75% reduction)

## When to Use Screenshot Analysis Earlier in the Process

### Use Screenshot Analysis Early When

**Use screenshot analysis earlier when**:
- Initial value is uncertain
- Multiple size options are possible
- Visual verification is critical
- Refinement cycles are expensive

**Pattern**:

```bash
# Step 1: Apply initial aggressive value
sprite.setScale(24 / 32);

# Step 2: Capture screenshot immediately
agent-browser screenshot screenshots/initial-size.png

# Step 3: Analyze screenshot
# If too large: Reduce to 22/32
# If too small: Increase to 26/32
# If good: Done

# Step 4: Apply adjustment if needed
sprite.setScale(adjustedSize / 32);
agent-browser screenshot screenshots/final-size.png
```

### Early Screenshot Analysis Workflow

**Workflow for early screenshot analysis**:

1. **Apply initial aggressive value** (25-30% increase)
2. **Capture screenshot immediately**
3. **Analyze screenshot** (too large, too small, or good)
4. **Adjust if needed** (one refinement cycle)
5. **Verify final size**

**Benefits**:
- Reduces refinement cycles
- Provides visual feedback early
- Allows quick adjustment
- Improves first-attempt success rate

## Best Practices

1. **Start with aggressive values** for "make larger" tasks (25-30% increase)
2. **Use proportional calculations** for sprite-to-tile relationships
3. **Apply framework-specific patterns** (Phaser scale, React CSS, Canvas drawImage)
4. **Use screenshot analysis early** when initial value is uncertain
5. **Document sizing decisions** in progress.txt
6. **Test at different screen sizes** for responsive layouts
7. **Consider context** (UI vs game sprite vs text)

## Integration with Other Skills

- **spatial-calculation-ui-layout**: Uses sizing patterns for layout calculations
- **screenshot-handling**: Uses screenshots for size verification
- **phaser-game-testing**: Uses test seam for size verification

## Related Skills

- `spatial-calculation-ui-layout` - Layout calculation patterns
- `screenshot-handling` - Screenshot capture for verification
- `phaser-game-testing` - Phaser testing patterns

## Remember

1. **Start aggressive** for "make larger" tasks (25-30% increase)
2. **Use proportional calculations** for sprite-to-tile relationships
3. **Apply framework patterns** (Phaser scale, React CSS, Canvas)
4. **Use screenshot analysis early** when uncertain
5. **Document sizing decisions** for future reference
6. **Test responsive layouts** at different screen sizes
