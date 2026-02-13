---
name: screenshot-handling
description: Ensures all screenshots are saved to a dedicated screenshots/ folder instead of project root. Use when capturing screenshots via agent-browser, Playwright, Puppeteer, or any other screenshot capture method to maintain project organization.
---

# Screenshot Handling

## ⚠️ CRITICAL REQUIREMENT ⚠️

**SAVING SCREENSHOTS TO PROJECT ROOT IS FORBIDDEN.**

**ALL screenshots MUST be saved to the `screenshots/` folder. There are NO exceptions.**

### Validation Checklist

Before capturing ANY screenshot, verify:

1. ✅ `screenshots/` folder exists (create with `mkdir -p screenshots/`)
2. ✅ Screenshot command includes `screenshots/` in the path
3. ✅ Path format: `screenshots/filename.png` (NOT `filename.png`)

### Correct vs Incorrect Examples

✅ **CORRECT - Screenshots in `screenshots/` folder:**
- `screenshots/mainmenu-verification.png`
- `screenshots/timer-test.png`
- `screenshots/game-over-state.png`
- `screenshots/ui-validation.png`

❌ **INCORRECT - Screenshots in project root (FORBIDDEN):**
- `mainmenu-verification.png` (project root)
- `timer-test.png` (project root)
- `game-over-state.png` (project root)
- `verification.png` (project root)

**If you discover screenshots in the project root, move them immediately to `screenshots/` folder.**

**Screenshot path**: Use **project root or absolute path** for the screenshot directory so CWD does not cause wrong locations. When saving to `screenshots/`, ensure CWD is project root.

**Pre-completion (web tasks)**: For frontend/web tasks, do not skip browser verification; if agent-browser is loaded, at least one browser action (open, navigate, submit, or capture) must be performed before marking complete, unless documented as impossible (e.g. backend down) with fallback. For scaffold-only tasks, at least open the app URL and capture one screenshot to confirm the shell renders.

## Overview

Screenshots should always be saved to a dedicated `screenshots/` folder instead of the project root directory. This keeps the project root clean and organized, making it easier to manage and locate screenshot files.

**Problem**: Screenshots saved to project root create clutter and make it difficult to manage project files.

**Solution**: Always save screenshots to `screenshots/` folder, creating it if it doesn't exist.

## Required Behavior

**ALWAYS** save screenshots to the `screenshots/` folder:

- ✅ `screenshots/mainmenu-verification.png`
- ✅ `screenshots/timer-test.png`
- ✅ `screenshots/game-over-state.png`
- ❌ `mainmenu-verification.png` (project root)
- ❌ `timer-test.png` (project root)

## Folder Creation

**Always ensure the `screenshots/` folder exists before saving screenshots.**

### Bash/Shell
```bash
mkdir -p screenshots/
agent-browser screenshot screenshots/mainmenu-verification.png
```

### Node.js/TypeScript
```typescript
import fs from 'fs';

// Create folder if it doesn't exist
fs.mkdirSync('screenshots', { recursive: true });

// Then capture screenshot
await page.screenshot({ path: 'screenshots/mainmenu-verification.png' });
```

### Python
```python
import os

# Create folder if it doesn't exist
os.makedirs('screenshots', exist_ok=True)

# Then capture screenshot
page.screenshot(path='screenshots/mainmenu-verification.png')
```

## Methods Covered

### agent-browser Screenshot Commands

**CRITICAL: ALWAYS create the `screenshots/` folder FIRST, then specify the `screenshots/` folder path:**

```bash
# STEP 1: Create folder first (MANDATORY)
mkdir -p screenshots/

# STEP 2: Capture screenshot to screenshots/ folder (path MUST include screenshots/)
agent-browser screenshot screenshots/mainmenu-verification.png
agent-browser screenshot screenshots/timer-test.png
agent-browser screenshot screenshots/game-over-state.png

# Full page screenshot (also in screenshots/ folder)
agent-browser screenshot --full screenshots/full-page.png
```

**❌ FORBIDDEN - Never save to project root:**
```bash
# WRONG - Missing screenshots/ folder in path
agent-browser screenshot mainmenu-verification.png  # ❌ Saves to project root
agent-browser screenshot verification.png             # ❌ Saves to project root
```

