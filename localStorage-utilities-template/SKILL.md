---
name: localStorage-utilities-template
description: Template for creating localStorage utility functions following established patterns. Use when creating new localStorage utilities, when storage patterns need standardization, or when error handling is needed. Provides template code with error handling and validation.
---

# localStorage Utilities Template

## Overview

Template for creating localStorage utilities following established patterns. Standardize utility creation with consistent error handling and validation.

## Template

See `assets/template.ts` for complete localStorage utility template.

## Key Features

- Error handling (availability checks, JSON parsing)
- Data validation
- Default fallback values
- Consistent API: `load*()`, `save*()`, `get*()`
- Exported storage keys

## Usage

1. Copy `assets/template.ts` to your utility file
2. Replace `DataType` with actual type
3. Replace `DEFAULT_DATA` with actual defaults
4. Update `STORAGE_KEY` with camelCase key name
5. Customize validation if needed

## Best Practices

- Use camelCase for storage keys
- Always include error handling
- Validate parsed data structure
- Export storage keys as constants
- Use consistent API naming

## Resources

- `assets/template.ts` - Template code with error handling, validation
