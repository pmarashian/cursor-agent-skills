---
name: pre-implementation-check
description: Verify existing implementations before coding to prevent duplicate work and enable verification-focused workflows. Use before starting any new feature implementation to check if functionality already exists. Saves 20-40% of implementation time by avoiding redundant work.
---

# Pre-Implementation Check

Verify existing implementations before coding to prevent duplicate work. Saves 20-40% of implementation time by catching existing features early.

## Overview

Before implementing new functionality, always verify:
1. Does this feature already exist?
2. Is it partially implemented?
3. Does it need enhancement rather than creation?

**Pattern observed**: Agents discovered features already implemented after starting work, wasting 20-40% of implementation time.

## Mandatory Skill Loading Validation

**CRITICAL**: Before starting implementation, verify ALL mandatory skills are loaded. Missing mandatory skills lead to incomplete verification and protocol violations.

### Mandatory Skills Checklist

**For Web Applications**:
- [ ] `agent-browser` (MANDATORY - browser automation required)
- [ ] `screenshot-handling` (if visual verification needed)
- [ ] `completion-marker-optimization` (RECOMMENDED - prevents protocol violations)

**For Phaser Games**:
- [ ] `phaser-game-testing` (MANDATORY - Phaser testing patterns)
- [ ] `agent-browser` (MANDATORY - Phaser games are web apps)
- [ ] `screenshot-handling` (MANDATORY for visual tasks)
- [ ] `completion-marker-optimization` (RECOMMENDED - prevents protocol violations)

**For All Tasks**:
- [ ] `completion-marker-optimization` (RECOMMENDED - prevents protocol violations)
- [ ] `pre-implementation-check` (RECOMMENDED - this skill)

### Skill Loading Verification Patterns

**Pattern 1: Check Skill Availability**

```markdown
## Mandatory Skill Check

Before starting implementation:

1. **Web Application**: 
   - [ ] agent-browser loaded
   - [ ] screenshot-handling loaded (if visual verification)

2. **Phaser Game**:
   - [ ] phaser-game-testing loaded
   - [ ] agent-browser loaded
   - [ ] screenshot-handling loaded

3. **All Tasks**:
   - [ ] completion-marker-optimization loaded
   - [ ] pre-implementation-check loaded

If any mandatory skill is missing, load it BEFORE proceeding.
```

**Pattern 2: Load Missing Skills**

```markdown
## Load Missing Mandatory Skills

If mandatory skills are missing:

1. Load agent-browser (for web apps/games)
2. Load phaser-game-testing (for Phaser games)
3. Load screenshot-handling (for visual tasks)
4. Load completion-marker-optimization (for all tasks)

Then proceed with implementation.
```

### Skill Loading Workflow

**Step 0: Verify Mandatory Skills (Before Step 1)**

Before searching codebase, verify mandatory skills:

1. **Identify task type**: Web app, Phaser game, or other
2. **Check mandatory skills**: Use checklist above
3. **Load missing skills**: If any mandatory skill missing, load it
4. **Verify skills loaded**: Confirm skills are available
5. **Proceed to Step 1**: Only after all mandatory skills loaded

**Example**:

```markdown
## Pre-Implementation: Mandatory Skills

**Task Type**: Phaser Game

**Mandatory Skills Check**:
- [x] phaser-game-testing: ✅ Loaded
- [x] agent-browser: ✅ Loaded
- [x] screenshot-handling: ✅ Loaded
- [x] completion-marker-optimization: ✅ Loaded

**Status**: All mandatory skills loaded. Proceeding to implementation check.
```

## Dev Server Verification

### Add Dev Server Health Check to Pre-Implementation Workflow

**Before starting implementation, verify dev server is running and healthy:**

```bash
# Check if dev server is running
check_dev_server() {
  local port=${1:-5173}  # Default Vite port
  
  # Check if port is in use
  if lsof -i :$port > /dev/null 2>&1; then
    echo "Dev server running on port $port"
    
    # Health check
    if curl -f http://localhost:$port > /dev/null 2>&1; then
      echo "Dev server is healthy"
      return 0
    else
      echo "Dev server not responding"
      return 1
    fi
  else
    echo "Dev server not running on port $port"
    return 1
  fi
}
```

