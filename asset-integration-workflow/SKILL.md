---
name: asset-integration-workflow
description: Integrate external assets (PixelLab, ElevenLabs) into projects with proper error handling, fallback mechanisms, and testing patterns. Use when generating assets, downloading files, or integrating assets into game code. Standardizes workflow and reduces integration time by 25-35%.
---

# Asset Integration Workflow

Integrate external assets (PixelLab, ElevenLabs) into projects with proper error handling, fallback mechanisms, and testing patterns. Standardizes workflow and reduces integration time by 25-35%.

## Overview

Complete workflow for:
1. Asset generation (using async-operation-handler)
2. Asset organization (following project conventions)
3. Integration (preload() method, error handling)
4. Testing (browser verification, fallback mechanisms)

## Workflow

### Step 1: Asset Generation

**Use async-operation-handler for generation:**

```typescript
// Generate asset
const { character_id } = await mcp_pixellab_create_character({
  description: "cute wizard with blue robes",
  n_directions: 8,
  size: 48
});

// Wait for completion with exponential backoff
const character = await pollAsyncOperation(
  () => mcp_pixellab_get_character({ character_id }),
  { maxWait: 300000, respectETA: true }
);
```

**Work on integration code while waiting:**

```typescript
// While waiting for asset generation:
// 1. Prepare integration code
const integrationCode = prepareIntegrationCode();

// 2. Check existing assets
const existingAssets = checkExistingAssets();

// 3. Poll for completion
const character = await pollAsyncOperation(...);
```

### Step 2: Asset Organization

**Follow project conventions:**

```
public/
  assets/
    sprites/
      characters/
        wizard-south.png
        wizard-north.png
      tiles/
        grass-tile.png
    audio/
      music/
        bg-music.mp3
      sfx/
        coin-collect.mp3
```

**Use descriptive file names:**

```typescript
// ✅ GOOD: Descriptive names
'wizard-south-48px.png'
'grass-tile-32px.png'
'bg-music-loop.mp3'

// ❌ BAD: Generic names
'image1.png'
'tile.png'
'music.mp3'
```

**Organize by type:**

```typescript
// Organize assets by type
const ASSET_PATHS = {
  characters: 'assets/sprites/characters/',
  tiles: 'assets/sprites/tiles/',
  audio: 'assets/audio/',
  music: 'assets/audio/music/',
  sfx: 'assets/audio/sfx/'
};
```

### Step 3: Integration

**Load assets in preload() method:**

```typescript
// scenes/PreloaderScene.ts
preload() {
  // Generated PixelLab assets
  this.load.image('wizard-south', 'https://pixellab.ai/characters/abc123/south.png');
  this.load.image('wizard-north', 'https://pixellab.ai/characters/abc123/north.png');
  this.load.image('wizard-east', 'https://pixellab.ai/characters/abc123/east.png');
  this.load.image('wizard-west', 'https://pixellab.ai/characters/abc123/west.png');
  
  // Generated tiles
  this.load.image('grass-tile', 'https://pixellab.ai/tiles/xyz789/tile.png');
  
  // Generated map objects
  this.load.image('barrel', 'https://pixellab.ai/objects/def456/object.png');
}
```

**Implement try-catch error handling:**

```typescript
preload() {
  try {
    // Load generated assets
    this.load.image('wizard-south', characterUrl);
  } catch (error) {
    console.warn('Failed to load wizard sprite, using fallback');
    this.load.image('wizard-south', 'assets/fallback/wizard.png');
  }
}
```

**Add texture existence checks:**

```typescript
create() {
  // Check if texture exists before using
  if (this.textures.exists('wizard-south')) {
    this.wizard = this.add.sprite(100, 100, 'wizard-south');
  } else {
    // Use fallback
    this.wizard = this.add.rectangle(100, 100, 32, 32, 0x00ff00);
    console.warn('Wizard texture not found, using placeholder');
  }
}
```

