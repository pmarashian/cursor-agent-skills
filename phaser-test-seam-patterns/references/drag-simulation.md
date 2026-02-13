# Phaser Drag Simulation Guide

## Overview

Drag simulation is essential for testing Phaser UI components that use pointer events (`pointerdown`, `pointermove`, `pointerup`). Programmatic value setting bypasses the drag interaction flow, so errors that only occur during dragging cannot be reproduced without proper simulation.

## Two Approaches

### Approach 1: Test Seam Drag Commands (Recommended)

**Best for**: Phaser games with test seams, automated testing, reproducible drag sequences

**Advantages:**
- Works entirely through test seam (no external tools needed)
- Can simulate smooth drags with configurable steps
- Reproduces exact drag interaction flow
- Can be called from agent-browser eval commands
- No coordinate calculation needed

**Usage:**
```bash
# Drag music slider from 0% to 100% with 10 steps
agent-browser eval "window.__TEST__.commands.simulateDragSlider('music', 0, 1, 10)"

# Drag SFX slider from 50% to 25% with 5 steps
agent-browser eval "window.__TEST__.commands.simulateDragSlider('sfx', 0.5, 0.25, 5)"
```

**Implementation Details:**
- Simulates `pointerdown` on handle
- Triggers multiple `pointermove` events with intermediate positions
- Calls `updateSliderValue()` for each step
- Simulates `pointerup` at end
- Returns final value and success status

### Approach 2: Agent-Browser Mouse Commands

**Best for**: Testing without test seams, more realistic browser-level simulation

**Advantages:**
- Uses native browser mouse events
- More realistic simulation
- Works with any Phaser scene
- Can test actual pointer event handling

**Challenges:**
- Requires calculating screen coordinates
- Need to account for canvas scaling/positioning
- More complex to script
- Must account for Phaser.Scale.FIT mode

**Usage:**
```bash
# Get slider handle position (via test seam)
HANDLE_POS=$(agent-browser eval "window.__TEST__.commands.getMusicSliderHandlePosition()" --json)

# Extract coordinates (example - adjust based on actual JSON structure)
START_X=$(echo $HANDLE_POS | jq -r '.x')
START_Y=$(echo $HANDLE_POS | jq -r '.y')

# Calculate end position (example: move 100 pixels right)
END_X=$((START_X + 100))

# Simulate drag sequence
agent-browser mouse move $START_X $START_Y
agent-browser mouse down left
agent-browser mouse move $((START_X + 20)) $START_Y  # Intermediate step 1
agent-browser mouse move $((START_X + 40)) $START_Y  # Intermediate step 2
agent-browser mouse move $((START_X + 60)) $START_Y  # Intermediate step 3
agent-browser mouse move $((START_X + 80)) $START_Y  # Intermediate step 4
agent-browser mouse move $END_X $START_Y             # Final position
agent-browser mouse up left
```

## Coordinate Considerations

### Scene Coordinates vs Screen Coordinates

**Scene Coordinates:**
- Phaser game objects use scene coordinates
- Slider positions are in scene coordinate space
- Test seam commands use scene coordinates

**Screen Coordinates:**
- Browser viewport uses screen coordinates
- Canvas may be scaled/positioned in viewport
- Agent-browser mouse commands use screen coordinates
- Need to convert scene coords to screen coords

### Phaser.Scale.FIT Mode

When using `Phaser.Scale.FIT`:
- Canvas is scaled to fit viewport while maintaining aspect ratio
- Canvas may have letterboxing (black bars)
- Need to account for canvas offset and scale

**Conversion Example:**
```javascript
// Get canvas element and its transform
const canvas = document.querySelector('canvas');
const rect = canvas.getBoundingClientRect();

// Convert scene X to screen X
const screenX = rect.left + (sceneX * canvas.width / gameWidth);

// Convert scene Y to screen Y  
const screenY = rect.top + (sceneY * canvas.height / gameHeight);
```

## Best Practices

### 1. Use Test Seam When Available

**Preferred approach:**
```bash
# Simple and reliable
agent-browser eval "window.__TEST__.commands.simulateDragSlider('music', 0, 1, 10)"
```

**Why:**
- No coordinate conversion needed
- Works regardless of canvas scaling
- Reproduces exact interaction flow
- Easier to script and maintain

### 2. Use Appropriate Step Count

**Too few steps:**
- May miss intermediate states
- Doesn't simulate smooth drag

**Too many steps:**
- Slower execution
- Unnecessary overhead

**Recommended:**
- 5-10 steps for most cases
- 20+ steps for very smooth drags
- 2-3 steps for quick tests

### 3. Test Edge Cases