#### Backend / Server (for backend tasks)

**Before the first API test**: Check that the target port is free (e.g. `lsof -i :PORT`) or that a single dev server is listening. Start command: use an **explicit directory** (e.g. `cd /absolute/path/to/backend && npm run dev`). Optional: short-timeout health check (e.g. `curl -f http://localhost:PORT/api/health --max-time 5`). **Auth tasks**: First register/login may be slow (e.g. bcrypt). Use request timeouts (e.g. 10–15 s) for register/login (e.g. `curl --max-time 10`).

#### Path convention (monorepos)

- Backend library code lives under `backend/src/lib/`, not `backend/lib/`. Confirm the backend app root before creating API or lib files.

### Port Verification Patterns

**Pattern 1: Check Configuration Files**

```bash
# Check vite.config.ts for port
PORT=$(grep -o "port: [0-9]*" vite.config.ts | grep -o "[0-9]*" || echo "5173")

# Check package.json for port in dev script
PORT=$(grep -o "vite --port [0-9]*" package.json | grep -o "[0-9]*" || echo "5173")
```

**Pattern 2: Check Common Ports**

```bash
# Check common ports in parallel
for port in 3000 5173 8080 5000; do
  if lsof -i :$port > /dev/null 2>&1; then
    echo "Dev server found on port $port"
    break
  fi
done
```

**Pattern 3: Parse Terminal Output**

```bash
# If server is starting, parse output for port
npm run dev 2>&1 | grep -o "Local:.*http://localhost:[0-9]*" | grep -o "[0-9]*"
```

### Server Readiness Checks

**Verify server is actually serving content:**

```bash
# Health check function
verify_server_ready() {
  local url=$1
  local max_attempts=5
  local attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if curl -f "$url" > /dev/null 2>&1; then
      echo "Server is ready"
      return 0
    fi
    
    attempt=$((attempt + 1))
    sleep $((2 ** $attempt))  # Exponential backoff: 2s, 4s, 8s, 16s
  done
  
  echo "Server not ready after $max_attempts attempts"
  return 1
}
```

## Test Seam Availability

### Check Test Seam Availability Before Implementation

**For Phaser games, check test seam availability before implementation:**

```bash
# Check test seam availability
check_test_seam_availability() {
  local url=$1
  local max_wait=5  # 5 seconds max
  
  # Open browser
  agent-browser open "$url"
  
  # Wait for test seam with timeout
  local elapsed=0
  while [ $elapsed -lt $max_wait ]; do
    if agent-browser eval "window.__TEST__?.sceneKey || false"; then
      echo "Test seam available"
      return 0
    fi
    
    sleep 1
    elapsed=$((elapsed + 1))
  done
  
  echo "Test seam not available after $max_wait seconds"
  return 1
}
```

### Document Expected Setup Times

**Document expected test seam setup times:**

| Scenario | Expected Setup Time |
|----------|-------------------|
| Initial page load | 2-5 seconds |
| Scene transition | 1-3 seconds |
| Test seam initialization | 1-2 seconds |
| Total | 4-10 seconds |

**If test seam takes longer than expected**:
- Check browser console for errors
- Verify test seam setup in source code
- Check if scene is properly initialized

### Fallback Strategies When Test Seams Aren't Ready

**If test seams aren't available after timeout:**

1. **Document limitation**:
   ```markdown
   ## Test Seam Limitation
   
   Test seam not available after 5 second timeout.
   Proceeding with implementation, will verify via code review.
   ```

2. **Use alternative verification**:
   - Code review
   - TypeScript compilation
   - DOM inspection (if applicable)

3. **Proceed with caution**:
   - Note limitation in progress.txt
   - Use alternative verification methods
   - Document fallback method used

## Dependency Verification

