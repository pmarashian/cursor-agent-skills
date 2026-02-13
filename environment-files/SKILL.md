---
name: environment-files
description: Rules for .env file handling, .env.example template format, and what's allowed vs forbidden. Use when working with environment variables, API keys, or configuration files.
---

# Environment Files

This skill provides comprehensive guidance on handling environment files, including `.env` files, `.env.example` templates, and security best practices.

## Overview

Environment files contain sensitive configuration data that must be handled carefully. This skill defines what's allowed and forbidden when working with environment variables.

## Critical Rules

### DO NOT MODIFY

**CRITICAL FILES - DO NOT MODIFY WITHOUT EXPLICIT INSTRUCTION:**

- `.env` files: Never commit or modify environment files (except `.env.example` templates)
- `.env.local`, `.env.development`, `.env.production` - All actual environment files
- git configuration files

## Allowed Operations

### ✅ Create/Edit `.env.example`

**ALLOWED:**
- Create/edit `.env.example` - template showing required environment variables (no actual secrets)
- Format: `KEY_NAME=example_value_here` (with descriptive placeholder values)

**Example `.env.example`:**

```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
NEXT_PUBLIC_API_URL=http://localhost:3000/api
OPENAI_API_KEY=sk-your-api-key-here
```

### ✅ Template Format Guidelines

When creating `.env.example` files:

1. **Use descriptive placeholders:**
   - `sk-your-api-key-here` (not actual keys)
   - `postgresql://user:password@localhost:5432/dbname` (example connection string)
   - `http://localhost:3000/api` (example URLs)

2. **Include comments when helpful:**
   ```
   # Database connection string
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   
   # Public API endpoint
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

3. **Document required vs optional:**
   ```
   # Required: API key for external service
   OPENAI_API_KEY=sk-your-api-key-here
   
   # Optional: Override default port
   PORT=3000
   ```

## Forbidden Operations

### ❌ Creating or Modifying Actual .env Files

**FORBIDDEN:**
- Creating or modifying `.env`, `.env.local`, `.env.development`, `.env.production`, or any other .env files
- Never commit actual secrets, API keys, passwords, or sensitive data
- Never read values from actual .env files

### ❌ Committing Sensitive Data

**FORBIDDEN:**
- Committing `.env` files to version control
- Including actual API keys, passwords, or secrets in code
- Hardcoding sensitive values in source files

### Backend: defensive defaults and .env persistence

- In some environments, `.env` may not be persisted. For backend tasks, prefer **defensive defaults in code** (e.g. `process.env.REDIS_URL || 'redis://localhost:6379'`) and document in `.env.example`.
- **Do not create or modify `.env`** in the repo; only create or update `.env.example` and document that users copy it to `.env` locally. Never commit `.env`.
- Optionally: use env-based bcrypt cost (e.g. `BCRYPT_ROUNDS`) for dev vs prod so tests can be fast without editing source.

## Best Practices

### 1. .gitignore Verification

Always ensure `.env` files are in `.gitignore`:

```
.env
.env.local
.env.development
.env.production
.env*.local
```

### 2. Template Maintenance

- Keep `.env.example` up to date with all required variables
- Document variable purpose and format
- Include example values that show expected format
- Mark required vs optional variables

### 3. Security Checklist

Before committing code, verify:

- ✅ No `.env` files are staged for commit
- ✅ `.env.example` contains only placeholders
- ✅ No hardcoded secrets in source files
- ✅ `.gitignore` includes `.env` patterns

## Integration with Other Skills

This skill works with:

- **git-best-practices**: For ensuring `.env` files are properly ignored
- **pre-implementation-check**: For verifying environment setup before implementation

## Common Patterns

### Pattern 1: Creating .env.example

```bash
# Create template file
cat > .env.example << EOF
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# API Keys
OPENAI_API_KEY=sk-your-api-key-here

# Server Configuration
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF
```

### Pattern 2: Verifying .gitignore

```bash
# Check if .env is ignored
git check-ignore .env

# Verify .gitignore contains .env patterns
grep -E "\.env" .gitignore
```

### Pattern 3: Template Validation

Before committing, verify `.env.example`:
- Contains no actual secrets
- Has descriptive placeholder values
- Documents all required variables
- Includes helpful comments

## Troubleshooting

### Issue: .env File Accidentally Created

**Solution:**
1. Remove from git tracking: `git rm --cached .env`
2. Add to `.gitignore`: `echo ".env" >> .gitignore`
3. Verify: `git status` should not show `.env`

### Issue: Secrets in Commit History

**Solution:**
1. Remove sensitive data from repository
2. Rotate compromised credentials
3. Use `git filter-branch` or BFG Repo-Cleaner if needed
4. Update `.gitignore` to prevent future commits

## Examples

### ✅ Good .env.example

```
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# API Keys (get from service provider)
OPENAI_API_KEY=sk-your-api-key-here
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here

# Application Settings
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### ❌ Bad .env.example (Contains Actual Secrets)

```
DATABASE_URL=postgresql://realuser:realpassword@realhost:5432/realdb
OPENAI_API_KEY=sk-proj-actualRealKey123456789
```

**Never include actual secrets, even in example files!**
