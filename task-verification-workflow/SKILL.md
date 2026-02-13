---
name: task-verification-workflow
description: Standardized workflow for verifying task completion, including success criteria validation, testing checklists, and fallback verification methods. Use before marking tasks complete, when progress tracking shows discrepancies, or when browser testing fails. Ensures all success criteria are verified before task completion.
---

# Task Verification Workflow

## Overview

Prevent premature task completion by following a standardized verification workflow. Don't mark tasks complete without verifying all success criteria.

## Pre-Completion Checklist

Before marking a task complete, verify:

**Mandatory Skill Loading**:
- [ ] All mandatory skills loaded (see Mandatory Skill Loading section below)
- [ ] agent-browser loaded (for web apps/games)
- [ ] phaser-game-testing loaded (for Phaser games)
- [ ] screenshot-handling loaded (for visual tasks)
- [ ] completion-marker-optimization loaded (for all tasks)

**Implementation Verification**:
- [ ] All code changes implemented
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] All success criteria verified
- [ ] Browser testing completed (for web/game tasks)
- [ ] Test seam verification passed (for Phaser games)
- [ ] Edge cases tested (empty state, error conditions)
- [ ] Progress.txt updated with learnings
- [ ] Git commit with proper format

## Mandatory Skill Loading Validation

**CRITICAL**: Before marking task complete, verify ALL mandatory skills were loaded during implementation. Missing mandatory skills indicate incomplete verification.

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
- [ ] `pre-implementation-check` (RECOMMENDED)

### Skill Loading Verification in Workflow

**Before marking complete, verify**:

1. **Mandatory skills were loaded**: Check if required skills were used
2. **Skills were used correctly**: Verify skills were applied properly
3. **No missing skills**: Ensure no mandatory skills were skipped

**Example Verification**:

```markdown
## Mandatory Skill Verification

**Task Type**: Phaser Game

**Skills Used During Implementation**:
- [x] phaser-game-testing: ✅ Used for test seam patterns
- [x] agent-browser: ✅ Used for browser automation
- [x] screenshot-handling: ✅ Used for visual verification
- [x] completion-marker-optimization: ✅ Used for completion marker

**Status**: All mandatory skills loaded and used correctly.
```

### If Mandatory Skills Missing

**If mandatory skills were not loaded**:

1. **Document the gap**: Note which skills were missing
2. **Assess impact**: Evaluate if verification was incomplete
3. **Load skills now**: Load missing skills and re-verify if needed
4. **Document limitation**: Note skill loading gap in progress.txt

**Example Documentation**:

```markdown
## Skill Loading Gap

**Missing Skills**: agent-browser was not loaded during implementation

**Impact**: Browser testing was not performed, only TypeScript verification

**Action**: 
- Loaded agent-browser skill
- Performed browser testing
- Verified functionality works correctly

**Status**: Gap addressed, verification complete.
```

## Success Criteria Validation

**Critical**: Don't mark complete if progress shows 0/X criteria.

1. **Verify each criterion explicitly**
   - Don't assume criteria are met
   - Test each one individually
   - Document verification method

2. **Use fallback verification if primary method fails**
   - Browser testing fails → Use console logs or code review
   - Test seam unavailable → Use alternative verification
   - See `references/fallback-strategies.md` for alternatives

3. **Document verification in progress.txt**
   - Note how each criterion was verified
   - Include any issues encountered
   - Note any fallback methods used

### Criteria alignment

**Before outputting the completion marker**: Compare the current repo state to the orchestrator's stated success criteria (e.g. the "Next" line or checklist). Ensure each criterion is satisfied by the actual paths and content produced, or explicitly document why not. **Do not complete if the orchestrator shows 0/N** until criteria are met or you have documented and waived with reason.

### Verification by task type

- **Backend API tasks**: Require at least one **authenticated** request to new/changed endpoints (e.g. register → login → GET/PATCH to the new route). Confirm status and expected shape. If no auth harness exists, document in progress how to verify manually. Do not mark complete based only on "server started" or an unauthenticated 401.
- **Frontend / web tasks**: Require at least one **browser flow** that matches the task (load agent-browser and screenshot-handling, run the app, perform a flow: open relevant screen, submit form, see expected UI). Do not output the completion marker until this is done or explicitly documented as impossible (e.g. backend down) with fallback. **Do not substitute API-only verification for UI verification** when the task is a UI task.
- **When authenticated E2E is impossible** (backend/auth down): Verify UI with mock data if appropriate, document the limitation in progress, and ensure the real API is used in code with no mocks left. Document and revert any temporary auth bypass or mocks.

## ⚠️ CRITICAL: Runtime Testing Requirements ⚠️

**NEVER mark a task complete without demonstrating working functionality through runtime testing.**

**Protocol Violation**: Marking tasks complete based on code review alone violates the "never mark complete without demonstrating working functionality" requirement.

**Observed Issue**: 25% of analyzed tasks were marked complete without runtime testing, leading to incomplete deliverables.

