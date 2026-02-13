---
name: pre-flight-checklist
description: Check if task is already complete, verify dev server status and port, check TypeScript compilation status, verify required dependencies are installed, and load all required skills upfront. Use at the start of every task to ensure proper environment setup and avoid wasted effort.
---

# Pre-Flight Checklist

## Overview

Systematic checklist to verify environment setup and task status before starting work. Prevents wasted effort on already-complete tasks and ensures proper environment configuration.

## Checklist Items

### 1. Check if Task is Already Complete

**Before starting work**, verify task status:

1. **Read task file**: `tasks/next_task.md`
2. **Read progress file**: `tasks/progress.txt`
3. **Check completion status**: Is task already marked complete?
4. **Verify success criteria**: Are all criteria met?

**If task is complete**:
- Document verification
- Move to next task
- Don't redo completed work

**Pattern**:
```bash
# Check task status
cat tasks/next_task.md
cat tasks/progress.txt | grep -A 10 "US-XXX"
```

### 2. Verify Dev Server Status and Port

**Before browser testing**, verify server is running:

1. **Check if server is running**: Look for process on port
2. **Detect actual port**: Check `vite.config.ts`, `package.json`, terminal output
3. **Verify server health**: Poll server endpoint
4. **Start server if needed**: `npm run dev`

**Reference**: See `dev-server-port-detection` skill for port discovery patterns.

**Pattern**:
```bash
# Check if server is running
lsof -i :3000 || lsof -i :5173

# Check port configuration
grep -A 5 "server:" vite.config.ts
grep -i "port" package.json

# Verify server health
curl -s http://localhost:3000 > /dev/null && echo "Server is running"
```

#### Backend / Server (for backend tasks)

**Before the first API test**:
- Check that the target port is free (e.g. `lsof -i :PORT`) or that a single dev server is listening.
- Start command: use an **explicit directory** (e.g. `cd /absolute/path/to/backend && npm run dev`).
- Optional: short-timeout health check (e.g. `curl -f http://localhost:PORT/api/health --max-time 5`).
- **Auth tasks**: First register/login may be slow (e.g. bcrypt). Use request timeouts (e.g. 10–15 s) for register/login checks (e.g. `curl --max-time 10`).

#### Path convention (monorepos)

- Backend library code lives under `backend/src/lib/`, not `backend/lib/`.
- Confirm the backend app root for the repo before creating API or lib files.

### 3. Check TypeScript Compilation Status

**Before making changes**, verify current compilation status:

1. **Run TypeScript check**: `npx tsc --noEmit`
2. **Fix any existing errors**: Don't add to broken codebase
3. **Verify compilation passes**: Must pass before proceeding

**Reference**: See `typescript-incremental-check` skill for compilation patterns.

**Pattern**:
```bash
# Check TypeScript compilation
npx tsc --noEmit

# If errors exist, fix them first
# Then proceed with task
```

### 4. Verify Required Dependencies are Installed

**Before using packages**, verify dependencies:

1. **Check `package.json`**: Required packages listed
2. **Check `node_modules`**: Packages installed
3. **Run `npm install` if needed**: Install missing dependencies

**Pattern**:
```bash
# Check if node_modules exists
ls node_modules

# Install if needed
npm install

# Verify specific package
npm list <package-name>
```

### 5. Load All Required Skills Upfront

**Before starting implementation**, discover and load skills:

1. **Search all skills**: `search_skills("")` to list all
2. **Load relevant skills**: Load skills needed for task
3. **Reference skill documentation**: Read skill docs before using

**Reference**: See `agent-workflow-guidelines` skill for skill discovery workflow.

**Pattern**:
```bash
# Search all skills
search_skills("")

# Load relevant skills
load_skill("phaser-game-testing")
load_skill("agent-browser")
load_skill("typescript-incremental-check")
```

## Environment Validation Patterns

### Pattern 1: Complete Pre-Flight Check

```bash
# 1. Check task status
cat tasks/next_task.md
cat tasks/progress.txt

# 2. Verify dev server
lsof -i :3000 || npm run dev &

# 3. Check TypeScript
npx tsc --noEmit

# 4. Verify dependencies
npm install

# 5. Load skills
search_skills("")
load_skill("relevant-skill-1")
load_skill("relevant-skill-2")
```

### Pattern 2: Quick Pre-Flight Check

**For simple tasks**, minimal check:

```bash
# Quick check
npx tsc --noEmit && echo "TypeScript OK"
lsof -i :3000 && echo "Server running" || npm run dev &
```

### Pattern 3: Pre-Flight Script

**Create reusable script**:

```bash
#!/bin/bash
# pre-flight.sh

echo "Checking task status..."
cat tasks/next_task.md

echo "Checking TypeScript..."
npx tsc --noEmit

echo "Checking server..."
lsof -i :3000 || echo "Server not running, start with: npm run dev"

echo "Checking dependencies..."
npm list --depth=0

echo "Pre-flight check complete"
```

## Common Issues and Solutions

### Issue 1: Task Already Complete

**Symptom**: Progress shows task complete, all criteria met
**Solution**: Verify completion, document, move to next task

### Issue 2: Server Not Running

**Symptom**: Browser connection fails, port not in use
**Solution**: Start server with `npm run dev`, wait for ready

### Issue 3: TypeScript Errors

**Symptom**: Compilation fails with errors
**Solution**: Fix errors before proceeding, don't add to broken codebase

### Issue 4: Missing Dependencies

**Symptom**: Import errors, module not found
**Solution**: Run `npm install` to install missing packages

### Issue 5: Skills Not Loaded

**Symptom**: Missing patterns, inefficient workflows
**Solution**: Load relevant skills upfront, reference documentation

## Workflow Integration

### Start of Task Workflow

1. **Pre-flight check**: Run complete checklist
2. **Fix any issues**: Resolve environment problems
3. **Load skills**: Discover and load relevant skills
4. **Begin implementation**: Start task work

### During Task Workflow

- **After edits**: Run TypeScript check immediately
- **Before testing**: Verify server is running
- **Before completion**: Verify all criteria met

## Best Practices

1. **Always run pre-flight check**: Don't skip verification
2. **Fix issues before starting**: Don't work with broken environment
3. **Load skills upfront**: Don't discover patterns mid-task
4. **Verify completion**: Check if task already done
5. **Document findings**: Note any issues or patterns discovered

## Resources

- `agent-workflow-guidelines` skill - General workflow guidelines
- `dev-server-port-detection` skill - Port discovery patterns
- `typescript-incremental-check` skill - Compilation patterns
- `task-verification-workflow` skill - Task completion verification
