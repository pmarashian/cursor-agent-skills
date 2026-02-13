---
name: progress-tracking
description: Format and structure for progress.txt files, documenting learnings, managing Codebase Patterns section, and when to update progress. Use when documenting work progress, learnings, or codebase patterns.
---

# Progress Tracking

This skill provides comprehensive guidance on managing `tasks/progress.txt` files, including format, structure, learnings documentation, and Codebase Patterns management.

## Overview

The `tasks/progress.txt` file serves as:
- A log of completed work across tasks
- A repository of reusable patterns and learnings
- A reference for codebase-specific best practices
- A guardrail system for common pitfalls

## Reading Progress Files

### Essential Reading Workflow

When starting a task, always read `tasks/progress.txt` to understand:

1. **Previous work completed** on this and other tasks
2. **Codebase patterns and learnings** from previous iterations
3. **The Codebase Patterns section** (at the top) contains reusable patterns and guardrails
4. **Task-specific entries** show what was done in previous iterations

### Codebase Patterns Section

**CRITICAL: Check the "Codebase Patterns" section first** when reading `tasks/progress.txt`:

- Reusable patterns discovered in previous work
- Common gotchas and how to avoid them
- Best practices specific to this codebase
- Guardrails and constraints

This section is maintained at the top of the file and contains patterns that apply across all tasks.

## Progress.txt Format

### Update Requirements

**Update progress.txt incrementally:**

- After major milestones
- When patterns are discovered
- Before task completion

### Document Learnings

**Use "Learnings for future iterations:" section:**

- Include codebase patterns discovered
- Document successful approaches
- Note common pitfalls
- Capture reusable insights

### Success Criteria Validation

**Explicitly verify each success criterion:**

- Document verification method used
- Update progress before completion marker
- Include evidence of completion

### Progress file update (appending to tasks/progress.txt)

When appending a new task block to `tasks/progress.txt`:

1. **Read the last 10–20 lines** to get exact trailing content and structure.
2. **Use a unique anchor** for search_replace (e.g. task ID and date: `## YYYY-MM-DD - Task TASK_ID`). Do not replace on generic separators like `---` alone.
3. **After two failed replace attempts**, switch to shell append: `echo '...' >> tasks/progress.txt` instead of further edits.
4. Optionally: reuse recent grep results when the query is unchanged to avoid redundant searches.

## Entry Format

When you complete work or learn something, append to `tasks/progress.txt`:

```
## [Date/Time] - Task {id}
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Pattern discovered
  - Gotcha encountered
  - Useful context
---
```

## Codebase Patterns Management

### Adding to Codebase Patterns

If you discover a reusable pattern that should be available for all future tasks, add it to the "Codebase Patterns" section at the top of the file.

**When to add:**
- Pattern is reusable across multiple tasks
- Pattern prevents common errors
- Pattern represents a codebase-specific best practice
- Pattern documents a constraint or guardrail

**Format for Codebase Patterns:**

```
# Codebase Patterns

## Pattern Name
- Description of pattern
- When to use it
- Example usage
- Common pitfalls to avoid
```

### Maintaining Codebase Patterns

- Keep patterns concise and actionable
- Update patterns when they evolve
- Remove outdated patterns
- Group related patterns together

## Progress Documentation Best Practices

### When to Document

1. **After major milestones:** Document significant progress
2. **When patterns are discovered:** Capture reusable insights
3. **Before task completion:** Ensure all learnings are recorded
4. **When encountering issues:** Document problems and solutions

### What to Document

1. **Implementation details:** What was built and how
2. **Files changed:** Track which files were modified
3. **Learnings:** Patterns, gotchas, and useful context
4. **Verification:** How success criteria were validated

### Progress Update Checklist

Before completing a task, verify:

- ✅ Major milestones documented
- ✅ Learnings captured in "Learnings for future iterations:" section
- ✅ Codebase patterns added if applicable
- ✅ Success criteria validation documented
- ✅ Files changed are listed
- ✅ Verification method is recorded

## Integration with Other Skills

This skill works with:

- **task-verification-workflow**: Document verification methods
- **error-recovery-patterns**: Document error handling learnings
- **completion-marker-optimization**: Update progress before completion marker

## Examples

### Example Entry

```
## 2026-01-27 14:30 - Task 42
- Implemented user authentication flow
- Files changed: src/auth.ts, src/components/Login.tsx
- **Learnings for future iterations:**
  - Use JWT tokens stored in httpOnly cookies for security
  - Always validate tokens server-side before processing requests
  - Pattern: Authentication middleware should check token expiry
---
```

### Example Codebase Pattern

```
# Codebase Patterns

## Authentication Pattern
- Always use httpOnly cookies for JWT tokens
- Validate tokens server-side in middleware
- Check token expiry before processing requests
- Never expose tokens in client-side JavaScript
```