### Check for Required Dependencies

**Before implementation, verify required dependencies are installed:**

```bash
# Check for required npm packages
check_dependencies() {
  local required_packages=("phaser" "typescript" "vite")
  
  for package in "${required_packages[@]}"; do
    if ! grep -q "\"$package\"" package.json; then
      echo "Missing dependency: $package"
      return 1
    fi
  done
  
  echo "All required dependencies present"
  return 0
}
```

### Verify Build Tools Are Available

**Check if build tools are available:**

```bash
# Check for build tools
check_build_tools() {
  # Check Node.js
  if ! command -v node &> /dev/null; then
    echo "Node.js not found"
    return 1
  fi
  
  # Check npm
  if ! command -v npm &> /dev/null; then
    echo "npm not found"
    return 1
  fi
  
  # Check TypeScript compiler
  if ! command -v tsc &> /dev/null && ! npx tsc --version &> /dev/null; then
    echo "TypeScript compiler not found"
    return 1
  fi
  
  echo "All build tools available"
  return 0
}
```

### Confirm Test Infrastructure Is Ready

**Verify test infrastructure is ready:**

```bash
# Check test infrastructure
check_test_infrastructure() {
  # Check for test files
  if [ ! -d "tests" ] && [ ! -d "__tests__" ]; then
    echo "Test directory not found"
    # Not a blocker, but document
  fi
  
  # Check for test runner
  if ! grep -q "\"test\"" package.json; then
    echo "Test script not found in package.json"
    # Not a blocker, but document
  fi
  
  # Check for agent-browser (for browser testing)
  if ! command -v agent-browser &> /dev/null; then
    echo "agent-browser not found"
    # Document limitation
  fi
  
  echo "Test infrastructure check complete"
}
```

## Infrastructure Checks

### Verification Patterns for Common Development Environments

**Pattern 1: Vite Development Environment**

```bash
# Vite environment check
check_vite_environment() {
  # Check vite.config.ts exists
  if [ ! -f "vite.config.ts" ] && [ ! -f "vite.config.js" ]; then
    echo "vite.config not found"
    return 1
  fi
  
  # Check dev server port
  local port=$(grep -o "port: [0-9]*" vite.config.ts 2>/dev/null | grep -o "[0-9]*" || echo "5173")
  
  # Check if dev server is running
  if lsof -i :$port > /dev/null 2>&1; then
    echo "Vite dev server running on port $port"
    return 0
  else
    echo "Vite dev server not running"
    return 1
  fi
}
```

**Pattern 2: Phaser Game Environment**

```bash
# Phaser game environment check
check_phaser_environment() {
  # Check Phaser is installed
  if ! grep -q "\"phaser\"" package.json; then
    echo "Phaser not found in package.json"
    return 1
  fi
  
  # Check for scene files
  if [ ! -d "src/scenes" ] && [ ! -d "scenes" ]; then
    echo "Scene directory not found"
    # Not a blocker, but document
  fi
  
  # Check for test seam setup
  if ! grep -r "window.__TEST__" src/ 2>/dev/null; then
    echo "Test seam not found in source code"
    # Document limitation
  fi
  
  echo "Phaser environment check complete"
  return 0
}
```

**Pattern 3: React Application Environment**

```bash
# React environment check
check_react_environment() {
  # Check React is installed
  if ! grep -q "\"react\"" package.json; then
    echo "React not found in package.json"
    return 1
  fi
  
  # Check for component files
  if [ ! -d "src/components" ] && [ ! -d "components" ]; then
    echo "Component directory not found"
    # Not a blocker, but document
  fi
  
  echo "React environment check complete"
  return 0
}
```

## Checklist Template for Pre-Implementation Verification

**Use this checklist for every pre-implementation check:**

