---
name: mcp-servers-guide
description: Comprehensive guide to MCP servers including PixelLab (async operations, asset download), ElevenLabs (cost warnings, tool selection), and Screenshot Analyzer workflows. Use when working with MCP servers for asset generation, audio processing, or screenshot analysis.
---

# MCP Servers Guide

This skill provides comprehensive guidance for working with MCP (Model Context Protocol) servers, including PixelLab, ElevenLabs, and Screenshot Analyzer.

## Overview

MCP servers provide specialized capabilities:
- **PixelLab**: Pixel art asset generation (characters, animations, tilesets)
- **ElevenLabs**: Audio processing (TTS, STT, voice cloning, music)
- **Screenshot Analyzer**: Visual analysis of screenshots

## PixelLab MCP Server

### Tools Available

- `create_character` - Generate pixel art characters
- `animate_character` - Create character animations
- `get_character` - Check character status and retrieve
- `list_characters` - List all created characters
- `delete_character` - Delete a character
- `create_topdown_tileset` - Generate top-down game tilesets
- `get_topdown_tileset` - Check tileset status
- `create_sidescroller_tileset` - Generate sidescroller tilesets
- `get_sidescroller_tileset` - Check sidescroller tileset status
- `create_isometric_tile` - Generate isometric tiles
- `get_isometric_tile` - Check isometric tile status
- `create_map_object` - Generate map objects with transparent backgrounds

### Critical: Non-Blocking Operations & Asset Download Workflow

**All creation tools return immediately with job IDs** - they process in the background (2-5 minutes). You MUST follow this complete workflow:

1. **Create**: Submit request → Get job ID instantly
2. **Wait**: Poll status using the appropriate `get_*` tool (e.g., `get_character`, `get_topdown_tileset`) until status is "completed"
3. **Download**: Use the download URL from the completed asset to download the file(s)
4. **Save**: Save downloaded files to appropriate locations in the codebase (e.g., `assets/`, `public/`, `src/assets/`, `public/images/`)
5. **Use Local Files**: Reference the local file paths in your code - NEVER use external URLs

### Async Operation Best Practices

**Polling Strategy:**
- Use exponential backoff: 5s → 10s → 20s → 40s intervals
- Respect API-provided ETAs when available
- Don't poll more frequently than every 5 seconds
- Stop polling when status === "completed"

**Download Validation:**
- ALWAYS verify status === "completed" before download
- Handle HTTP 423 (Locked) errors gracefully
- Don't attempt download until resource is ready

**Parallel Work:**
- Use waiting time for parallel work:
  - Code integration
  - Documentation
  - Test preparation
- Don't wait idly for async operations

**Timeout Handling:**
- Set maximum timeout (e.g., 5 minutes for character generation)
- Log progress and ETA for transparency
- Handle timeout errors gracefully

### Mandatory: All Assets Must Be Local Files

- **PROHIBITED**: Using external URLs from PixelLab download links in your code
- **REQUIRED**: Download all asset files and save them to the codebase
- **REQUIRED**: Use local file paths when referencing assets in code
- Save assets to project-appropriate directories:
  - Web projects: `public/`, `public/images/`, `src/assets/`, or `assets/`
  - Game projects: `assets/`, `src/assets/`, or project-specific asset directories
  - Check the project structure to determine the appropriate location

### Example Complete Workflow

```
1. create_character(...) → Returns character_id
2. get_character(character_id) → Check status, repeat until "completed"
3. Extract download URL from completed character data
4. Download ZIP/image files using the download URL
5. Save to codebase: assets/characters/character_name.zip or assets/characters/character_name.png
6. Reference in code: "./assets/characters/character_name.png" (NOT the external URL)
```

### Skill Reference

**When working with PixelLab tools:**
- Load the `pixellab-mcp` skill for complete documentation: `load_skill("pixellab-mcp")`
- The skill includes full API reference, workflows, examples, and best practices

## ElevenLabs MCP Server

### Tools Available

- `text_to_speech` - Convert text to speech
- `speech_to_text` - Transcribe audio to text
- `text_to_sound_effects` - Generate sound effects from text
- `voice_clone` - Clone voices from audio samples
- `create_agent` - Create conversational AI agents
- `compose_music` - Generate music from prompts
- `isolate_audio` - Isolate audio from files
- And more audio processing tools

### ⚠️ CRITICAL: AUDIO TOOLS ONLY - DO NOT USE FOR VISUAL ANALYSIS

