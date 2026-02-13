---
name: pixellab-mcp
description: Generate pixel art game assets (characters, animations, tilesets) directly from code using PixelLab MCP Server. Use when creating game assets, character sprites, animations, or tilesets for game development.
tags: [game-development, pixel-art, assets, sprites, tilesets, animations, godot, unity]
---

# PixelLab MCP Server

Generate pixel art game assets (characters, animations, tilesets) directly from code using the PixelLab MCP Server.

## Overview

The PixelLab MCP Server provides tools for generating pixel art game assets programmatically. All creation operations are **non-blocking** - they return immediately with job IDs and process in the background (typically 2-5 minutes).

**Server URL:** https://api.pixellab.ai/mcp

## Setup

The MCP server is already configured and enabled. You can call these tools directly - they will be available in your tool list.

## Non-Blocking Operations

**CRITICAL CONCEPT:** All creation tools return immediately with job IDs - they process in the background (2-5 minutes):

- Submit request → Get job ID instantly
- Process runs in background
- Check status with corresponding `get_*` tool
- Download when ready (UUID serves as access key)
- No authentication needed for downloads - share download links freely

This means you should:
1. Submit creation requests
2. Continue with other work or check status periodically
3. Download assets when status indicates completion

## Available Tools

### Character Tools
- `create_character` - Create a new character sprite
- `animate_character` - Add animations to an existing character
- `get_character` - Get character status and download URLs
- `list_characters` - List all your characters
- `delete_character` - Delete a character

### Top-Down Tileset Tools
- `create_topdown_tileset` - Create a top-down tileset (16 Wang tiles)
- `get_topdown_tileset` - Get tileset status and download URLs
- `list_topdown_tilesets` - List all your top-down tilesets
- `delete_topdown_tileset` - Delete a tileset

### Sidescroller Tileset Tools
- `create_sidescroller_tileset` - Create a sidescroller tileset
- `get_sidescroller_tileset` - Get tileset status and download URLs
- `list_sidescroller_tilesets` - List all your sidescroller tilesets
- `delete_sidescroller_tileset` - Delete a tileset

### Isometric Tile Tools
- `create_isometric_tile` - Create an isometric tile
- `get_isometric_tile` - Get tile status and download URLs
- `list_isometric_tiles` - List all your isometric tiles
- `delete_isometric_tile` - Delete a tile

## Character Creation Workflow

### Basic Character Creation

```python
# Create a character with 4 directions
character = create_character(
    description="A brave knight with red armor and a sword",
    n_directions=4,  # or 8 for more directions
    size=48,  # Canvas size in pixels
    proportions='{"type": "preset", "name": "heroic"}'
)
# Returns: { "character_id": "uuid", "status": "processing" }
```

### Direction Options

- **4 directions:** south, west, east, north
- **8 directions:** adds south-east, north-east, north-west, south-west

### Character Sizing

- Canvas size: Character will be ~60% of canvas height
- Example: 48px canvas = ~29px tall character
- Common sizes: 32px, 48px, 64px

### Proportions

Use preset proportions or custom:
- `'{"type": "preset", "name": "heroic"}'` - Heroic proportions
- `'{"type": "preset", "name": "chibi"}'` - Chibi/cute proportions
- Custom proportions can be specified as JSON

### Adding Animations

Queue animations immediately after creation:

```python
# Create character first
character_id = create_character(...)["character_id"]

# Queue walk animation
animate_character(character_id, 'walk')

# Other animation templates:
# - 'walk'
# - 'running-8-frames'
# - 'jumping-1'
# - And more...
```

### Checking Status

```python
# Check if character is ready
status = get_character(character_id)
# Returns: { "status": "completed", "download_url": "...", ... }
```

### Character Storage

- Characters are stored permanently and can be reused
- Characters created via MCP appear in web interfaces (Character Creator) if using same account
- Use `list_characters()` to see all your characters

## Tileset Creation

### Top-Down Tilesets

Creates 16 Wang tiles for seamless terrain:

```python
tileset = create_topdown_tileset(
    lower_description="Grassy terrain with small rocks",
    upper_description="Dirt path with stones"
)
# Returns: { "tileset_id": "uuid", "status": "processing" }
```

**Use Cases:**
- Overworld maps
- Strategy games
- RPGs with top-down view
- Seamless terrain generation

**Chain tilesets for consistency:**
```python
# Create base tileset
base = create_topdown_tileset(...)

# Create related tileset using base for consistency
related = create_topdown_tileset(
    lower_description="Sandy beach",
    upper_description="Ocean water",
    base_tile_id=base["tileset_id"]  # Links to base for visual consistency
)
```

### Sidescroller Tilesets

For 2D platformers:

```python
tileset = create_sidescroller_tileset(
    lower_description="Stone platform with cracks",
    transition_description="Grass-to-stone transition"
)
# Returns: { "tileset_id": "uuid", "status": "processing" }
```

**Use Cases:**
- 2D platformers
- Side-scrolling games
- Metroidvania-style games

### Isometric Tiles