```markdown
## Pre-Implementation Verification Checklist

### Mandatory Skills
- [ ] All mandatory skills loaded (see Mandatory Skill Loading section)

### Dev Server
- [ ] Dev server is running
- [ ] Dev server is healthy (responds to HTTP requests)
- [ ] Port verified (from config or detected)
- [ ] Server is serving content correctly

### Test Seam (for Phaser games)
- [ ] Test seam available (if applicable)
- [ ] Test seam setup time documented
- [ ] Fallback strategy defined (if test seam unavailable)

### Dependencies
- [ ] Required dependencies installed
- [ ] Build tools available (Node.js, npm, TypeScript)
- [ ] Test infrastructure ready (if applicable)

### Infrastructure
- [ ] Development environment verified (Vite/React/Phaser)
- [ ] Configuration files present
- [ ] Source code structure verified

### Feature Check
- [ ] Codebase searched for existing implementation
- [ ] Test seam commands checked (if applicable)
- [ ] Success criteria compared to existing code
- [ ] Decision made: verify existing vs. implement new

### Documentation
- [ ] Findings documented in progress.txt
- [ ] Limitations documented (if any)
- [ ] Action plan documented
```

## Workflow

### Step 0: Infrastructure Verification (Before Step 1)

**Before searching codebase, verify infrastructure:**

1. **Verify mandatory skills loaded** (see Mandatory Skill Loading section)
2. **Check dev server**:
   - Verify dev server is running
   - Check server health
   - Verify port configuration
3. **Check test seam availability** (for Phaser games):
   - Verify test seam is available
   - Document setup time
   - Define fallback strategy if unavailable
4. **Verify dependencies**:
   - Check required packages are installed
   - Verify build tools are available
   - Confirm test infrastructure is ready
5. **Verify infrastructure**:
   - Check development environment (Vite/React/Phaser)
   - Verify configuration files
   - Check source code structure

**Only proceed to Step 1 after infrastructure is verified.**

### Step 1: Search Codebase

**Use codebase_search() with relevant keywords:**

```typescript
// Search for existing implementations
const results = await codebase_search({
  query: "How is feature X implemented?",
  target_directories: []
});

// Check for function/class names
const classResults = await codebase_search({
  query: "Where is FeatureX class or function defined?",
  target_directories: []
});
```

**Use grep to find specific patterns:**

```bash
# Search for function/class names
grep -r "functionName" src/
grep -r "ClassName" src/

# Search for test seam commands
grep -r "clickStartGame\|goToScene\|setTimer" src/
```

### Step 2: Check Test Seams

**Test seam commands indicate existing functionality:**

```typescript
// Check for test seam commands in codebase
const testSeamResults = await codebase_search({
  query: "What test seam commands are available?",
  target_directories: []
});

// Look for window.__TEST__.commands patterns
grep -r "window.__TEST__\.commands\." src/
```

**Common test seam commands that indicate features:**
- `clickStartGame()` → Game start functionality exists
- `setTimer(seconds)` → Timer functionality exists
- `collectCoin()` → Coin collection exists
- `goToScene(key)` → Scene navigation exists
- `triggerGameOver()` → Game over functionality exists

### Step 3: Verify Current State

**Run application if possible:**

```bash
# Check if dev server is running
lsof -i :3000 || npm run dev

# Open browser and verify
agent-browser open http://localhost:3000
agent-browser eval "window.__TEST__?.commands"
```

**Check test seams for existing functionality:**

```bash
# Check available test seam commands
agent-browser eval "Object.keys(window.__TEST__?.commands || {})"
```

### Step 4: Review Progress.txt

**Check recent implementations:**

```bash
# Read progress file
cat tasks/progress.txt

# Search for task ID or feature name
grep -i "feature-name\|task-id" tasks/progress.txt
```

**Look for:**
- Recent implementations of similar features
- Completed tasks that might include this functionality
- Learnings that mention this feature

### Step 4.5: Asset Discovery Workflow

**Before generating new assets, check if they already exist.**

**Observed Issue**: Assets generated when they already existed, wasting time and API calls.

#### Asset Discovery Checklist

**Before generating assets, verify:**

