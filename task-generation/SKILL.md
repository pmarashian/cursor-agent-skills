---
name: task-generation
description: Comprehensive guide for breaking down Product Requirements Documents (PRDs) into structured, actionable development tasks with dependencies, priorities, and acceptance criteria. Use when generating task breakdowns from PRDs, creating development task lists, or structuring work items for software projects. Essential for converting high-level requirements into granular, executable development tasks.
---

# Task Generation

This skill provides comprehensive rules and requirements for generating structured development tasks from Product Requirements Documents (PRDs).

## Required Task Fields

Every task MUST have all of these fields:

- **id**: Sequential integer starting from 1
- **description**: Specific, actionable task description with file paths and technical details
- **success_criteria**: Array of 3-7 specific, testable acceptance criteria (MANDATORY - DO NOT SKIP)
- **dependencies**: Array of task IDs this task depends on (use empty array `[]` if none)
- **suggested_role**: One of "backend", "frontend-ui", or "frontend-logic"
- **priority**: Integer 1-100 (1 = highest priority/critical path, 100 = nice-to-have)

## User Story Format Examples

**CRITICAL: Task descriptions MUST be in user story format: "As a [role], I need/want [capability] so [benefit]"**

The `description` field MUST follow user story format. Technical details belong in `success_criteria`, NOT in descriptions.

### ✅ CORRECT Examples (User Story Format):

1. **Backend Setup Task:**
   - Description: "As a developer, I need a Next.js backend API project scaffolded so I have a foundation for all API endpoints."
   - Title: "Initialize Next.js Backend Project"
   - Success Criteria: ["Next.js 14+ project with App Router and TypeScript configured", "Project runs locally and typecheck passes"]

2. **Data Schema Task:**
   - Description: "As a developer, I need the Redis hash structure for clans so clan data can be stored."
   - Title: "Create Clans Hash Schema"
   - Success Criteria: ["Helper functions for clan hash operations with schema: key `clan:{id}`, fields: name, description, owner_id, emoji, created_at", "Utility to generate unique clan IDs and typecheck passes"]

3. **API Endpoint Task:**
   - Description: "As a user, I want to create a clan so I can start a private sharing group."
   - Title: "Create Clan API Endpoint"
   - Success Criteria: ["POST /api/clans accepts {name, description, emoji}, creates clan hash with owner_id from auth, adds owner to clan_members with admin role", "Adds clan to user_clans, returns clan_id, and typecheck passes"]

4. **Feature Task:**
   - Description: "As a user, I want a combined feed of all my clans so I can see everything at once."
   - Title: "Get Combined Feed"
   - Success Criteria: ["GET /api/feeds/combined accepts {page, limit}, aggregates posts from all user_clans using zunionstore, sorted by created_at DESC", "Deduplicates multi-clan posts (show once with multi-clan indicator), includes clan_metadata with personalized names/emojis, and typecheck passes"]

5. **UI Task:**
   - Description: "As a user, I want to see a combined feed of all my clans."
   - Title: "Implement Combined Feed UI"
   - Success Criteria: ["Chronological list of posts from all clans, each post shows clan badge with personalized name/emoji, multi-clan posts show \"In X clans\" indicator", "Infinite scroll pagination, typecheck passes, and verify in browser using dev-browser skill"]

### ❌ INCORRECT Examples (Technical Format - DO NOT USE):

- ❌ "Verify Tech Stack npm packages and versions from PRD. Run: npm install..."
- ❌ "Create/verify Vite + TypeScript project scaffolding and config..."
- ❌ "Implement POST /api/clans endpoint with validation"
- ❌ "Set up Redis hash structure for storing clan data"
- ❌ "Create Next.js project with TypeScript and App Router"

### Key Principles:

- **Descriptions**: User story format only ("As a [role], I need/want [capability] so [benefit]")
- **Titles**: User-focused, not technical (e.g., "Initialize Next.js Backend Project" not "Verify Tech Stack npm packages")
- **Success Criteria**: Technical and implementation details go here, not in descriptions
- **Roles**: Use appropriate roles (developer, user, clan owner, etc.) based on the task context

## Task Granularity Rules

- Break down complex features into 5-15 individual atomic tasks each
- Each task should take 30-90 minutes for an experienced developer
- Include specific file paths like "src/components/Button.tsx" or "api/routes/users.ts"
- Specify exact technical implementations, not high-level concepts
- Tasks should be independently completable without external dependencies

## Task Count Guidance

Generate appropriate number of tasks based on PRD complexity:

- **Simple PRDs** (single feature, small scope): 5-20 tasks
- **Medium PRDs** (multiple features): 20-50 tasks
- **Complex PRDs** (full applications): 50-100+ tasks

Do not force a minimum task count. The number should match the actual scope and complexity of the PRD.

## Package Verification Tasks

Extract ALL npm packages from the PRD's "Tech Stack" section and create verification tasks:

- Create separate task for each package group (framework, UI, database, etc.)
- Format: "Run: npm install [package]@[exact-version]" (agent will check, not install)
- Verification tasks should be tasks 1-5 with no dependencies
- Example: Task 1: "Verify Tech Stack npm packages and versions from PRD"

## Quality Assurance Integration

### Browser Testing (Web Applications)

When PRD describes web applications, add to ALL frontend tasks:

- **"Verify in browser using agent-browser skill"** (MANDATORY - must use this exact wording)
- "Navigate to development server URL and test core user flows"
- "Verify UI elements render correctly and interactions work as expected"
- "Check browser console for errors during testing"
- "Take screenshots to verify visual correctness"

### Code Quality Verification

Add to ALL tasks:

- "Verify TypeScript compilation succeeds without errors"
- "Ensure code follows established patterns and conventions"
- "Test error handling and edge cases"

### Functional Verification

For implementation tasks:

- "Demonstrate working functionality, not just code completion"
- "Run application and verify features work end-to-end"
- "Include manual testing steps in acceptance criteria"

### Automated Testing Requirements

Where appropriate:

- "Include unit tests for business logic functions"
- "Add integration tests for API endpoints"
- "Verify test suite passes before marking task complete"

## Success Criteria Standards

- Must be observable and testable (not subjective)
- Include specific values, file paths, and exact text matches
- Cover error cases and edge conditions
- Example: "TypeScript compilation succeeds with no errors in src/types/GameState.ts"

## Reference Format

Use the structure from `prds/prd-amp-reference.json` as a reference for granularity and detail level. Each task should be as specific and actionable as those examples.

## Dependency Management

- Tasks should form a clear dependency chain
- Frontend tasks typically depend on backend API tasks
- UI tasks depend on data/logic tasks
- Testing tasks depend on implementation tasks

## Role Assignment

- **backend**: API endpoints, database schemas, server-side logic
- **frontend-logic**: State management, business logic, data fetching
- **frontend-ui**: Components, styling, user interactions
