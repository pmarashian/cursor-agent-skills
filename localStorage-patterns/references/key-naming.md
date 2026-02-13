# localStorage Key Naming Conventions

## This Codebase Pattern

**Format**: camelCase

**Examples**:
- `pixelGameSettings` (not `pixel-game-settings`)
- `highScores` (not `high-scores`)
- `gamePreferences` (not `game-preferences`)

## Finding Existing Keys

1. **Check storage utility files**
   - Look for files like `storage.ts`, `settings.ts`, `localStorage.ts`
   - Search for `localStorage.getItem` or `localStorage.setItem`

2. **Check for constants file**
   - Look for exported constants like `STORAGE_KEY`, `SETTINGS_KEY`
   - Example: `export const STORAGE_KEY = 'pixelGameSettings';`

3. **Search codebase**
   - Search for `localStorage.getItem(` to find all keys
   - Check for key definitions

## Key Format Verification

**Always verify**:
- Read the actual storage utility file
- Don't assume naming convention
- Check for exported constants
- Match existing pattern in codebase

## Common Mistakes

- **Assuming kebab-case**: `pixel-game-settings` ❌
- **Correct**: `pixelGameSettings` ✅

- **Not checking existing keys**: Creating duplicate keys ❌
- **Correct**: Reuse existing keys ✅

## Best Practices

- Export keys as constants in storage utility files
- Use descriptive names that indicate purpose
- Follow existing codebase pattern (camelCase)
- Document keys in code comments