1. **Check progress.txt for previous generation**
   ```bash
   # Search progress.txt for asset generation
   grep -i "character\|sprite\|tile\|asset" tasks/progress.txt
   
   # Look for specific asset names
   grep -i "wizard\|grass\|coin" tasks/progress.txt
   ```

2. **List directory for existing assets**
   ```bash
   # Check common asset directories
   ls -la public/assets/sprites/
   ls -la assets/sprites/
   ls -la src/assets/sprites/
   ls -la public/assets/audio/
   ls -la assets/audio/
   ```

3. **Verify asset file exists**
   ```bash
   # Check for specific asset files
   test -f "public/assets/sprites/character.png" && echo "Exists" || echo "Missing"
   test -f "assets/sprites/wizard-south.png" && echo "Exists" || echo "Missing"
   
   # Check multiple variations
   ls public/assets/sprites/character*.png
   ls assets/sprites/wizard-*.png
   ```

4. **Generate only if missing**
   ```bash
   # Only generate if asset doesn't exist
   if [ ! -f "public/assets/sprites/character.png" ]; then
     echo "Asset missing, generating..."
     # Generate asset
   else
     echo "Asset already exists, skipping generation"
   fi
   ```

#### Common Asset Locations

**Check these common locations for existing assets:**

**Phaser Games:**
```
public/
  assets/
    sprites/
      characters/
        character-south.png
        character-north.png
      tiles/
        grass-tile.png
        stone-tile.png
    audio/
      music/
        bg-music.mp3
      sfx/
        coin-collect.mp3

assets/
  sprites/
    characters/
    tiles/
  audio/
    music/
    sfx/

src/assets/
  sprites/
  audio/
```

**React/Web Apps:**
```
public/
  assets/
    images/
      character.png
    audio/
      music.mp3

src/
  assets/
    images/
    audio/

assets/
  images/
  audio/
```

**Framework-Specific Patterns:**

**Vite Projects:**
- `public/assets/` - Public assets (served as-is)
- `src/assets/` - Imported assets (processed by Vite)

**Next.js Projects:**
- `public/` - Static assets
- `src/assets/` - Imported assets

**Phaser Projects:**
- `public/assets/sprites/` - Sprite images
- `public/assets/audio/` - Audio files
- `assets/` - Alternative location

#### Asset Metadata Verification

**Verify asset metadata if asset exists:**

```bash
# Check file size (should be > 0)
stat -f%z public/assets/sprites/character.png

# Check file type
file public/assets/sprites/character.png

# Check image dimensions (if image)
identify public/assets/sprites/character.png  # ImageMagick
sips -g pixelWidth -g pixelHeight public/assets/sprites/character.png  # macOS

# Check if file is readable
test -r public/assets/sprites/character.png && echo "Readable" || echo "Not readable"
```

#### Asset Discovery Decision Logic

**Decision framework for asset discovery:**

```markdown
## Asset Discovery: [Asset Name]

**Step 1: Check progress.txt**
- [ ] Searched progress.txt for asset generation
- [ ] Found previous generation: Yes/No
- [ ] Previous generation date: [Date]

**Step 2: Check Common Locations**
- [ ] Checked public/assets/sprites/
- [ ] Checked assets/sprites/
- [ ] Checked src/assets/sprites/
- [ ] Asset found: Yes/No
- [ ] Asset location: [Path]

**Step 3: Verify Asset File**
- [ ] File exists: Yes/No
- [ ] File size: [Bytes]
- [ ] File readable: Yes/No
- [ ] Metadata verified: Yes/No

**Step 4: Decision**
- [ ] Asset exists and valid → Use existing asset
- [ ] Asset missing → Generate new asset
- [ ] Asset exists but invalid → Regenerate asset
```

#### Generation Decision Logic

**When to generate new vs reuse existing:**

**Generate New Asset When:**
- ❌ Asset file doesn't exist
- ❌ Asset file is corrupted (size = 0, unreadable)
- ❌ Asset doesn't match requirements (wrong size, style)
- ❌ Asset is outdated (old generation date)