### Mandatory Runtime Testing Enforcement

**Before marking ANY task complete, you MUST:**

1. **Perform runtime functional test** (MANDATORY - never skip)
   - Code review alone is NOT sufficient
   - TypeScript compilation passing is NOT sufficient
   - Runtime testing is REQUIRED

2. **Verify functionality works as expected**
   - Test the actual behavior, not just code structure
   - Verify user-facing functionality works
   - Test critical paths and interactions

3. **Document runtime testing performed**
   - Note what was tested
   - Document test results
   - Include screenshots or evidence if applicable

**If runtime testing cannot be performed:**
- Document why testing was skipped
- Use alternative verification methods (see fallback strategies)
- Note limitation in progress.txt
- Do NOT mark complete unless alternative verification confirms functionality

## Testing Requirements by Task Type

### Web Applications (MANDATORY Requirements)

**CRITICAL**: Web applications MUST include browser testing with runtime verification.

**Mandatory Verification Checklist**:
- [ ] **Browser testing completed** (MANDATORY - never skip)
- [ ] Application loads in browser without errors
- [ ] UI elements render correctly
- [ ] User interactions work as expected
- [ ] Navigation functions correctly
- [ ] Forms submit and validate correctly
- [ ] No console errors
- [ ] Visual validation (screenshots if applicable)

**Tools Required**:
- `agent-browser` (MANDATORY for web apps)
- `screenshot-handling` (if visual verification needed)

**Example Workflow**:
```bash
# 1. Start dev server (if not running)
npm run dev

# 2. Open browser
agent-browser open http://localhost:5173

# 3. Test functionality
agent-browser snapshot -i
agent-browser click @e1
agent-browser fill @e2 "test"

# 4. Verify results
agent-browser eval "document.querySelector('.result').textContent"

# 5. Check console for errors
agent-browser console
```

### Phaser Games (MANDATORY Requirements)

**CRITICAL**: Phaser games MUST include game runtime testing with test seam verification.

**Mandatory Verification Checklist**:
- [ ] **Game runtime testing completed** (MANDATORY - never skip)
- [ ] Game loads and initializes correctly
- [ ] Test seam commands work (`window.__TEST__`)
- [ ] Scene navigation functions correctly
- [ ] Game mechanics work as expected (movement, collisions, scoring)
- [ ] Visual rendering is correct
- [ ] No console errors
- [ ] Screenshots captured for visual validation

**Tools Required**:
- `phaser-game-testing` (MANDATORY for Phaser games)
- `agent-browser` (MANDATORY - Phaser games are web apps)
- `screenshot-handling` (MANDATORY for visual tasks)

**Example Workflow**:
```bash
# 1. Start dev server
npm run dev

# 2. Open browser with test mode
agent-browser open "http://localhost:5173?test=1&seed=42"

# 3. Wait for test seam ready
agent-browser eval "window.__TEST__?.ready || false"

# 4. Test game functionality
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser eval "window.__TEST__.commands.setTimer(5)"
agent-browser eval "window.__TEST__.commands.collectAnyCoin()"

# 5. Verify game state
agent-browser eval "window.__TEST__.gameState()"

# 6. Capture screenshot
mkdir -p screenshots/
agent-browser screenshot screenshots/game-test.png
```

### Asset Generation Tasks (MANDATORY Requirements)

**CRITICAL**: Asset generation tasks MUST include integration verification and runtime testing.

**Mandatory Verification Checklist**:
- [ ] **Integration verification completed** (MANDATORY - never skip)
- [ ] Asset file exists in correct location
- [ ] Asset referenced in code (grep for asset path)
- [ ] Asset loaded in preload/initialization
- [ ] Asset displays correctly in runtime
- [ ] Asset functionality works as expected
- [ ] No console errors related to asset loading
- [ ] Visual validation (screenshots if applicable)

**Tools Required**:
- `asset-integration-workflow` (MANDATORY for asset tasks)
- `agent-browser` (MANDATORY for runtime verification)
- `screenshot-handling` (if visual verification needed)

**Example Workflow**:
```bash
# 1. Verify asset file exists
ls -la public/assets/sprites/character.png

# 2. Verify asset referenced in code
grep -r "character.png" src/

# 3. Start dev server and test
npm run dev
agent-browser open http://localhost:5173

# 4. Verify asset loads
agent-browser eval "window.__TEST__?.gameState()"

# 5. Verify asset displays
mkdir -p screenshots/
agent-browser screenshot screenshots/asset-verification.png
```

### Backend Tasks

**Mandatory Verification Checklist**:
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] API endpoints work correctly (test with curl or test client)
- [ ] Error handling works as expected
- [ ] Edge cases tested (empty input, invalid input, boundary conditions)

**Tools Required**:
- TypeScript compiler (MANDATORY)
- API testing tool (curl, Postman, or test client)

### Error Handling Tasks

**Mandatory Verification Checklist**:
- [ ] Error scenarios tested (MANDATORY)
- [ ] Fallback behavior works correctly
- [ ] Console warnings/logs appear as expected
- [ ] Error messages are user-friendly
- [ ] Error recovery works correctly

