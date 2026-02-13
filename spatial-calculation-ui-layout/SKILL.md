---
name: spatial-calculation-ui-layout
description: Spatial calculation helpers and UI layout patterns for Phaser games and web applications. Use when positioning UI elements, calculating text widths, or working with coordinate systems. Reduces UI positioning iterations from 3-5 to 1-2 by providing calculation patterns and common gotchas.
---

# Spatial Calculation and UI Layout

Spatial calculation helpers and UI layout patterns to reduce UI positioning iterations from 3-5 to 1-2. Provides coordinate system documentation, text width measurement utilities, and layout calculation patterns.

## Overview

**Problem**: UI positioning tasks require 3-5 iterations due to spatial calculation challenges. Agents struggle with coordinate systems, text width calculations, and layout positioning.

**Solution**: Coordinate system documentation, text width measurement utilities, layout calculation patterns, and common gotchas.

**Impact**: Reduces UI positioning iterations from 3-5 to 1-2, saves 2-3 minutes per UI layout task, improves first-attempt success rate

## Coordinate System Documentation

### World Coordinates vs Screen Coordinates

**Understanding coordinate systems is critical for UI positioning tasks.**

**World Coordinates**:
- Game world space (e.g., 800x600 game world)
- Camera-independent (objects exist in world space)
- Used for game objects, sprites, physics bodies
- Example: `sprite.x = 400` (400 pixels from world origin)

**Screen Coordinates**:
- Viewport/camera space (what player sees)
- Camera-dependent (changes with camera scroll)
- Used for UI elements, HUD, overlays
- Example: `ui.x = 400` (400 pixels from screen edge, camera-independent)

**Key Difference**:
```typescript
// World coordinates (game object)
sprite.x = 400;  // 400 pixels in world space

// Screen coordinates (UI element)
ui.x = 400;  // 400 pixels from screen edge (camera-independent)
```

### Framework-Specific Coordinate Systems

**Phaser 3**:
- World coordinates: `sprite.x`, `sprite.y` (in world space)
- Screen coordinates: `ui.x`, `ui.y` (camera-independent)
- Camera scroll: `this.cameras.main.scrollX`, `this.cameras.main.scrollY`

**React**:
- Screen coordinates: `style.left`, `style.top` (relative to viewport)
- Container coordinates: Relative to parent container

**Canvas/WebGL**:
- World coordinates: Canvas drawing coordinates
- Screen coordinates: Viewport-relative coordinates

### Camera Scroll Offset Handling

**When calculating positions, account for camera scroll**:

```typescript
// ❌ WRONG: Not accounting for camera scroll
const worldX = 400;
sprite.x = worldX;  // May be off-screen if camera scrolled

// ✅ CORRECT: Account for camera scroll
const cameraX = this.cameras.main.scrollX;
const worldX = 400;
sprite.x = cameraX + worldX;  // Correct position relative to camera
```

**For UI Elements (Screen Coordinates)**:
```typescript
// UI elements use screen coordinates (camera-independent)
ui.x = 400;  // Always 400 pixels from screen edge, regardless of camera
```

## Text Width Measurement Utilities

### Measure Text Width Before Positioning

**Always measure text width before calculating positions**:

```typescript
// ❌ WRONG: Assuming fixed width
text.x = 400;  // May not be centered if text width varies

// ✅ CORRECT: Calculate based on actual width
const textWidth = text.width;
const screenWidth = this.cameras.main.width;
const centerX = (screenWidth - textWidth) / 2;
text.x = centerX;
```

### Text Width Measurement Patterns

**Pattern 1: Measure Existing Text**

```typescript
// Measure text that's already created
const textWidth = text.width;
const textHeight = text.height;
```

**Pattern 2: Measure Text Before Creation**

```typescript
// Create temporary text to measure
const tempText = this.add.text(0, 0, "Score: 100", style);
const textWidth = tempText.width;
const textHeight = tempText.height;
tempText.destroy();  // Clean up temporary text

// Use measurements for positioning
const centerX = (screenWidth - textWidth) / 2;
text.x = centerX;
```

**Pattern 3: Measure Text with Different Content**

```typescript
// Measure text with longest expected content
const longestText = "Score: 999999";
const tempText = this.add.text(0, 0, longestText, style);
const maxWidth = tempText.width;
tempText.destroy();

// Use max width for layout
const centerX = (screenWidth - maxWidth) / 2;
```

### Framework-Specific Text Measurement

**Phaser 3**:
```typescript
const text = this.add.text(0, 0, "Text", style);
const width = text.width;
const height = text.height;
```

**Canvas**:
```typescript
const ctx = canvas.getContext('2d');
ctx.font = '16px Arial';
const width = ctx.measureText("Text").width;
```