**Reuse Existing Asset When:**
- ✅ Asset file exists and is valid
- ✅ Asset matches requirements
- ✅ Asset is recent (generated recently)
- ✅ Asset quality is acceptable

**Example Workflow:**

```bash
# Asset discovery workflow
check_asset_exists() {
  local asset_name=$1
  local asset_path="public/assets/sprites/${asset_name}.png"
  
  # Check if file exists
  if [ -f "$asset_path" ]; then
    # Check file size
    local size=$(stat -f%z "$asset_path" 2>/dev/null || echo "0")
    if [ "$size" -gt 0 ]; then
      echo "Asset exists: $asset_path (${size} bytes)"
      return 0
    else
      echo "Asset exists but is empty: $asset_path"
      return 1
    fi
  else
    echo "Asset missing: $asset_path"
    return 1
  fi
}

# Use in workflow
if check_asset_exists "character"; then
  echo "Using existing asset"
else
  echo "Generating new asset"
  # Generate asset
fi
```

### Step 5: Decision

**If feature exists:**
1. Switch to verification mode
2. Verify functionality meets requirements
3. Document findings in progress.txt
4. Only implement if feature is missing or incomplete

**If feature missing:**
1. Proceed with implementation
2. Document new implementation in progress.txt

## Patterns

### Pattern 1: Codebase Search Before Reading

```typescript
// ❌ WRONG: Read files directly
read_file("src/scenes/GameScene.ts");
// Start implementing...

// ✅ CORRECT: Search first
const results = await codebase_search({
  query: "How is timer functionality implemented in GameScene?",
  target_directories: ["src/scenes"]
});

if (results.length > 0) {
  // Feature exists, verify instead
  verifyExistingFeature();
} else {
  // Feature missing, implement
  implementFeature();
}
```

### Pattern 2: Test Seam Discovery

```typescript
// Check for test seam commands
const testSeamCheck = await codebase_search({
  query: "What test seam commands exist for timer functionality?",
  target_directories: []
});

// If setTimer command exists, timer feature likely exists
if (testSeamCheck.some(r => r.includes("setTimer"))) {
  // Verify existing implementation
  verifyTimerFeature();
}
```

### Pattern 3: Browser Verification

```bash
# Verify via browser before coding
agent-browser open http://localhost:3000
agent-browser eval "window.__TEST__?.commands.setTimer"
# If command exists, feature exists
```

### Pattern 4: Progress.txt Review

```bash
# Check progress for recent implementations
grep -i "timer\|countdown" tasks/progress.txt

# Look for completed tasks
grep -A 10 "US-XXX" tasks/progress.txt | grep -i "complete\|done"
```

## Common Scenarios

### Scenario 1: Feature Already Implemented

**Discovery**: Codebase search finds existing implementation

**Action**:
1. Read existing implementation
2. Verify it meets requirements
3. Test functionality in browser
4. Document verification in progress.txt
5. Mark task as verification complete

**Example**:
```typescript
// Found existing timer implementation
const timerCode = await codebase_search({
  query: "How is game timer implemented?",
  target_directories: ["src/scenes"]
});

// Verify it works
agent-browser eval "window.__TEST__?.commands.setTimer(5)"
// Timer works, feature complete
```

### Scenario 2: Feature Partially Implemented

**Discovery**: Feature exists but incomplete

**Action**:
1. Identify what's missing
2. Enhance existing implementation
3. Test enhancements
4. Document changes

**Example**:
```typescript
// Timer exists but missing color change at 10 seconds
// Enhance existing timer code
enhanceTimerWithColorChange();
```

### Scenario 3: Feature Missing

**Discovery**: No existing implementation found

**Action**:
1. Proceed with implementation
2. Document new feature
3. Add test seam commands
4. Test thoroughly

## Structured Checklist Template

**Use this structured checklist for every pre-implementation check:**

