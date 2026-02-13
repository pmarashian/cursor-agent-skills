---
name: elevenlabs-mcp
description: Generate speech, transcribe audio, create voice agents, compose music, and manage voices using ElevenLabs MCP Server. Use when working with text-to-speech, speech-to-text, voice cloning, conversational AI agents, or music composition.
tags: [audio, text-to-speech, speech-to-text, voice-cloning, ai-agents, music-composition, audio-processing]
---

# ElevenLabs MCP Server

Generate speech, transcribe audio, create voice agents, compose music, and manage voices using the ElevenLabs MCP Server.

## Overview

The ElevenLabs MCP Server provides comprehensive tools for audio generation, transcription, voice management, conversational AI agents, and music composition. Many operations **incur API costs** - only use when explicitly requested by the user.

**Server:** ElevenLabs MCP (configured via MCP settings)

## Setup

The MCP server is already configured and enabled. You can call these tools directly - they will be available in your tool list.

## ⚠️ CRITICAL: Cost Warnings

**MANY TOOLS INCUR API COSTS** - Only use when explicitly requested by the user:

- Text-to-Speech (TTS) operations
- Speech-to-Text (STT) operations
- Voice cloning
- Agent creation and conversations
- Music composition
- Audio processing (isolate, speech-to-speech)
- Outbound phone calls

**Always check with the user before using cost-incurring tools unless they explicitly request them.**

## Core Capabilities

### Text-to-Speech (TTS)
- Convert text to natural-sounding speech
- Multiple voice options (search, list, or use voice IDs)
- Various models (multilingual, flash, turbo)
- Adjustable parameters (stability, similarity, speed, style)
- Multiple output formats (MP3, PCM, Opus, μ-law, A-law)

### Speech-to-Text (STT)
- Transcribe audio files to text
- Automatic language detection
- Speaker diarization (identify different speakers)
- Support for various audio formats

### Text-to-Sound Effects
- Generate sound effects from text descriptions
- Configurable duration (0.5-5 seconds)
- Loop option for continuous playback
- Multiple output formats

### Voice Management
- Search and browse voice library
- Clone voices from audio samples
- Create custom voices from text descriptions
- Get voice details and metadata
- List available voices

### Conversational AI Agents
- Create voice-enabled conversational agents
- Configure system prompts and first messages
- Add knowledge bases (PDF, DOCX, TXT, HTML, EPUB)
- Make outbound phone calls
- Manage conversations and transcripts
- Support for multiple LLM backends

### Music Composition
- Generate music from text prompts
- Create composition plans for structured music
- Control style, sections, and duration
- Multiple output formats

### Audio Processing
- Isolate audio from files
- Transform speech between voices (speech-to-speech)
- Play audio files (WAV, MP3)

### Phone Integration
- List phone numbers
- Make outbound calls using agents
- Automatic provider detection (Twilio or SIP trunk)

## Available Tools

### Text-to-Speech Tools
- `text_to_speech` - Convert text to speech with voice selection
- `text_to_voice` - Create voice previews from text prompts (generates 3 variations)
- `create_voice_from_preview` - Add generated voice to library

### Speech-to-Text Tools
- `speech_to_text` - Transcribe audio files to text
- `speech_to_speech` - Transform audio from one voice to another

### Sound Effects Tools
- `text_to_sound_effects` - Generate sound effects from descriptions

### Voice Management Tools
- `search_voices` - Search your voice library
- `search_voice_library` - Search entire ElevenLabs voice library
- `get_voice` - Get details of a specific voice
- `voice_clone` - Create instant voice clone from audio files

### Agent Tools
- `create_agent` - Create a conversational AI agent
- `add_knowledge_base_to_agent` - Add knowledge base to agent
- `list_agents` - List all your agents
- `get_agent` - Get agent details
- `get_conversation` - Get conversation transcript
- `list_conversations` - List agent conversations

### Music Tools
- `compose_music` - Generate music from prompt or composition plan
- `create_composition_plan` - Create structured composition plan

### Audio Processing Tools
- `isolate_audio` - Isolate audio from a file
- `play_audio` - Play audio files (WAV, MP3)