**Always test:**
- 0% to 100% (full range)
- 100% to 0% (reverse drag)
- Rapid drags (few steps)
- Slow drags (many steps)
- Edge positions (0%, 100%)

**Example:**
```bash
# Test full range
agent-browser eval "window.__TEST__.commands.simulateDragSlider('music', 0, 1, 10)"

# Test reverse drag
agent-browser eval "window.__TEST__.commands.simulateDragSlider('music', 1, 0, 10)"

# Test rapid drag
agent-browser eval "window.__TEST__.commands.simulateDragSlider('music', 0, 1, 3)"

# Test slow drag
agent-browser eval "window.__TEST__.commands.simulateDragSlider('music', 0, 1, 20)"
```

### 4. Verify During Drag

**Check intermediate values:**
```bash
# Drag and check value at each step
agent-browser eval "
  window.__TEST__.commands.simulateDragSlider('music', 0, 1, 5);
  window.__TEST__.commands.getMusicVolume();
"
```

**Check UI updates:**
```bash
# Drag and verify display text updates
agent-browser eval "
  window.__TEST__.commands.simulateDragSlider('music', 0, 1, 10);
  window.__TEST__.commands.getMusicVolumeText();
"
```

## Troubleshooting

### Issue: Drag doesn't trigger

**Symptoms:**
- Value doesn't change
- UI doesn't update
- No errors in console

**Solutions:**
1. Verify slider exists: `window.__TEST__.commands.getMusicSliderHandlePosition()`
2. Check scene is active: `window.__TEST__.sceneKey === 'Settings'`
3. Verify test seam is available: `window.__TEST__?.commands?.simulateDragSlider`

### Issue: Drag updates value but not UI

**Symptoms:**
- Settings value changes
- Slider handle/fill doesn't move
- Display text doesn't update

**Solutions:**
1. Check slider references exist in scene
2. Verify `updateSliderValue` is being called
3. Check for errors in console
4. Ensure slider was created before test seam setup

### Issue: Coordinate conversion problems

**Symptoms:**
- Mouse commands don't hit correct position
- Drag starts in wrong location

**Solutions:**
1. Use test seam commands instead (no conversion needed)
2. Get handle position via test seam first
3. Account for canvas scaling and offset
4. Use browser DevTools to inspect canvas position

### Issue: Drag is too fast/slow

**Symptoms:**
- UI updates don't match expected behavior
- Missing intermediate states

**Solutions:**
1. Adjust step count (more steps = slower drag)
2. Add delays between steps (if needed)
3. Verify drag simulation calls `updateSliderValue` for each step

## Examples

### Example 1: Basic Drag Test

```bash
# Navigate to settings
agent-browser eval "window.__TEST__.commands.clickSettings()"
agent-browser wait 500

# Drag music slider from 0% to 100%
agent-browser eval "window.__TEST__.commands.simulateDragSlider('music', 0, 1, 10)"

# Verify final value
agent-browser eval "window.__TEST__.commands.getMusicVolume()"
```

### Example 2: Edge Case Testing

```bash
# Test minimum value
agent-browser eval "window.__TEST__.commands.simulateDragSlider('music', 1, 0, 5)"

# Test maximum value
agent-browser eval "window.__TEST__.commands.simulateDragSlider('music', 0, 1, 5)"

# Test rapid change
agent-browser eval "window.__TEST__.commands.simulateDragSlider('sfx', 0.5, 0.8, 2)"
```

### Example 3: Both Sliders

```bash
# Test music slider
agent-browser eval "window.__TEST__.commands.simulateDragSlider('music', 0, 1, 10)"

# Test SFX slider
agent-browser eval "window.__TEST__.commands.simulateDragSlider('sfx', 0, 1, 10)"
```

### Example 4: Pixel-Based Drag

```bash
# Get slider track info
TRACK_INFO=$(agent-browser eval "window.__TEST__.commands.getMusicSliderHandlePosition()" --json)

# Extract track bounds
TRACK_X=$(echo $TRACK_INFO | jq -r '.trackX')
TRACK_WIDTH=$(echo $TRACK_INFO | jq -r '.trackWidth')
TRACK_Y=$(echo $TRACK_INFO | jq -r '.trackY')

# Calculate start and end positions
START_X=$((TRACK_X - TRACK_WIDTH / 2 + 12))  # Left edge + handle radius
END_X=$((TRACK_X + TRACK_WIDTH / 2 - 12))   # Right edge - handle radius

# Drag from start to end
agent-browser eval "window.__TEST__.commands.simulateDragFromTo('music', $START_X, $END_X, 10)"
```

## Related Resources

- `common-commands.md` - Full command reference
- `phaser-test-seam-patterns/SKILL.md` - Main skill documentation
- `agent-browser/SKILL.md` - Mouse command patterns