**Provide fallback to placeholder graphics:**

```typescript
create() {
  if (this.textures.exists('wizard-south')) {
    this.wizard = this.add.sprite(100, 100, 'wizard-south');
  } else {
    // Fallback: Create placeholder rectangle
    this.wizard = this.add.rectangle(100, 100, 32, 32, 0x00ff00);
    this.wizard.setStrokeStyle(2, 0x000000);
    console.warn('Using placeholder for wizard sprite');
  }
}
```

### Step 4: Testing

**Verify asset loading in browser:**

```bash
# Open browser
agent-browser open http://localhost:3000

# Check for console errors
agent-browser console

# Verify asset loaded
agent-browser eval "window.__TEST__?.gameState()"
```

**Test fallback mechanisms:**

```typescript
// Test fallback by removing asset
// Verify placeholder appears
agent-browser eval "
  const scene = window.__TEST__?.getCurrentScene();
  scene?.textures?.exists('wizard-south')
"
```

**Check console for warnings:**

```bash
# Check console for asset loading warnings
agent-browser console | grep -i "warn\|error\|failed"
```

**Verify visual rendering:**

```bash
# Create screenshots folder first (MANDATORY)
mkdir -p screenshots/

# Take screenshot to verify visual
agent-browser screenshot screenshots/asset-verification.png
```

## Code Search Patterns for Asset References

**Verify assets are properly referenced in codebase before runtime testing.**

### Pattern 1: Search for Asset Filename

**Search for asset filename in codebase:**

```bash
# Search for asset filename
grep -r "character.png" src/
grep -r "wizard-south" src/
grep -r "grass-tile" src/

# Search with case-insensitive flag
grep -ri "character" src/

# Search in specific file types
grep -r "character.png" --include="*.ts" --include="*.js" src/
```

### Pattern 2: Search for Asset Path References

**Search for asset path patterns:**

```bash
# Search for asset path patterns
grep -r "assets/sprites" src/
grep -r "assets/audio" src/
grep -r "public/assets" src/

# Search for URL patterns (for PixelLab assets)
grep -r "pixellab.ai" src/
grep -r "https://.*\.png" src/
```

### Pattern 3: Search for Preload/Load Methods

**Search for asset loading code:**

```bash
# Search for preload methods
grep -r "preload\|load\.image\|load\.audio" src/

# Search for specific asset keys
grep -r "load\.image.*wizard" src/
grep -r "load\.audio.*music" src/
```

### Pattern 4: Verify Asset References in Code

**Check if asset is referenced in preload/initialization:**

```typescript
// Example: Verify asset is loaded in preload()
// Search for: this.load.image('asset-key', ...)
grep -r "load\.image.*asset-key" src/scenes/

// Example: Verify asset is used in create()
// Search for: this.add.sprite(..., 'asset-key')
grep -r "add\.sprite.*asset-key" src/scenes/
```

### Pattern 5: Framework-Specific Patterns

**Phaser Games:**
```bash
# Search for Phaser asset loading
grep -r "this\.load\." src/scenes/
grep -r "this\.textures\.exists" src/scenes/
grep -r "this\.add\.sprite\|this\.add\.image" src/scenes/
```

**React/Web Apps:**
```bash
# Search for React asset imports
grep -r "import.*from.*assets" src/
grep -r "require.*assets" src/
grep -r "\.png\|\.jpg\|\.mp3" src/
```

### Common Integration Points

**Check these common locations for asset references:**

1. **Preload/Initialization Methods**
   - `preload()` methods in Phaser scenes
   - `useEffect` hooks in React
   - `componentDidMount` in class components

2. **Asset Loading Code**
   - `this.load.image()` calls
   - `this.load.audio()` calls
   - `import` statements for local assets

3. **Asset Usage Code**
   - `this.add.sprite()` calls
   - `this.add.image()` calls
   - `<img src="...">` tags in React

