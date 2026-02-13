---
name: nextjs-params
description: Ensures Next.js 15 dynamic route parameters are properly awaited. Checks for missing await on params destructuring and provides automatic fixes.
---

# Next.js Dynamic Route Params Fixer

## Purpose

This skill detects and fixes Next.js 15 dynamic route parameter issues where `params` is used without `await`. In Next.js 15, dynamic route parameters became asynchronous and must be awaited.

## When to Use

This skill should trigger automatically when:

1. **File Analysis**: Analyzing TypeScript/JavaScript files in Next.js projects
2. **Code Review**: When reviewing route handler files
3. **Error Detection**: When Next.js throws the error: `params should be awaited before using its properties`

## Problem Detection

The skill looks for these patterns in Next.js route handlers:

### ❌ Incorrect Patterns:
```typescript
// Missing await on params destructuring
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params; // ERROR: params not awaited
}

// Missing Promise type annotation
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params; // ERROR: type should be Promise<{ id: string }>
}
```

### ✅ Correct Patterns:
```typescript
// Proper async params usage
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // ✅ Correct
}
```

## Automatic Fixes

When the skill detects an issue, it provides these quick fixes:

### Fix 1: Add await to params destructuring
```typescript
// Before:
const { id } = params;

// After:
const { id } = await params;
```

### Fix 2: Update type annotation to Promise<>
```typescript
// Before:
{ params }: { params: { id: string } }

// After:
{ params }: { params: Promise<{ id: string }> }
```

### Fix 3: Combined fix (both await and type update)
```typescript
// Before:
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
}

// After:
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

## Implementation Details

### Detection Logic

The skill analyzes route handler functions by:

1. **Route Handler Identification**: Looks for functions exported as HTTP methods (GET, POST, PUT, DELETE) in files with dynamic routes (`[param]` in path)

2. **Params Usage Analysis**:
   - Checks if `params` is destructured from function parameters
   - Verifies if `await` is used when destructuring `params`
   - Validates type annotations include `Promise<>`

3. **Context Awareness**: Only applies to Next.js 15+ projects (detected by package.json or Next.js version)

### File Patterns to Monitor

- `src/app/**/[**]/route.ts` (App Router dynamic routes)
- `src/pages/**/[**].tsx` (Pages Router dynamic routes - though less common in Next.js 15)
- Any TypeScript file with route handler patterns

## Error Prevention

This skill helps prevent the common Next.js 15 migration error:

```
Error: Route "/api/example/[id]" used `params.id`. `params` should be awaited before using its properties.
```

## Usage Examples

### Before Fix:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params; // ❌ Error: params not awaited

    // ... rest of handler
  }
}
```

### After Automatic Fix:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params; // ✅ Fixed automatically

    // ... rest of handler
  }
}
```

## Benefits

- **Prevents Runtime Errors**: Eliminates Next.js 15 params errors
- **Automatic Migration**: Helps upgrade from Next.js 13/14 to 15
- **Type Safety**: Ensures proper TypeScript types for async params
- **Developer Experience**: Quick fixes reduce manual refactoring time

## Configuration

The skill is enabled by default for:
- Next.js projects (detected by `next` in package.json)
- TypeScript files with route handler patterns
- Files containing dynamic route segments `[param]`

Disable the skill for specific files by adding a comment:
```typescript
// @cursor-skill-disable nextjs-params
```