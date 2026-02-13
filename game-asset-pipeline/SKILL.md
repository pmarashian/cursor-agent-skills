---
name: game-asset-pipeline
description: Standardize async asset generation workflow for game development. Use when generating game assets (PixelLab), waiting for async jobs, retrieving URLs, and updating game code. Trigger: "generate asset", "pixel lab", "asset pipeline", "async asset", "wait for job".
---

# Game Asset Pipeline

Standardize async asset generation workflow for game development. Pattern: Generate asset → Wait for Job → Retrieve URL → Update `preload()` → Verify.

## Workflow Pattern

```
1. Generate asset (PixelLab MCP) → Get job_id
2. Poll job status → Wait for completion
3. Retrieve asset URL → Get download link
4. Update game code → Add to preload()
5. Verify asset loads → Test in game
```

## PixelLab Integration

### Character Generation

```javascript
// 1. Create character
const result = await mcp_pixellab_create_character({
  description: "cute wizard with blue robes",
  n_directions: 8,
  size: 48
});

const { character_id, job_id } = result;

// 2. Wait for job completion
let character = null;
while (!character || character.status !== 'completed') {
  await sleep(5000); // Wait 5 seconds
  character = await mcp_pixellab_get_character({
    character_id: character_id
  });
  
  if (character.status === 'failed') {
    throw new Error(`Character generation failed: ${character.error}`);
  }
}

// 3. Retrieve download URL
const downloadUrl = character.download_url;
const rotations = character.rotations; // { south: url, north: url, ... }
```

### Tile Generation

```javascript
// 1. Create isometric tile
const result = await mcp_pixellab_create_isometric_tile({
  description: "grass on top of dirt",
  size: 32,
  tile_shape: "block"
});

const { tile_id } = result;

// 2. Wait for completion
let tile = null;
while (!tile || tile.status !== 'completed') {
  await sleep(2000);
  tile = await mcp_pixellab_get_isometric_tile({
    tile_id: tile_id
  });
}

// 3. Get tile URL
const tileUrl = tile.image_url || tile.download_url;
```

### Map Object Generation

```javascript
// 1. Create map object
const result = await mcp_pixellab_create_map_object({
  description: "wooden barrel",
  width: 64,
  height: 64
});

const { object_id } = result;

// 2. Wait for completion
let obj = null;
while (!obj || obj.status !== 'completed') {
  await sleep(3000);
  obj = await mcp_pixellab_get_map_object({
    object_id: object_id
  });
}

// 3. Get object URL
const objectUrl = obj.image_url || obj.download_url;
```

## Updating Game Code

### Add to Preload

```javascript
// scenes/PreloaderScene.js
preload() {
  // Generated assets
  this.load.image('wizard-south', 'https://pixellab.ai/characters/abc123/south.png');
  this.load.image('wizard-north', 'https://pixellab.ai/characters/abc123/north.png');
  // ... other directions
  
  this.load.image('grass-tile', 'https://pixellab.ai/tiles/xyz789/tile.png');
  this.load.image('barrel', 'https://pixellab.ai/objects/def456/object.png');
}
```

### Create Spritesheet from Rotations

```javascript
// If character has multiple rotations, create spritesheet reference
preload() {
  // Store rotation URLs for later use
  this.registry.set('wizard-rotations', {
    south: 'https://pixellab.ai/characters/abc123/south.png',
    north: 'https://pixellab.ai/characters/abc123/north.png',
    east: 'https://pixellab.ai/characters/abc123/east.png',
    west: 'https://pixellab.ai/characters/abc123/west.png',
    // ... other directions
  });
}
```

## Verification Checklist

After adding assets to game:

- [ ] Asset URLs are accessible (not 404)
- [ ] Assets load in `preload()` without errors
- [ ] Assets display correctly in game
- [ ] Asset dimensions match expected
- [ ] Spritesheet frames are correct (if applicable)
- [ ] Asset paths are relative or use CDN (not localhost-only)

## Common Pitfalls

### ❌ Don't: Use Job ID Instead of Asset ID

```javascript
// Wrong
const character = await get_character({ character_id: job_id });
```

```javascript
// Correct
const character = await get_character({ character_id: character_id });
```

### ❌ Don't: Forget to Wait for Completion

```javascript
// Wrong - asset may not be ready
const character = await create_character({ description: "wizard" });
const url = character.download_url; // May be null
```

```javascript
// Correct - poll until ready
let character = await create_character({ description: "wizard" });
while (character.status !== 'completed') {
  await sleep(5000);
  character = await get_character({ character_id: character.character_id });
}
```

### ❌ Don't: Hardcode Localhost URLs

```javascript
// Wrong - won't work in production
this.load.image('wizard', 'http://localhost:3000/assets/wizard.png');
```

```javascript
// Correct - use CDN or relative paths
this.load.image('wizard', 'https://cdn.example.com/assets/wizard.png');
// Or download and commit to repo
this.load.image('wizard', 'assets/characters/wizard.png');
```

## Helper Functions

### Poll Until Complete

```javascript
async function waitForJob(getJob, jobId, maxWait = 60000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    const job = await getJob({ [jobId.key]: jobId.value });
    
    if (job.status === 'completed') {
      return job;
    }
    
    if (job.status === 'failed') {
      throw new Error(`Job failed: ${job.error || 'Unknown error'}`);
    }
    
    // Wait before next poll
    await sleep(job.eta_seconds ? job.eta_seconds * 1000 : 5000);
  }
  
  throw new Error(`Job timed out after ${maxWait}ms`);
}

// Usage
const character = await waitForJob(
  mcp_pixellab_get_character,
  { key: 'character_id', value: character_id }
);
```

### Download and Save Asset

```javascript
async function downloadAsset(url, localPath) {
  const response = await fetch(url);
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  
  // Save to file system (Node.js)
  const fs = require('fs');
  fs.writeFileSync(localPath, Buffer.from(buffer));
  
  return localPath;
}

// Usage
const localPath = await downloadAsset(
  character.download_url,
  'assets/characters/wizard.zip'
);
```

## Integration with Phaser

### Preload Pattern

```javascript
// scenes/PreloaderScene.js
preload() {
  // Generated PixelLab assets
  const wizardRotations = this.registry.get('wizard-rotations');
  Object.entries(wizardRotations).forEach(([direction, url]) => {
    this.load.image(`wizard-${direction}`, url);
  });
  
  // Create spritesheet from rotations if needed
  this.load.once('complete', () => {
    this.createWizardSpritesheet();
  });
}

createWizardSpritesheet() {
  // Combine rotations into spritesheet
  // See @phaser-gamedev for spritesheet patterns
}
```

## Related Skills

- `@pixellab-mcp`: PixelLab MCP server documentation
- `@phaser-gamedev`: Phaser asset loading patterns
- `@phaser-game-testing`: Verify assets load correctly in tests

## Remember

1. **Generate** → Get job/asset ID
2. **Wait** → Poll until status === 'completed'
3. **Retrieve** → Get download/image URL
4. **Update** → Add to `preload()` or asset manifest
5. **Verify** → Test asset loads in game
6. **Commit** → Download and commit to repo, or use CDN URLs