### Phone Tools
- `list_phone_numbers` - List phone numbers
- `make_outbound_call` - Make outbound call using agent

### Utility Tools
- `list_models` - List available TTS models
- `check_subscription` - Check subscription status and usage

## Text-to-Speech Workflow

### Basic TTS

```python
# Simple text-to-speech
result = text_to_speech(
    text="Hello, this is a test of text-to-speech.",
    voice_name="Adam",  # or use voice_id
    output_directory="./output"
)
# Returns file path to generated audio
```

### Voice Selection

You can use either `voice_name` or `voice_id`:

```python
# Using voice name
text_to_speech(text="Hello", voice_name="Adam")

# Using voice ID
text_to_speech(text="Hello", voice_id="cgSgspJ2msm6clMCkdW9")

# Search for voices first
voices = search_voices(search="male professional")
voice_id = voices[0]["voice_id"]
text_to_speech(text="Hello", voice_id=voice_id)
```

### Model Selection

Available models:
- `eleven_multilingual_v2` - High quality multilingual (29 languages)
- `eleven_flash_v2_5` - Fastest, ultra-low latency (32 languages)
- `eleven_turbo_v2_5` - Balanced quality and speed (32 languages)
- `eleven_flash_v2` - Fast English-only
- `eleven_turbo_v2` - Balanced English-only
- `eleven_monolingual_v1` - Legacy English

```python
text_to_speech(
    text="Hello",
    model_id="eleven_multilingual_v2",
    language="en"
)
```

### TTS Parameters

Key parameters for fine-tuning:

- `stability` (0-1): Voice stability vs. emotional range (default: 0.5)
- `similarity_boost` (0-1): Adherence to original voice (default: 0.75)
- `style` (0-1): Style exaggeration (default: 0)
- `use_speaker_boost` (bool): Boost similarity to original speaker (default: true)
- `speed` (0.7-1.2): Speech speed (default: 1.0)
- `output_format`: Audio format (default: "mp3_44100_128")

## Speech-to-Text Workflow

### Basic Transcription

```python
# Transcribe audio file
result = speech_to_text(
    input_file_path="./audio/recording.mp3",
    save_transcript_to_file=True,
    output_directory="./transcripts"
)
# Returns transcript text and saves to file
```

### With Diarization

```python
# Transcribe with speaker identification
result = speech_to_text(
    input_file_path="./audio/meeting.mp3",
    diarize=True,  # Identify different speakers
    return_transcript_to_client_directly=True
)
# Returns transcript with speaker annotations
```

### Language Detection

```python
# Automatic language detection (default)
speech_to_text(input_file_path="./audio.mp3")

# Specify language
speech_to_text(
    input_file_path="./audio.mp3",
    language_code="es"  # ISO 639-3 code
)
```

## Voice Cloning Workflow

### Clone from Audio Files

```python
# Clone voice from audio samples
result = voice_clone(
    name="My Custom Voice",
    files=[
        "./samples/sample1.mp3",
        "./samples/sample2.mp3",
        "./samples/sample3.mp3"
    ],
    description="Professional male voice"
)
# Returns voice_id for use in TTS
```

### Create Voice from Text Description

```python
# Generate voice previews
previews = text_to_voice(
    voice_description="A warm, friendly female voice with a slight British accent",
    text="Hello, this is a preview of the generated voice."
)
# Returns 3 preview variations with generated_voice_id

# Add to library
create_voice_from_preview(
    generated_voice_id=previews["generated_voice_id"],
    voice_name="Friendly British Voice",
    voice_description="Warm, friendly female voice with British accent"
)
```

## Agent Creation Workflow

### Basic Agent

```python
# Create conversational AI agent
agent = create_agent(
    name="Customer Support Agent",
    first_message="Hi, how can I help you today?",
    system_prompt="You are a helpful customer support agent...",
    voice_id="cgSgspJ2msm6clMCkdW9",
    language="en"
)
# Returns agent_id
```

### Agent with Knowledge Base