## Runtime Verification Workflow

**CRITICAL**: Always verify assets work correctly in runtime, not just that they're referenced in code.

### Step 1: Verify Asset File Exists

**Check asset file exists in correct location:**

```bash
# Verify asset file exists
ls -la public/assets/sprites/character.png
ls -la assets/sprites/character.png
ls -la src/assets/sprites/character.png

# Check file size (should be > 0)
stat -f%z public/assets/sprites/character.png

# Verify file is readable
file public/assets/sprites/character.png
```

### Step 2: Verify Asset Referenced in Code

**Use code search patterns above to verify asset is referenced:**

```bash
# Search for asset references
grep -r "character.png" src/
grep -r "load\.image.*character" src/scenes/

# Verify asset key is used
grep -r "add\.sprite.*character" src/scenes/
```

### Step 3: Load Application in Browser

**Start dev server and open browser:**

```bash
# Start dev server (if not running)
npm run dev

# Wait for server to be ready
sleep 5

# Open browser
agent-browser open "http://localhost:5173?test=1&seed=42"
```

### Step 4: Navigate to Relevant Screen

**Navigate to screen where asset should appear:**

```bash
# For Phaser games: Navigate to scene
agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"
agent-browser wait 500

# For web apps: Navigate to route
agent-browser eval "window.location.href = '/game'"
agent-browser wait 2000
```

### Step 5: Verify Asset Displays Correctly

**Check asset is visible and functional:**

```bash
# Check if texture exists (Phaser)
agent-browser eval "
  const scene = window.__TEST__?.getCurrentScene();
  scene?.textures?.exists('character-south') || false
"

# Check if sprite is rendered (Phaser)
agent-browser eval "
  const scene = window.__TEST__?.getCurrentScene();
  const sprite = scene?.children?.getByName('character');
  sprite ? { x: sprite.x, y: sprite.y, visible: sprite.visible } : null
"

# Check DOM element exists (Web apps)
agent-browser eval "
  document.querySelector('img[src*=\"character\"]') ? true : false
"
```

### Step 6: Verify Asset Functionality

**Test asset functionality works as expected:**

```bash
# Test character movement (if applicable)
agent-browser eval "window.__TEST__.commands.movePlayerTo(100, 200)"
agent-browser eval "window.__TEST__.gameState().player"

# Test asset interaction (if applicable)
agent-browser eval "window.__TEST__.commands.interactWithAsset('character')"

# Verify game state updated correctly
agent-browser eval "window.__TEST__.gameState()"
```

### Step 7: Capture Screenshots for Validation

**Capture screenshots for visual validation:**

```bash
# Create screenshots folder first (MANDATORY)
mkdir -p screenshots/

# Capture screenshot
agent-browser screenshot screenshots/asset-integration-verification.png

# Capture multiple angles if needed
agent-browser eval "window.__TEST__.commands.rotateCamera(45)"
agent-browser screenshot screenshots/asset-integration-angle2.png
```

### Step 8: Check Console for Errors

**Verify no console errors related to asset loading:**

```bash
# Check console for errors
agent-browser console

# Filter for asset-related errors
agent-browser console | grep -i "asset\|texture\|image\|audio\|failed\|error"

# Check for warnings
agent-browser console | grep -i "warn"
```

### Complete Runtime Verification Checklist

**Before marking asset integration complete, verify:**

- [ ] Asset file exists in correct location
- [ ] Asset referenced in code (grep verification)
- [ ] Asset loaded in preload/initialization
- [ ] Application loads without errors
- [ ] Asset displays correctly in runtime
- [ ] Asset functionality works as expected
- [ ] No console errors related to asset
- [ ] Screenshots captured for visual validation
- [ ] Integration verified in actual game/app context

## Complete Integration Example

### PixelLab Character Integration