- **NEVER** use ElevenLabs tools for screenshot analysis or visual tasks
- **NEVER** use `text_to_speech()` to "verbalize" or "speak about" screenshot content
- For visual analysis of screenshots, use `analyze_screenshot()` from Screenshot Analyzer MCP Server
- ElevenLabs tools are for AUDIO processing only: converting text to speech, speech to text, voice cloning, etc.
- If the task involves analyzing what you see in an image/screenshot, this is a VISUAL task requiring Screenshot Analyzer tools

### Critical: Cost Warnings

**MANY TOOLS INCUR API COSTS** - Only use when explicitly requested by the user:

- Text-to-Speech (TTS) operations
- Speech-to-Text (STT) operations
- Voice cloning
- Agent creation and conversations
- Music composition
- Audio processing
- Outbound phone calls

**Always check with the user before using cost-incurring tools** unless they explicitly request them.

### Skill Reference

**When working with ElevenLabs tools:**
- Load the `elevenlabs-mcp` skill for complete documentation: `load_skill("elevenlabs-mcp")`
- The skill includes full API reference, workflows, examples, parameters, and best practices
- Key capabilities: TTS with multiple voices/models, STT with diarization, voice cloning, conversational AI agents with knowledge bases, music composition, audio processing

## Screenshot Analyzer MCP Server

### Tools Available

- `analyze_screenshot(screenshot, prompt)` - Analyze screenshots with AI vision

### Screenshot Analyzer Workflow

1. **Load Skill**: Load the `screenshot-analysis` skill for complete documentation: `load_skill("screenshot-analysis")`
2. **Analyze**: Use `analyze_screenshot()` with a captured screenshot and custom analysis prompts

### When to Use Screenshot Analyzer

**MANDATORY**: Load the `screenshot-analysis` skill first: `load_skill("screenshot-analysis")`

The skill includes:
- Full API reference
- Workflows and examples
- Prompt crafting best practices
- Common use cases
- Cost optimization
- Error handling
- Workflow patterns

### ⚠️ CRITICAL: DO NOT USE ELEVENLABS TOOLS FOR VISUAL ANALYSIS

- **NEVER** use `text_to_speech()` or any ElevenLabs tool for screenshot analysis
- Screenshot analysis requires `analyze_screenshot()` - this is a VISUAL task, not an AUDIO task
- If you need to analyze what you see in a screenshot, use `analyze_screenshot()` from Screenshot Analyzer
- Only use ElevenLabs tools (`text_to_speech()`, `speech_to_text()`, etc.) for actual AUDIO processing tasks

### Tool Selection Examples

**✅ CORRECT: Screenshot Analysis Tasks**
- "Analyze this screenshot to see if the login button is visible" → `analyze_screenshot()`
- "Check if the error message appears on the page" → `analyze_screenshot()`
- "Describe what you see in this game screenshot" → `analyze_screenshot()`
- "Verify the UI layout matches the design" → `analyze_screenshot()`

**❌ INCORRECT: Using Audio Tools for Visual Tasks**
- "Analyze this screenshot to see if the login button is visible" → ~~`text_to_speech()`~~
- "Check if the error message appears on the page" → ~~`text_to_speech()`~~
- "Describe what you see in this game screenshot" → ~~`text_to_speech()`~~

**✅ CORRECT: Audio Processing Tasks**
- "Convert this text to speech" → `text_to_speech()`
- "Transcribe this audio file" → `speech_to_text()`
- "Create sound effects for the game" → `text_to_sound_effects()`
- "Clone this voice for the character" → `voice_clone()`

## Tool Selection Decision Framework

### Domain Validation

| Task Type | Correct Tool | ❌ Never Use |
|-----------|--------------|--------------|
| Analyze screenshot content | `analyze_screenshot()` | `text_to_speech()` |
| Check if UI element is visible | `analyze_screenshot()` | `text_to_speech()` |
| Describe what you see in image | `analyze_screenshot()` | `text_to_speech()` |
| Convert text to audio | `text_to_speech()` | `analyze_screenshot()` |
| Transcribe speech | `speech_to_text()` | `analyze_screenshot()` |
| Generate sound effects | `text_to_sound_effects()` | `analyze_screenshot()` |

### Key Principles

1. **Visual tasks** → Screenshot Analyzer
2. **Audio tasks** → ElevenLabs
3. **NEVER cross domains**: Visual ≠ Audio
4. **Cost awareness**: ElevenLabs costs money - Screenshot Analyzer is free

## Integration with Other Skills

This skill works with:

- **tool-selection-framework**: For comprehensive tool selection guidance
- **screenshot-handling**: For proper screenshot file management
- **asset-integration-workflow**: For integrating downloaded assets into projects