```python
# Create agent first
agent_id = create_agent(...)["agent_id"]

# Add knowledge base
add_knowledge_base_to_agent(
    agent_id=agent_id,
    knowledge_base_name="Product Documentation",
    input_file_path="./docs/product_manual.pdf"
)

# Or add from URL
add_knowledge_base_to_agent(
    agent_id=agent_id,
    knowledge_base_name="Company Website",
    url="https://example.com/docs"
)

# Or add from text
add_knowledge_base_to_agent(
    agent_id=agent_id,
    knowledge_base_name="FAQ",
    text="Q: What is your return policy? A: 30 days..."
)
```

### Making Outbound Calls

```python
# List available phone numbers
phone_numbers = list_phone_numbers()

# Make outbound call
make_outbound_call(
    agent_id=agent_id,
    agent_phone_number_id=phone_numbers[0]["id"],
    to_number="+1234567890"  # E.164 format
)
```

### Managing Conversations

```python
# List conversations
conversations = list_conversations(
    agent_id=agent_id,
    page_size=30
)

# Get conversation transcript
transcript = get_conversation(
    conversation_id=conversations[0]["conversation_id"]
)
```

## Music Composition Workflow

### Basic Music Generation

```python
# Generate music from prompt
music = compose_music(
    prompt="Upbeat electronic dance music with synthesizers",
    music_length_ms=60000,  # 60 seconds
    output_directory="./music"
)
# Returns file path to generated music
```

### Structured Composition Plan

```python
# Create composition plan first
plan = create_composition_plan(
    prompt="Epic orchestral piece with multiple movements",
    music_length_ms=180000  # 3 minutes
)

# Generate music from plan
music = compose_music(
    composition_plan=plan,
    output_directory="./music"
)
```

## Audio Processing Workflow

### Isolate Audio

```python
# Isolate audio from file (remove background noise)
isolated = isolate_audio(
    input_file_path="./audio/with_background.mp3",
    output_directory="./audio/isolated"
)
```

### Speech-to-Speech Voice Transformation

```python
# Transform audio to different voice
transformed = speech_to_speech(
    input_file_path="./audio/original.mp3",
    voice_name="Adam",
    output_directory="./audio/transformed"
)
```

### Play Audio

```python
# Play audio file (WAV or MP3)
play_audio(input_file_path="./audio/sample.mp3")
```

## Sound Effects Generation

```python
# Generate sound effect
sound_effect = text_to_sound_effects(
    text="Door creaking open slowly",
    duration_seconds=2.0,
    loop=False,
    output_directory="./sounds"
)
```

## Key Parameters Reference

### text_to_speech
- `text` (required): Text to convert
- `voice_name` or `voice_id`: Voice selection
- `model_id`: TTS model (default: eleven_multilingual_v2)
- `stability` (0-1): Voice stability
- `similarity_boost` (0-1): Voice similarity
- `speed` (0.7-1.2): Speech speed
- `output_format`: Audio format
- `output_directory`: Save location (default: $HOME/Desktop)

### speech_to_text
- `input_file_path` (required): Audio file to transcribe
- `diarize` (bool): Enable speaker diarization
- `language_code`: ISO 639-3 language code (auto-detect if omitted)
- `save_transcript_to_file` (bool): Save transcript to file
- `return_transcript_to_client_directly` (bool): Return text directly

### create_agent
- `name` (required): Agent name
- `first_message` (required): First message agent says
- `system_prompt` (required): System prompt
- `voice_id`: Voice for agent (default: cgSgspJ2msm6clMCkdW9)
- `language`: ISO 639-1 code (default: "en")
- `llm`: LLM backend (default: "gemini-2.0-flash-001")
- `temperature` (0-1): Response randomness
- `max_duration_seconds`: Max conversation length (default: 300)

### compose_music
- `prompt` or `composition_plan` (required): Music description or plan
- `music_length_ms`: Duration in milliseconds
- `output_directory`: Save location (default: $HOME/Desktop)

## Best Practices

### Cost Management
- **Always check subscription status** before running multiple operations
- Use `check_subscription()` to monitor usage
- Only use cost-incurring tools when explicitly requested
- Consider using faster/cheaper models when quality requirements are lower

### File Handling

**File Output Behavior**:
- Files are **always written to `$HOME/Desktop`** regardless of `output_directory` parameter
- The `output_directory` parameter is **ignored**
- File naming: `{description}_{timestamp}.mp3`
- Must manually move files to project directory