```markdown
## Pre-Implementation Check: [Feature Name]

### Step 1: Codebase Search
- [ ] Searched codebase for existing implementation
- [ ] Checked for function/class names related to feature
- [ ] Searched for test seam commands indicating feature
- [ ] Reviewed related files and dependencies

### Step 2: Success Criteria Validation
- [ ] Compared existing code to each success criterion
- [ ] Identified gaps or partial implementations
- [ ] Determined if existing implementation meets requirements
- [ ] Documented which criteria are met vs. missing

### Step 3: Browser Verification (if applicable)
- [ ] Checked test seam commands in browser
- [ ] Verified functionality works as expected
- [ ] Tested edge cases if applicable

### Step 4: Documentation
- [ ] Recorded findings in progress.txt
- [ ] Documented "already complete" state if applicable
- [ ] Noted any limitations or edge cases discovered

### Step 5: Decision
- [ ] Feature already complete → Skip to verification phase
- [ ] Feature partially implemented → Enhance existing code
- [ ] Feature missing → Proceed with implementation
```

## Success Criteria Validation Patterns

### Pattern 1: Compare Existing Code to Success Criteria

**Compare existing implementation against each success criterion:**

```typescript
// Success criteria from task
const successCriteria = [
  "Timer counts down from 60 seconds",
  "Timer changes color at 10 seconds",
  "Game over triggers when timer reaches 0",
];

// Check existing implementation
const existingCode = await codebase_search({
  query: "How is game timer implemented?",
  target_directories: ["src/scenes"]
});

// Validate each criterion
const validation = successCriteria.map(criterion => {
  const isMet = checkCriterionMet(existingCode, criterion);
  return { criterion, isMet, evidence: findEvidence(existingCode, criterion) };
});

// Document findings
documentValidationResults(validation);
```

### Pattern 2: Identify Gaps or Partial Implementations

**Identify what's missing or incomplete:**

```typescript
// Analyze existing implementation
const analysis = {
  fullyImplemented: [
    "Timer counts down from 60 seconds",
  ],
  partiallyImplemented: [
    "Timer changes color at 10 seconds", // Missing color change
  ],
  missing: [
    "Game over triggers when timer reaches 0", // Not implemented
  ],
};

// Document gaps
updateProgressTxt(`
## Pre-Implementation Analysis

**Feature**: Game Timer
**Status**: Partially Implemented

**Fully Implemented**:
- Timer counts down from 60 seconds ✅

**Partially Implemented**:
- Timer changes color at 10 seconds (timer exists, color change missing)

**Missing**:
- Game over triggers when timer reaches 0

**Action**: Enhance existing implementation to add missing features
`);
```

### Pattern 3: Determine if Fixes Needed or Feature Complete

**Make decision based on validation:**

```typescript
// Decision logic
if (allCriteriaMet) {
  // Feature complete, skip to verification
  skipToVerification();
  recordAlreadyComplete();
} else if (someCriteriaMet) {
  // Partial implementation, enhance existing
  enhanceExistingImplementation();
} else {
  // Feature missing, implement new
  implementNewFeature();
}
```

## Early Exit Patterns

### Pattern 1: Skip to Verification if Already Implemented

**If feature already exists and meets all criteria, skip implementation:**

```typescript
// Early exit pattern
const existingFeature = await checkExistingImplementation();
const allCriteriaMet = validateAgainstSuccessCriteria(existingFeature);

if (allCriteriaMet) {
  // Skip to verification phase
  updateProgressTxt(`
## Feature Already Complete

**Feature**: [Feature Name]
**Status**: Already implemented and meets all success criteria
**Location**: [File location]
**Verification**: [Verification steps taken]

**Action**: Skipping implementation, proceeding to verification phase
  `);
  
  // Proceed directly to verification
  verifyFeature();
  return; // Early exit
}

// Continue with implementation if needed
implementFeature();
```

### Pattern 2: Record "Already Complete" State Early

**Record completion state early to avoid redundant work:**

```typescript
// Record early to prevent redundant work
if (featureAlreadyComplete) {
  updateProgressTxt(`
## Pre-Implementation Check: [Feature Name]