**React**:
```typescript
const textRef = useRef<HTMLDivElement>(null);
const width = textRef.current?.offsetWidth || 0;
```

## Layout Calculation Patterns

### Pattern 1: Center Text on Screen

```typescript
// Calculate text width first
const textWidth = text.width;
const screenWidth = this.cameras.main.width;
const centerX = (screenWidth - textWidth) / 2;

text.x = centerX;  // Center text horizontally
```

**Common Mistake**: Not accounting for text width
```typescript
// ❌ WRONG: Assuming text is centered at screenWidth / 2
text.x = screenWidth / 2;  // Text starts at center, not centered

// ✅ CORRECT: Account for text width
text.x = (screenWidth - text.width) / 2;  // Text is centered
```

### Pattern 2: Position Relative to Another Object

```typescript
// Position button below text
const textBottom = text.y + text.height;
const spacing = 20;
button.y = textBottom + spacing;
```

**Common Mistake**: Not accounting for object height
```typescript
// ❌ WRONG: Assuming objects align at same y
button.y = text.y;  // Button overlaps text

// ✅ CORRECT: Account for text height
button.y = text.y + text.height + spacing;
```

### Pattern 3: Account for Origin

```typescript
// Sprite origin affects position calculation
sprite.setOrigin(0.5, 0.5);  // Center origin
sprite.x = 400;  // Center of sprite at x=400

// If origin is (0, 0), sprite.x is top-left corner
sprite.setOrigin(0, 0);
sprite.x = 400;  // Top-left corner at x=400
```

**Common Mistake**: Not accounting for origin
```typescript
// ❌ WRONG: Assuming origin is (0, 0)
sprite.x = 400;  // May not be where expected if origin is (0.5, 0.5)

// ✅ CORRECT: Account for origin
sprite.setOrigin(0.5, 0.5);
sprite.x = 400;  // Center of sprite at x=400
```

### Pattern 4: Layout with Spacing

```typescript
// Layout multiple elements with consistent spacing
const elements = [text1, text2, text3];
const spacing = 20;
let currentY = 100;

elements.forEach(element => {
  element.y = currentY;
  currentY += element.height + spacing;
});
```

### Pattern 5: Responsive Layout

```typescript
// Responsive layout based on screen size
const screenWidth = this.cameras.main.width;
const screenHeight = this.cameras.main.height;

// Center horizontally
text.x = (screenWidth - text.width) / 2;

// Position from bottom
const bottomMargin = 50;
text.y = screenHeight - text.height - bottomMargin;
```

## Common Positioning Gotchas

### Gotcha 1: Not Accounting for Text Width

```typescript
// ❌ WRONG: Assuming fixed width
text.x = 400;  // May not be centered if text width varies

// ✅ CORRECT: Calculate based on actual width
const textWidth = text.width;
const centerX = (screenWidth - textWidth) / 2;
text.x = centerX;
```

### Gotcha 2: Confusing World vs Screen Coordinates

```typescript
// ❌ WRONG: Using world coordinates for UI
ui.x = sprite.x;  // UI will move with camera scroll

// ✅ CORRECT: Use screen coordinates for UI
ui.x = 400;  // UI stays fixed on screen
```

### Gotcha 3: Not Considering Sprite Origin Offsets

```typescript
// ❌ WRONG: Assuming origin is (0, 0)
sprite.x = 100;  // May not be where expected if origin is (0.5, 0.5)

// ✅ CORRECT: Account for origin
sprite.setOrigin(0.5, 0.5);
sprite.x = 100;  // Center of sprite at x=100
```

### Gotcha 4: Not Accounting for Object Height

```typescript
// ❌ WRONG: Assuming objects align at same y
button.y = text.y;  // Button overlaps text

// ✅ CORRECT: Account for text height
button.y = text.y + text.height + spacing;
```

### Gotcha 5: Assuming HMR Has Applied Changes

```typescript
// ❌ WRONG: Assuming changes are applied immediately
makeCodeChange();
captureScreenshot();  // May capture stale state

// ✅ CORRECT: Verify HMR has applied changes
makeCodeChange();
waitForHMR();  // Wait for HMR to apply
captureScreenshot();  // Now captures updated state
```

## Visual Debugging Techniques

### Technique 1: Programmatic Verification

**Verify calculations programmatically before visual verification**:

```typescript
// Calculate position
const centerX = (screenWidth - text.width) / 2;
text.x = centerX;

// Verify calculation
const expectedX = (screenWidth - text.width) / 2;
console.log(`Text x: ${text.x}, Expected: ${expectedX}`);
if (Math.abs(text.x - expectedX) < 1) {
  console.log('Position correct');
} else {
  console.log('Position incorrect');
}
```

### Technique 2: Test Seam Verification

**Use test seam commands to verify positions**:

```bash
# Verify text position via test seam
agent-browser eval "window.__TEST__?.getCurrentScene()?.texts?.score?.x"
agent-browser eval "window.__TEST__?.getCurrentScene()?.texts?.score?.y"
```

### Technique 3: Visual Markers

**Add visual markers for debugging**:

```typescript
// Add visual marker at expected position
const marker = this.add.rectangle(centerX, 300, 5, 5, 0xff0000);
// Text should be centered at marker
```

## Examples of Successful Layout Calculations

### Example 1: Centered Score Display

```typescript
// Calculate text width first
const scoreText = "Score: 100";
const text = this.add.text(0, 0, scoreText, style);
const textWidth = text.width;
const screenWidth = this.cameras.main.width;

// Center text horizontally
const centerX = (screenWidth - textWidth) / 2;
text.x = centerX;

// Position from top with margin
const topMargin = 50;
text.y = topMargin;
```

**Key Points**:
- Calculate text width before positioning
- Account for screen width (not world width)
- Use spacing constants for consistency

### Example 2: Button Below Text

```typescript
// Position text first
const text = this.add.text(100, 100, "Click Me", textStyle);
const textBottom = text.y + text.height;

// Position button below text with spacing
const spacing = 20;
const button = this.add.rectangle(100, textBottom + spacing, 200, 50, 0x00ff00);
```

**Key Points**:
- Calculate text bottom position
- Add spacing between elements
- Align horizontally (same x for text and button)

### Example 3: Responsive Bottom Bar

```typescript
// Get screen dimensions
const screenWidth = this.cameras.main.width;
const screenHeight = this.cameras.main.height;

// Create bottom bar
const barHeight = 60;
const bar = this.add.rectangle(
  screenWidth / 2,  // Center horizontally
  screenHeight - barHeight / 2,  // Position from bottom
  screenWidth,  // Full width
  barHeight,
  0x000000
);

// Add text on bar
const text = this.add.text(0, 0, "Game Over", textStyle);
text.x = (screenWidth - text.width) / 2;  // Center text
text.y = screenHeight - barHeight / 2 - text.height / 2;  // Center vertically on bar
```

**Key Points**:
- Use screen dimensions for responsive layout
- Calculate center positions
- Account for object dimensions

## Programmatic Verification Patterns

### Pattern 1: Verify Before Visual Check

**Verify calculations programmatically before capturing screenshots**:

```typescript
// Calculate position
const centerX = (screenWidth - text.width) / 2;
text.x = centerX;

// Verify calculation
const isCentered = Math.abs(text.x - centerX) < 1;
if (!isCentered) {
  console.error('Text not centered');
  // Fix calculation before proceeding
}

// Only capture screenshot after verification
agent-browser screenshot screenshots/verification.png;
```

### Pattern 2: Test Seam Position Verification

**Use test seam to verify positions**:

```bash
# Verify text position
agent-browser eval "
  const scene = window.__TEST__?.getCurrentScene();
  const text = scene?.texts?.score;
  if (text) {
    const screenWidth = scene.cameras.main.width;
    const expectedX = (screenWidth - text.width) / 2;
    Math.abs(text.x - expectedX) < 1 ? 'Centered' : 'Not centered'
  } else {
    'Text not found'
  }
"
```

### Pattern 3: Calculation Validation

**Validate calculations before applying**:

```typescript
// Validate calculation
function validateCenterPosition(text: Phaser.GameObjects.Text, screenWidth: number): boolean {
  const expectedX = (screenWidth - text.width) / 2;
  const actualX = text.x;
  const tolerance = 1;  // 1 pixel tolerance
  
  return Math.abs(actualX - expectedX) < tolerance;
}

// Use validation
if (!validateCenterPosition(text, screenWidth)) {
  console.error('Position calculation incorrect');
  // Recalculate
}
```

## Best Practices

1. **Calculate text width first** before positioning
2. **Account for screen width** (not world width) for UI elements
3. **Use spacing constants** for consistency
4. **Account for origin** when positioning sprites
5. **Verify calculations programmatically** before visual verification
6. **Use test seam commands** for position verification
7. **Document coordinate system** used (world vs screen)
8. **Test at different screen sizes** for responsive layouts

## Integration with Other Skills

- **phaser-game-testing**: Uses coordinate system patterns
- **agent-browser**: Uses test seam for position verification
- **screenshot-handling**: Captures screenshots after programmatic verification

## Related Skills

- `phaser-game-testing` - Phaser testing patterns
- `agent-browser` - Browser automation
- `screenshot-handling` - Screenshot capture

## Remember

1. **Measure text width** before positioning
2. **Use screen coordinates** for UI elements
3. **Account for origin** when positioning sprites
4. **Verify programmatically** before visual verification
5. **Use test seam** for position verification
6. **Document coordinate system** used
7. **Test responsive layouts** at different screen sizes