**Tools Required**:
- `agent-browser` (for frontend error handling)
- Browser console inspection

### Edge Cases

**Always Test**:
- Empty state handling
- Boundary conditions
- Error conditions
- Invalid input handling
- Network failure scenarios (if applicable)

## When Testing Fails

Don't abandon testing on first failure:

1. **Try alternative verification methods**
   - Test seam → Console logs → Screenshot → Code review
   - See `references/fallback-strategies.md`

2. **Document why testing was skipped** (if necessary)
   - Note in progress.txt
   - Explain fallback method used

3. **Don't mark complete without verification**
   - At minimum, verify via code review
   - Ensure TypeScript compilation passes

## Task Reverification Workflow

**When a task appears to be already complete, follow this standardized reverification workflow.**

**Observed Issue**: Tasks may appear complete from code review but need functional verification to ensure they actually work.

### Reverification Checklist

**Before marking a task as "already complete", verify:**

1. **Read progress.txt entry for task**
   - Check if task was previously completed
   - Review completion date and verification details
   - Note any limitations or issues documented

2. **Verify code still exists and matches description**
   - Code exists in expected location
   - Code matches task description
   - No regressions or breaking changes

3. **Run functional tests** (MANDATORY - never skip)
   - Runtime functional test required
   - Browser testing for web apps (MANDATORY)
   - Game runtime testing for Phaser games (MANDATORY)
   - Integration verification for assets (MANDATORY)

4. **Verify TypeScript compilation**
   - Run `npx tsc --noEmit`
   - Fix any compilation errors
   - Ensure no type errors

5. **Check for regressions**
   - Verify existing functionality still works
   - Test related features
   - Check for breaking changes

6. **Update task status appropriately**
   - Document reverification results
   - Update progress.txt with findings
   - Mark as verified or note issues found

### Decision Framework: Verify vs Re-Implement

**Verify Existing Implementation When:**
- ✅ Code exists and matches task description
- ✅ Recent completion (within last few days)
- ✅ Code structure looks correct
- ✅ No obvious issues in code review

**Re-Implement When:**
- ❌ Code is missing or incomplete
- ❌ Code doesn't match task description
- ❌ Old completion (weeks/months ago)
- ❌ Code has obvious issues or bugs
- ❌ Functionality doesn't work in runtime testing

### Functional Testing Requirements for Reverification

**CRITICAL**: Always test runtime functionality, even for "already complete" tasks.

**Never skip functional verification** - code review alone is insufficient.

**Reverification Testing Workflow**:

```markdown
## Task Reverification: [Task Name]

**Status**: Appears complete from code review

**Reverification Steps**:
1. ✅ Code exists: [File location]
2. ✅ Code matches description: [Verification details]
3. ✅ TypeScript compilation: [Result]
4. ✅ Runtime functional test: [Test details]
   - Browser testing: [Results]
   - Test seam verification: [Results]
   - Visual validation: [Screenshots]
5. ✅ No regressions: [Verification details]

**Decision**: Verify existing / Re-implement
**Action**: [What was done]
```

### Example Reverification Workflow

**Scenario**: Task appears complete, need to verify

```bash
# 1. Check progress.txt
grep -A 10 "TASK-ID" tasks/progress.txt

# 2. Verify code exists
grep -r "functionName" src/

# 3. Verify code matches description
read_file("src/scenes/GameScene.ts")

# 4. Run TypeScript compilation
npx tsc --noEmit

# 5. Run functional tests (MANDATORY)
npm run dev
agent-browser open "http://localhost:5173?test=1&seed=42"
agent-browser eval "window.__TEST__.commands.testFunctionality()"
agent-browser eval "window.__TEST__.gameState()"

# 6. Verify no regressions
agent-browser eval "window.__TEST__.commands.testExistingFeatures()"

# 7. Document results
# Update progress.txt with reverification results
```

### Common Reverification Scenarios

**Scenario 1: Code Exists, Needs Verification**
- Code found in expected location
- Matches task description
- **Action**: Run functional tests, verify works correctly
- **Decision**: Verify existing implementation

**Scenario 2: Code Exists, But Doesn't Work**
- Code found but runtime testing fails
- Functionality doesn't work as expected
- **Action**: Fix issues or re-implement
- **Decision**: Re-implement or fix existing code

**Scenario 3: Code Missing**
- No code found for task
- Task marked complete but no implementation
- **Action**: Implement functionality
- **Decision**: Re-implement

**Scenario 4: Code Exists, But Outdated**
- Code exists but old completion date
- May have regressions or breaking changes
- **Action**: Verify functionality, fix if needed
- **Decision**: Verify and fix if needed

## Verification Checklist Template

See `references/verification-checklist.md` for detailed checklist template.

## Resources

- `references/verification-checklist.md` - Detailed checklist template
- `references/fallback-strategies.md` - Alternative verification methods