For 3D-looking game assets:

```python
tile = create_isometric_tile(
    description="Medieval stone block with moss",
    size=32,  # Recommended: 32px or larger (24px minimum)
    tile_shape='block'  # Options: 'block', 'floor', etc.
)
# Returns: { "tile_id": "uuid", "status": "processing" }
```

**Use Cases:**
- Isometric games
- 3D-looking 2D games
- Strategy games with isometric view

**Size Recommendations:**
- Minimum: 24px
- Recommended: 32px or larger
- Larger sizes produce better quality

## Key Tips and Best Practices

### Canvas and Sizing
- **Character canvas size:** Character will be ~60% of canvas height (e.g., 48px canvas = ~29px tall character)
- **Tile sizes:** Typically 16x16 or 32x32 pixels for tilesets
- **Isometric tiles:** Sizes above 24px produce better quality (32px recommended)

### Animation Templates
Use `template_animation_id` parameter with values like:
- `'walk'` - Standard walk cycle
- `'running-8-frames'` - Running animation with 8 frames
- `'jumping-1'` - Jump animation
- Check available templates in documentation

### Download URLs
- UUID acts as access key - no authentication required for downloads
- Share download links freely
- Download URLs are permanent

### Integration with Web Interfaces
- Characters/tilesets created via MCP appear in web interfaces (Character Creator, Map Workshop) if using same account
- You can continue editing in web interfaces after creation

### Chaining Tilesets
- Use `base_tile_id` parameters to chain tilesets for visual consistency across terrain types
- Useful for creating related terrain sets (e.g., grass → dirt → stone transitions)

### Status Checking
- All creation operations are asynchronous
- Poll `get_*` tools periodically to check status
- Typical processing time: 2-5 minutes
- Status values: `"processing"`, `"completed"`, `"failed"`

## Available Resources

### Documentation Resources

Access these via `pixellab://docs/` URLs:

- `pixellab://docs/overview` - Complete platform overview
- `pixellab://docs/godot/wang-tilesets` - Godot 4.x Wang tileset implementation
- `pixellab://docs/godot/sidescroller-tilesets` - Godot 4.x sidescroller implementation
- `pixellab://docs/godot/isometric-tiles` - Godot 4.x isometric tiles guide
- `pixellab://docs/unity/isometric-tilemaps-2d` - Unity 2D isometric tilemap guide
- `pixellab://docs/python/wang-tilesets` - Python Wang tileset implementation
- `pixellab://docs/python/sidescroller-tilesets` - Python sidescroller implementation

## Example Workflows

### Complete Character Creation

```python
# 1. Create character
character = create_character(
    description="A brave knight with red armor",
    n_directions=8,
    size=48,
    proportions='{"type": "preset", "name": "heroic"}'
)
character_id = character["character_id"]

# 2. Queue animations
animate_character(character_id, 'walk')
animate_character(character_id, 'running-8-frames')

# 3. Check status (poll until ready)
import time
while True:
    status = get_character(character_id)
    if status["status"] == "completed":
        print(f"Download: {status['download_url']}")
        break
    elif status["status"] == "failed":
        print("Creation failed")
        break
    time.sleep(10)  # Wait 10 seconds before checking again
```

### Tileset Chain for Terrain

```python
# Create base grass tileset
grass = create_topdown_tileset(
    lower_description="Lush green grass",
    upper_description="Grass with small flowers"
)

# Create dirt tileset linked to grass
dirt = create_topdown_tileset(
    lower_description="Brown dirt path",
    upper_description="Dirt with footprints",
    base_tile_id=grass["tileset_id"]
)

# Create stone tileset linked to dirt
stone = create_topdown_tileset(
    lower_description="Gray stone floor",
    upper_description="Stone with cracks",
    base_tile_id=dirt["tileset_id"]
)
```

## Tool Parameters Reference

### create_character
- `description` (string, required) - Character description
- `n_directions` (int, optional) - Number of directions (4 or 8, default: 4)
- `size` (int, optional) - Canvas size in pixels (default: 48)
- `proportions` (string, optional) - JSON string with proportions (default: heroic preset)

### animate_character
- `character_id` (string, required) - Character UUID
- `template_animation_id` (string, required) - Animation template name

### create_topdown_tileset
- `lower_description` (string, required) - Description for lower layer
- `upper_description` (string, required) - Description for upper layer
- `base_tile_id` (string, optional) - Base tileset ID for visual consistency

### create_sidescroller_tileset
- `lower_description` (string, required) - Description for lower layer
- `transition_description` (string, required) - Description for transition
- `base_tile_id` (string, optional) - Base tileset ID for visual consistency

### create_isometric_tile
- `description` (string, required) - Tile description
- `size` (int, optional) - Tile size in pixels (default: 32, minimum: 24)
- `tile_shape` (string, optional) - Tile shape type (default: 'block')

## Error Handling

- Check status regularly - operations may fail
- Failed operations will have `status: "failed"` in response
- Retry creation if needed
- Download URLs are only available when status is `"completed"`
