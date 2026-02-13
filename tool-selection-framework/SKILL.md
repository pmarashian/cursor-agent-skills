---
name: tool-selection-framework
description: Tool selection decision framework, domain validation (visual vs audio), cost awareness, and when to use which tool. Use when deciding which tools to use for a given task, especially when working with MCP servers.
---

# Tool Selection Framework

This skill provides a comprehensive framework for selecting appropriate tools for each task, with emphasis on domain validation, cost awareness, and tool appropriateness.

## Overview

**CRITICAL: Select appropriate tools for each task phase**

Before calling any tool, ask:

1. **Is this tool appropriate for the current task phase?**
2. **Is this tool necessary for the task?**
3. **Has this tool failed recently?**
4. **What are the cost implications?**

## Task Phase Validation

### Phase-Appropriate Tool Selection

**Testing phase** → agent-browser, not text_to_speech
**Audio task** → text_to_speech, not agent-browser
**VISUAL analysis task** → analyze_screenshot, NEVER text_to_speech
**SCREENSHOT analysis task** → analyze_screenshot, NEVER ElevenLabs tools

### Tool Selection Validation Checklist

**Screenshot Analysis:**
- If task involves "analyze screenshot", "check image", "describe what you see", "verify UI" → MUST use `analyze_screenshot()` from Screenshot Analyzer

**Audio Tasks:**
- If task involves "convert text to speech", "speech to text", "voice cloning", "sound effects" → Use ElevenLabs tools

**Domain Separation:**
- **NEVER CROSS DOMAINS:** Visual tasks = Screenshot Analyzer, Audio tasks = ElevenLabs
- **COST AWARENESS:** ElevenLabs tools cost money - Screenshot Analyzer is free

## Domain Validation

### Tool Domain Validation Table

| Task Type | Correct Tool | ❌ Never Use |
|-----------|--------------|--------------|
| Analyze screenshot content | `analyze_screenshot()` | `text_to_speech()` |
| Check if UI element is visible | `analyze_screenshot()` | `text_to_speech()` |
| Describe what you see in image | `analyze_screenshot()` | `analyze_screenshot()` |
| Convert text to audio | `text_to_speech()` | `analyze_screenshot()` |
| Transcribe speech | `speech_to_text()` | `analyze_screenshot()` |
| Generate sound effects | `text_to_sound_effects()` | `analyze_screenshot()` |

### Critical Domain Rules

**Visual Tasks:**
- Screenshot analysis → Screenshot Analyzer MCP Server
- UI verification → Screenshot Analyzer or agent-browser
- Image description → Screenshot Analyzer
- **NEVER use audio tools for visual tasks**

**Audio Tasks:**
- Text-to-speech → ElevenLabs
- Speech-to-text → ElevenLabs
- Voice cloning → ElevenLabs
- Sound effects → ElevenLabs
- **NEVER use visual tools for audio tasks**

## Cost Awareness

### Cost-Incurring Tools

**ElevenLabs Tools (Cost Money):**
- Text-to-Speech (TTS) operations
- Speech-to-Text (STT) operations
- Voice cloning
- Agent creation and conversations
- Music composition
- Audio processing
- Outbound phone calls

**Always check with the user before using cost-incurring tools** unless they explicitly request them.

### Free Alternatives

**Screenshot Analyzer (Free):**
- Screenshot analysis
- Visual verification
- UI element detection
- Image description

**Prefer free alternatives when possible:**
- Use Screenshot Analyzer for visual tasks (free)
- Only use ElevenLabs when audio processing is explicitly needed (costs money)

## Tool Necessity Check

### Before Calling Any Tool

1. **Explain reasoning before calling**
   - Why is this tool needed?
   - What will it accomplish?
   - Is there a simpler alternative?

2. **Consider free alternatives first**
   - Can this be done without API calls?
   - Is there a local solution?
   - Can we use free tools instead?

3. **Verify tool availability/capability**
   - Is the tool configured?
   - Does it support the required operation?
   - Are there any limitations?

## Failure Handling

### Circuit Breaker Pattern

**Has this tool failed recently?**

1. **Track failures:**
   - After 3 consecutive failures, switch to alternative
   - Never retry the same failing tool indefinitely
   - Use circuit breaker pattern for tool failures

2. **Failure Assessment:**
   - Is the tool appropriate for the task?
   - Is this a transient error or permanent failure?
   - How many times has it failed?

3. **Recovery Strategy:**
   - If inappropriate tool: Switch immediately
   - If transient: Retry max 2 more times (3 total)
   - If permanent: Use alternative approach
   - After 3 failures: Never retry, use fallback

## Tool Selection Examples

### ✅ CORRECT: Screenshot Analysis Tasks

- "Analyze this screenshot to see if the login button is visible" → `analyze_screenshot()`
- "Check if the error message appears on the page" → `analyze_screenshot()`
- "Describe what you see in this game screenshot" → `analyze_screenshot()`
- "Verify the UI layout matches the design" → `analyze_screenshot()`

### ❌ INCORRECT: Using Audio Tools for Visual Tasks

- "Analyze this screenshot to see if the login button is visible" → ~~`text_to_speech()`~~
- "Check if the error message appears on the page" → ~~`text_to_speech()`~~
- "Describe what you see in this game screenshot" → ~~`text_to_speech()`~~

### ✅ CORRECT: Audio Processing Tasks

- "Convert this text to speech" → `text_to_speech()`
- "Transcribe this audio file" → `speech_to_text()`
- "Create sound effects for the game" → `text_to_sound_effects()`
- "Clone this voice for the character" → `voice_clone()`

## Decision Tree

### Visual Analysis Task?

```
Is task about analyzing images/screenshots?
├─ YES → Use analyze_screenshot() from Screenshot Analyzer
└─ NO → Continue to next check
```

### Audio Processing Task?

```
Is task about audio (TTS, STT, voice, music)?
├─ YES → Use ElevenLabs tools (check cost first!)
└─ NO → Continue to next check
```

### Browser Testing Task?

```
Is task about web application testing?
├─ YES → Use agent-browser
└─ NO → Continue to next check
```

### Asset Generation Task?

```
Is task about generating game assets?
├─ YES → Use PixelLab MCP tools
└─ NO → Use appropriate tool for task
```

## Integration with Other Skills

This skill works with:

- **mcp-servers-guide**: For MCP server tool selection
- **error-recovery-patterns**: For handling tool failures
- **browser-automation-workflow**: For browser tool selection

## Best Practices

1. **Always validate domain first** - Visual vs Audio vs Browser
2. **Check cost implications** - Prefer free tools when possible
3. **Verify tool appropriateness** - Is this the right tool for this phase?
4. **Consider alternatives** - Are there simpler or free options?
5. **Track failures** - Use circuit breaker pattern
6. **Document decisions** - Explain why you chose a specific tool
