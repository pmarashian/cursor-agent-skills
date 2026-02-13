---
name: elevenlabs-file-handling
description: Patterns for handling ElevenLabs API file outputs, including path management and file relocation. Use when generating audio with ElevenLabs tools, when files are written to unexpected locations, or when output_directory parameter is ignored. Files are always written to $HOME/Desktop regardless of output_directory specification.
---

# ElevenLabs File Handling

## Overview

Handle ElevenLabs API file outputs correctly. Files are always written to `$HOME/Desktop` regardless of `output_directory` parameter.

## Known Behavior

- `output_directory` parameter is **ignored**
- Files are **always written to `$HOME/Desktop`**
- File naming: `{description}_{timestamp}.mp3`

## Workflow Pattern

1. Generate audio with ElevenLabs tool
2. Check `$HOME/Desktop` for generated file
3. Move file to project directory: `mv ~/Desktop/*.mp3 assets/audio/`
4. Rename if needed: `mv assets/audio/temp.mp3 assets/audio/final-name.mp3`

## Move Audio Script

Use `scripts/move-audio.sh` to move files from Desktop to project directory:

```bash
./scripts/move-audio.sh assets/audio/
```

## Best Practices

- Always check Desktop after generation
- Use descriptive file names when moving
- Verify file exists before using in code
- Document audio file locations in progress.txt

## Resources

- `scripts/move-audio.sh` - Script to move files from Desktop to project directory