**Status**: ✅ Already Complete
**Date**: [Current Date]
**Verification**: [Verification details]

**Success Criteria Met**:
- [x] Criterion 1
- [x] Criterion 2
- [x] Criterion 3

**Action**: No implementation needed, feature verified
  `);
  
  // Mark as complete early
  markTaskAsVerified();
  return;
}
```

## Documentation Requirements

### Pattern 1: Emphasize progress.txt Documentation

**Always document findings in progress.txt:**

```markdown
## Pre-Implementation Check: [Feature Name]

**Date**: [Date]
**Task**: [Task ID/Name]

### Findings
- [ ] Feature exists: Yes/No
- [ ] Location: [File paths]
- [ ] Test seam commands: [List commands]
- [ ] Success criteria met: [List criteria]

### Validation Results
- Criterion 1: ✅ Met / ❌ Missing
- Criterion 2: ✅ Met / ❌ Missing
- Criterion 3: ✅ Met / ❌ Missing

### Decision
- [ ] Skip to verification (already complete)
- [ ] Enhance existing (partial implementation)
- [ ] Implement new (feature missing)

### Action Taken
[Description of action taken based on findings]
```

### Pattern 2: Record "Already Complete" State

**Always record if feature is already complete:**

```markdown
## Feature Status: Already Complete

**Feature**: [Feature Name]
**Status**: ✅ Already Implemented
**Location**: [File location]
**Test Seam**: [Test seam commands]

**Success Criteria Validation**:
- [x] Criterion 1: ✅ Met
- [x] Criterion 2: ✅ Met
- [x] Criterion 3: ✅ Met

**Verification**:
- [x] Tested in browser
- [x] All test cases pass
- [x] No console errors

**Action**: Skipping implementation, proceeding to verification phase
```

## Verification Checklist

Before starting implementation, verify:

- [ ] Codebase searched for existing implementations
- [ ] Test seam commands checked for feature indicators
- [ ] Application run to verify current state
- [ ] Progress.txt reviewed for recent implementations
- [ ] Success criteria compared to existing implementation
- [ ] Gaps or partial implementations identified
- [ ] Decision made: verify existing vs. implement new
- [ ] Findings documented in progress.txt
- [ ] "Already complete" state recorded if applicable

## Documentation Pattern

**Document findings in progress.txt:**

```markdown
## Pre-Implementation Check

**Feature**: Timer functionality
**Status**: Already implemented
**Location**: src/scenes/GameScene.ts
**Test Seam**: window.__TEST__.commands.setTimer(seconds)
**Verification**: Tested in browser, works correctly
**Action**: Verified existing implementation, no changes needed
```

## Anti-Patterns

### ❌ Don't: Skip Verification

```typescript
// WRONG: Start implementing immediately
read_file("src/scenes/GameScene.ts");
// Start coding...
// Later: Discover feature already exists
```

### ❌ Don't: Assume Feature Missing

```typescript
// WRONG: Assume feature doesn't exist
// Start implementing...
// Later: Find existing implementation
```

### ✅ Do: Always Verify First

```typescript
// CORRECT: Verify first
const results = await codebase_search({
  query: "How is feature X implemented?",
  target_directories: []
});

if (results.length > 0) {
  verifyExistingFeature();
} else {
  implementFeature();
}
```

## Integration with Other Skills

- **pre-flight-checklist**: Includes pre-implementation check
- **task-verification-workflow**: Uses verification patterns
- **phaser-game-testing**: Checks test seams for existing features

## Related Skills

- `pre-flight-checklist` - Pre-task verification
- `task-verification-workflow` - Task completion verification
- `codebase-search` - Search patterns for discovery

## Remember

1. **Always search codebase first** before implementing
2. **Check test seam commands** for feature indicators
3. **Verify in browser** if possible
4. **Review progress.txt** for recent implementations
5. **Document findings** in progress.txt
6. **Switch to verification mode** if feature exists
7. **Only implement** if feature is missing or incomplete