**✅ CORRECT - Always include screenshots/ in path:**
```bash
# RIGHT - Includes screenshots/ folder in path
mkdir -p screenshots/                                 # ✅ Create folder first
agent-browser screenshot screenshots/mainmenu-verification.png  # ✅ Saves to screenshots/
```

**Reference**: See `agent-browser` skill for complete screenshot command syntax.

### Playwright Screenshot Methods

**Always use `screenshots/` folder path:**

```typescript
import { chromium } from 'playwright';
import fs from 'fs';

// Create folder if it doesn't exist
fs.mkdirSync('screenshots', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:5173');

// Capture screenshot to screenshots/ folder
await page.screenshot({ path: 'screenshots/mainmenu-verification.png' });

// Full page screenshot
await page.screenshot({ 
  path: 'screenshots/full-page.png',
  fullPage: true 
});

await browser.close();
```

### Puppeteer Screenshot Methods

**Always use `screenshots/` folder path:**

```typescript
import puppeteer from 'puppeteer';
import fs from 'fs';

// Create folder if it doesn't exist
fs.mkdirSync('screenshots', { recursive: true });

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('http://localhost:5173');

// Capture screenshot to screenshots/ folder
await page.screenshot({ path: 'screenshots/mainmenu-verification.png' });

// Full page screenshot
await page.screenshot({ 
  path: 'screenshots/full-page.png',
  fullPage: true 
});

await browser.close();
```

### Other Screenshot Capture Tools

**For any other screenshot capture method:**

1. Create `screenshots/` folder if it doesn't exist
2. Always specify `screenshots/filename.png` as the output path
3. Never save to project root

## Naming Conventions

**Use descriptive filenames with context:**

- ✅ `screenshots/mainmenu-verification.png` - Clear purpose
- ✅ `screenshots/timer-test-10seconds.png` - Includes test context
- ✅ `screenshots/game-over-state.png` - Describes state
- ✅ `screenshots/ui-validation-mainmenu.png` - Includes validation context
- ✅ `screenshots/2026-01-25-mainmenu.png` - Includes date if needed
- ❌ `screenshots/screenshot.png` - Too generic
- ❌ `screenshots/test.png` - Not descriptive

**Recommended patterns:**
- `screenshots/{feature}-{state}.png` - e.g., `mainmenu-default.png`
- `screenshots/{feature}-{test-context}.png` - e.g., `timer-test-5seconds.png`
- `screenshots/{validation-type}-{scene}.png` - e.g., `ui-validation-mainmenu.png`

## Migration

**When discovering screenshots in project root, move them to `screenshots/` folder:**

### Manual Migration

```bash
# Create screenshots folder
mkdir -p screenshots/

# Move existing screenshots from root to screenshots/
mv *.png screenshots/ 2>/dev/null || true

# Or move specific files
mv mainmenu-verification.png screenshots/
mv timer-test.png screenshots/
```

### Automated Migration Script

```bash
#!/bin/bash
# migrate-screenshots.sh

# Create screenshots folder
mkdir -p screenshots/

# Find PNG files in project root (excluding node_modules, .git, etc.)
find . -maxdepth 1 -name "*.png" -type f ! -path "./node_modules/*" ! -path "./.git/*" -exec mv {} screenshots/ \;

echo "Screenshots migrated to screenshots/ folder"
```

### Verification

**After migration, verify screenshots are in the correct location:**

```bash
# List screenshots in screenshots/ folder
ls -la screenshots/

# Verify no PNG files remain in project root (excluding node_modules, .git, etc.)
find . -maxdepth 1 -name "*.png" -type f ! -path "./node_modules/*" ! -path "./.git/*"
```

## Troubleshooting

### Screenshots Ended Up in Wrong Location

**If you discover screenshots in the project root instead of `screenshots/` folder:**

1. **Verify the issue:**
   ```bash
   # Check for PNG files in project root
   find . -maxdepth 1 -name "*.png" -type f
   ```

2. **Create screenshots folder if missing:**
   ```bash
   mkdir -p screenshots/
   ```