**Workflow**:
1. Generate audio with ElevenLabs tool
2. Check `$HOME/Desktop` for generated file
3. Move file to project directory: `mv ~/Desktop/*.mp3 assets/audio/`
4. Rename if needed: `mv assets/audio/temp.mp3 assets/audio/final-name.mp3`
5. Update code to reference new path

- Use `save_transcript_to_file=True` for STT to keep transcripts
- Use `return_transcript_to_client_directly=True` to get text immediately

### Voice Selection
- Search voices before creating new ones
- Use `search_voice_library()` to browse all available voices
- Clone voices only when you have high-quality audio samples
- Test voice previews before adding to library

### Agent Configuration
- Provide clear, specific system prompts
- Set appropriate `max_duration_seconds` to control costs
- Add knowledge bases for domain-specific agents
- Test agents with sample conversations before production use

### Audio Quality
- Use appropriate output formats for your use case
- MP3 44100_128 is good balance of quality and size
- Higher bitrates (192kbps) require Creator tier or above
- PCM formats require Pro tier or above

### Music Composition
- Start with simple prompts, then refine
- Use composition plans for structured, multi-section music
- Experiment with different styles and durations
- Save composition plans for reuse

### Error Handling
- Check subscription status if operations fail
- Verify file paths exist before processing
- Ensure audio files are in supported formats (WAV, MP3)
- Check agent status before making calls

## Output Formats

### Text-to-Speech Formats
- `mp3_22050_32` - Low quality MP3
- `mp3_44100_32` - Standard quality MP3
- `mp3_44100_64` - Good quality MP3
- `mp3_44100_96` - High quality MP3
- `mp3_44100_128` - Very high quality MP3 (default)
- `mp3_44100_192` - Highest quality MP3 (Creator+ tier)
- `pcm_8000` - PCM format
- `pcm_16000` - PCM format
- `pcm_22050` - PCM format
- `pcm_24000` - PCM format
- `pcm_44100` - PCM format (Pro+ tier)
- `ulaw_8000` - μ-law format (Twilio compatible)
- `alaw_8000` - A-law format
- `opus_48000_32` - Opus format
- `opus_48000_64` - Opus format
- `opus_48000_96` - Opus format
- `opus_48000_128` - Opus format
- `opus_48000_192` - Opus format

## Example Workflows

### Complete TTS Pipeline

```python
# 1. Search for voice
voices = search_voices(search="professional female")
voice_id = voices[0]["voice_id"]

# 2. Generate speech
audio_file = text_to_speech(
    text="Welcome to our application. How can I assist you?",
    voice_id=voice_id,
    model_id="eleven_turbo_v2_5",
    stability=0.5,
    similarity_boost=0.75,
    speed=1.0,
    output_directory="./assets/audio"
)

# 3. Use in application
# Reference: audio_file path
```

### Agent with Knowledge Base

```python
# 1. Create agent
agent = create_agent(
    name="Product Support",
    first_message="Hello! I'm here to help with product questions.",
    system_prompt="You are a helpful product support agent...",
    voice_id="cgSgspJ2msm6clMCkdW9"
)
agent_id = agent["agent_id"]

# 2. Add knowledge base
add_knowledge_base_to_agent(
    agent_id=agent_id,
    knowledge_base_name="Product Docs",
    input_file_path="./docs/product.pdf"
)

# 3. List conversations later
conversations = list_conversations(agent_id=agent_id)
```

### Music Generation Pipeline

```python
# 1. Create composition plan
plan = create_composition_plan(
    prompt="Epic battle music with orchestral and electronic elements",
    music_length_ms=120000  # 2 minutes
)

# 2. Generate music
music = compose_music(
    composition_plan=plan,
    output_directory="./assets/music"
)

# 3. Use in game/application
# Reference: music file path
```

## Subscription Tiers

Different features require different subscription tiers:

- **Free Tier**: Basic TTS/STT with limitations
- **Starter Tier**: More characters, basic features
- **Creator Tier**: MP3 192kbps, more features
- **Pro Tier**: PCM 44.1kHz, advanced features
- **Enterprise**: Full access, custom solutions

Use `check_subscription()` to see your current tier and usage limits.