```typescript
// 1. Generate character
const { character_id } = await mcp_pixellab_create_character({
  description: "wizard with blue robes",
  n_directions: 8,
  size: 48
});

// 2. Wait for completion
const character = await pollAsyncOperation(
  () => mcp_pixellab_get_character({ character_id }),
  { maxWait: 300000, respectETA: true }
);

// 3. Update preload()
preload() {
  // Load all rotations
  Object.entries(character.rotations).forEach(([direction, url]) => {
    this.load.image(`wizard-${direction}`, url);
  });
}

// 4. Use in create()
create() {
  // Check texture exists
  if (this.textures.exists('wizard-south')) {
    this.wizard = this.add.sprite(100, 100, 'wizard-south');
  } else {
    // Fallback
    this.wizard = this.add.rectangle(100, 100, 48, 48, 0x0000ff);
    console.warn('Wizard sprite not loaded, using placeholder');
  }
}
```

## Error Handling Patterns

### Pattern 1: Try-Catch in Preload

```typescript
preload() {
  try {
    this.load.image('asset-key', assetUrl);
  } catch (error) {
    console.warn(`Failed to load asset: ${error.message}`);
    this.load.image('asset-key', 'assets/fallback/placeholder.png');
  }
}
```

### Pattern 2: Texture Existence Check

```typescript
create() {
  if (this.textures.exists('asset-key')) {
    // Use asset
    this.sprite = this.add.sprite(x, y, 'asset-key');
  } else {
    // Use fallback
    this.sprite = this.add.rectangle(x, y, 32, 32, 0xff0000);
    console.warn('Asset not found, using placeholder');
  }
}
```

### Pattern 3: Fallback Graphics

```typescript
createFallbackSprite(x: number, y: number, color: number) {
  const sprite = this.add.rectangle(x, y, 32, 32, color);
  sprite.setStrokeStyle(2, 0x000000);
  return sprite;
}
```

## Asset Organization Patterns

### Pattern 1: By Type

```
assets/
  sprites/
    characters/
    tiles/
    objects/
  audio/
    music/
    sfx/
```

### Pattern 2: By Feature

```
assets/
  game/
    characters/
    tiles/
  menu/
    buttons/
    backgrounds/
```

### Pattern 3: By Source

```
assets/
  pixellab/
    characters/
    tiles/
  elevenlabs/
    audio/
  local/
    ui/
```

## Testing Patterns

### Pattern 1: Browser Verification

```bash
# Verify asset loads
agent-browser open http://localhost:3000
agent-browser console
# Check for errors
```

### Pattern 2: Test Seam Verification

```typescript
// Add test seam command
window.__TEST__.commands.checkAsset = (key: string) => {
  return this.textures.exists(key);
};

// Test in browser
agent-browser eval "window.__TEST__.commands.checkAsset('wizard-south')"
```

### Pattern 3: Fallback Testing

```typescript
// Test fallback by removing asset
// Verify placeholder appears
// Check console for warnings
```

## Best Practices

1. **Use async-operation-handler** for asset generation
2. **Work on integration code** while waiting
3. **Follow project conventions** for asset organization
4. **Use descriptive file names**
5. **Load assets in preload()** method
6. **Implement try-catch** error handling
7. **Check texture existence** before using
8. **Provide fallback graphics** for missing assets
9. **Test in browser** to verify loading
10. **Check console** for warnings

## Integration with Other Skills

- **async-operation-handler**: Uses for asset generation polling
- **game-asset-pipeline**: Complements with pipeline patterns
- **phaser-game-testing**: Uses for asset verification testing

## Related Skills

- `async-operation-handler` - Async operation polling
- `game-asset-pipeline` - Asset generation pipeline
- `phaser-game-testing` - Asset verification testing

## Remember

1. **Generate** → Use async-operation-handler
2. **Organize** → Follow project conventions
3. **Integrate** → Load in preload(), check existence
4. **Test** → Verify in browser, check console
5. **Fallback** → Always provide placeholder graphics