3. **Move misplaced screenshots:**
   ```bash
   # Move all PNG files from root to screenshots/
   mv *.png screenshots/ 2>/dev/null || true
   
   # Or move specific files
   mv mainmenu-verification.png screenshots/
   mv timer-test.png screenshots/
   ```

4. **Verify migration:**
   ```bash
   # List screenshots in correct location
   ls -la screenshots/
   
   # Verify no PNG files remain in project root
   find . -maxdepth 1 -name "*.png" -type f
   ```

5. **Prevent future issues:**
   - Always run `mkdir -p screenshots/` before capturing screenshots
   - Always include `screenshots/` in the screenshot path
   - Review this skill's instructions before capturing screenshots

### Common Mistakes

**Mistake 1: Forgetting to create folder**
```bash
# ❌ WRONG - Folder doesn't exist, screenshot may fail or save to root
agent-browser screenshot screenshots/test.png

# ✅ CORRECT - Create folder first
mkdir -p screenshots/
agent-browser screenshot screenshots/test.png
```

**Mistake 2: Missing screenshots/ in path**
```bash
# ❌ WRONG - Path doesn't include screenshots/
agent-browser screenshot test.png

# ✅ CORRECT - Path includes screenshots/
agent-browser screenshot screenshots/test.png
```

**Mistake 3: Using relative path without screenshots/**
```bash
# ❌ WRONG - Relative path without folder
page.screenshot({ path: 'verification.png' })

# ✅ CORRECT - Path includes screenshots/
page.screenshot({ path: 'screenshots/verification.png' })
```

## Screenshot Freshness Verification

### Verify Screenshots Are Current

**Always verify screenshots are current before using them for verification:**

```bash
# Force browser refresh before capturing verification screenshots
agent-browser reload
agent-browser wait 2000  # Wait for reload

# Then capture screenshot
agent-browser screenshot screenshots/verification.png
```

### Timestamp Verification Techniques

**Pattern 1: Check File Timestamp**

```bash
# Check screenshot file timestamp
ls -l screenshots/verification.png

# Verify file was created recently (within last 10 seconds)
file_age=$(($(date +%s) - $(stat -f %m screenshots/verification.png)))
if [ $file_age -lt 10 ]; then
  echo "Screenshot is fresh"
else
  echo "Screenshot may be stale"
fi
```

**Pattern 2: Timestamp in Filename**

```bash
# Include timestamp in filename
timestamp=$(date +%Y%m%d_%H%M%S)
agent-browser screenshot "screenshots/verification-${timestamp}.png"
```

**Pattern 3: Browser State Verification**

```bash
# Verify browser state before screenshot
agent-browser eval "
  const state = {
    url: window.location.href,
    timestamp: Date.now(),
    testSeamReady: window.__TEST__?.ready || false
  };
  JSON.stringify(state)
"

# Capture screenshot
agent-browser screenshot screenshots/verification.png
```

### Detecting Stale Screenshots

**Check for stale screenshots:**

```bash
# Check if screenshot exists and is recent
check_screenshot_freshness() {
  local screenshot=$1
  local max_age=30  # 30 seconds max age
  
  if [ ! -f "$screenshot" ]; then
    echo "Screenshot not found"
    return 1
  fi
  
  local file_age=$(($(date +%s) - $(stat -f %m "$screenshot")))
  if [ $file_age -gt $max_age ]; then
    echo "Screenshot is stale (${file_age}s old)"
    return 1
  fi
  
  echo "Screenshot is fresh"
  return 0
}
```

### Force Browser Refresh Before Capture

**Always refresh browser before capturing verification screenshots:**

```bash
# Force refresh before screenshot
agent-browser reload
agent-browser wait 2000  # Wait for reload

# Verify HMR has applied changes (if applicable)
agent-browser eval "
  const lastReload = window.__HMR_LAST_RELOAD__ || 0;
  const now = Date.now();
  const timeSinceReload = now - lastReload;
  timeSinceReload < 5000 ? 'Recently reloaded' : 'Stale state'
"

# Then capture screenshot
agent-browser screenshot screenshots/verification.png
```

## Timing Considerations

### When to Wait for Scene Transitions/Updates

**Wait for scene transitions before capturing:**

```bash
# Navigate to scene
agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"

# Wait for transition (don't capture immediately)
agent-browser wait 500  # Wait for scene transition

# Wait for scene initialization
agent-browser eval "
  new Promise((resolve) => {
    const check = () => {
      if (window.__TEST__?.ready) {
        resolve(true);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  })
"

# Now capture screenshot
agent-browser screenshot screenshots/gamescene-ready.png
```

### Verify HMR Has Applied Changes Before Screenshots

**Always verify HMR has applied changes before capturing:**

```bash
# Make code change (outside browser)

# Wait for HMR to apply
agent-browser eval "
  const lastReload = window.__HMR_LAST_RELOAD__ || 0;
  const now = Date.now();
  const timeSinceReload = now - lastReload;
  timeSinceReload < 5000 ? 'HMR applied' : 'HMR not applied'
"

# If HMR not applied, force refresh
if [ "$hmr_status" != "HMR applied" ]; then
  agent-browser reload
  agent-browser wait 2000
fi

# Then capture screenshot
agent-browser screenshot screenshots/after-change.png
```

### Explicit Wait Patterns for Dynamic Content

**Wait for dynamic content before capturing:**

```bash
# Wait for content to load
agent-browser eval "
  new Promise((resolve) => {
    const check = () => {
      if (document.querySelector('.content-loaded')) {
        resolve(true);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  })
"

# Wait for animations to complete
agent-browser wait 1000  # Wait for animation

# Then capture screenshot
agent-browser screenshot screenshots/content-loaded.png
```

**Pattern for Phaser Games:**

```bash
# Wait for scene ready
agent-browser eval "window.__TEST__?.ready || false"

# Wait for game state initialized
agent-browser eval "
  const state = window.__TEST__?.gameState?.();
  state && state.initialized ? true : false
"

# Wait for any animations
agent-browser wait 500

# Then capture screenshot
agent-browser screenshot screenshots/game-ready.png
```

## Batch Screenshot Operations

### Patterns for Capturing Multiple Screenshots Efficiently

**Pattern 1: Sequential Screenshots with Minimal Waits**

```bash
# Capture multiple screenshots efficiently
mkdir -p screenshots/

# Screenshot 1: Main menu
agent-browser open "http://localhost:5173?scene=MainMenu"
agent-browser wait 1000
agent-browser screenshot screenshots/mainmenu.png

# Screenshot 2: Game scene (navigate and capture)
agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"
agent-browser wait 500
agent-browser screenshot screenshots/gamescene.png

# Screenshot 3: Game over (trigger and capture)
agent-browser eval "window.__TEST__.commands.triggerGameOver()"
agent-browser wait 500
agent-browser screenshot screenshots/gameover.png
```

**Pattern 2: Batch Screenshots with State Verification**

```bash
# Capture screenshots with state verification
capture_screenshot_with_state() {
  local scene=$1
  local filename=$2
  
  # Navigate to scene
  agent-browser eval "window.__TEST__.commands.goToScene('$scene')"
  agent-browser wait 500
  
  # Verify state
  agent-browser eval "window.__TEST__?.sceneKey === '$scene'"
  
  # Capture screenshot
  agent-browser screenshot "screenshots/$filename"
}

# Batch capture
capture_screenshot_with_state "MainMenu" "mainmenu.png"
capture_screenshot_with_state "GameScene" "gamescene.png"
capture_screenshot_with_state "GameOverScene" "gameover.png"
```

### When to Use Comparison Screenshots (Before/After)

**Use before/after screenshots for verification:**

```bash
# Before screenshot
agent-browser screenshot screenshots/before-change.png

# Make change (code modification)

# Wait for HMR
agent-browser reload
agent-browser wait 2000

# After screenshot
agent-browser screenshot screenshots/after-change.png

# Compare screenshots (using imgdiff or visual comparison)
```

**When to Use Before/After**:
- Verifying code changes
- Testing visual regressions
- Documenting changes
- Debugging layout issues

### Caching Strategies to Avoid Redundant Captures

**Pattern 1: Check Screenshot Age Before Capture**

```bash
# Check if screenshot exists and is recent
should_capture_screenshot() {
  local screenshot=$1
  local max_age=60  # 60 seconds max age
  
  if [ ! -f "$screenshot" ]; then
    return 0  # Screenshot doesn't exist, should capture
  fi
  
  local file_age=$(($(date +%s) - $(stat -f %m "$screenshot")))
  if [ $file_age -gt $max_age ]; then
    return 0  # Screenshot is stale, should capture
  fi
  
  return 1  # Screenshot is fresh, skip capture
}

# Use caching
if should_capture_screenshot "screenshots/mainmenu.png"; then
  agent-browser screenshot screenshots/mainmenu.png
else
  echo "Using cached screenshot"
fi
```

**Pattern 2: Hash-Based Caching**

```bash
# Check if state has changed before capturing
get_state_hash() {
  agent-browser eval "
    const state = {
      scene: window.__TEST__?.sceneKey,
      score: window.__TEST__?.gameState?.()?.score
    };
    JSON.stringify(state)
  " | md5sum | cut -d' ' -f1
}

# Capture only if state changed
current_hash=$(get_state_hash)
if [ "$current_hash" != "$last_hash" ]; then
  agent-browser screenshot screenshots/state-${current_hash}.png
  last_hash=$current_hash
fi
```

**Pattern 3: Timestamp-Based Caching**

```bash
# Cache screenshots with timestamps
capture_with_cache() {
  local scene=$1
  local cache_file="screenshots/.cache-${scene}.txt"
  local screenshot="screenshots/${scene}.png"
  
  # Check cache
  if [ -f "$cache_file" ]; then
    local cached_time=$(cat "$cache_file")
    local current_time=$(date +%s)
    local age=$((current_time - cached_time))
    
    if [ $age -lt 30 ]; then
      echo "Using cached screenshot for $scene"
      return 0
    fi
  fi
  
  # Capture new screenshot
  agent-browser eval "window.__TEST__.commands.goToScene('$scene')"
  agent-browser wait 500
  agent-browser screenshot "$screenshot"
  echo $(date +%s) > "$cache_file"
}
```

## Best Practices

1. **Always create folder first**: Use `mkdir -p screenshots/` or equivalent before capturing
2. **Use descriptive names**: Include feature, state, or test context in filename
3. **Consistent location**: Always use `screenshots/` folder, never project root
4. **Clean up root**: Move any screenshots found in root to `screenshots/` folder immediately
5. **Add to .gitignore**: Consider adding `screenshots/*.png` to `.gitignore` if screenshots are temporary
6. **Validate before completion**: Verify all screenshots are in `screenshots/` folder before marking task complete
7. **Verify freshness**: Always refresh browser before capturing verification screenshots
8. **Wait for transitions**: Wait for scene transitions and HMR before capturing
9. **Use batch operations**: Capture multiple screenshots efficiently with minimal waits
10. **Cache when appropriate**: Use caching to avoid redundant captures

## Examples

### Example 1: UI Validation Screenshot

```bash
# Create folder
mkdir -p screenshots/

# Capture main menu for UI validation
agent-browser open http://localhost:5173
agent-browser wait 2000
agent-browser screenshot screenshots/ui-validation-mainmenu.png
```

### Example 2: Timer Test Screenshot

```bash
# Create folder
mkdir -p screenshots/

# Navigate and capture timer state
agent-browser open http://localhost:5173
agent-browser eval "window.__TEST__.commands.goToScene('GameScene')"
agent-browser eval "window.__TEST__.commands.setTimer(5)"
agent-browser wait 1000
agent-browser screenshot screenshots/timer-test-5seconds.png
```

### Example 3: Playwright Test Screenshot

```typescript
import { test } from '@playwright/test';
import fs from 'fs';

test('capture main menu screenshot', async ({ page }) => {
  // Create folder
  fs.mkdirSync('screenshots', { recursive: true });
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  
  // Capture to screenshots/ folder
  await page.screenshot({ path: 'screenshots/mainmenu-test.png' });
});
```

## Resources

- `agent-browser` skill - Browser automation and screenshot commands
- Project root should remain clean and organized
- Screenshots in root should be moved to `screenshots/` folder when discovered
