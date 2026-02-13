# Verification Checklist Template

## Code Changes

- [ ] All required files modified/created
- [ ] No syntax errors
- [ ] TypeScript compilation passes
- [ ] No console errors in browser
- [ ] Code follows project patterns

## Success Criteria

For each success criterion:

- [ ] Criterion verified
- [ ] Verification method documented
- [ ] Test result noted

Example:
```
Criterion 1: "Timer displays in MM:SS format"
- Verified: Browser testing with test seam setTimer(65)
- Result: Timer displays as "01:05" ✓
```

## Testing

### Browser Testing (Web/Game Tasks)
- [ ] Application loads without errors
- [ ] UI elements render correctly
- [ ] User interactions work as expected
- [ ] Test seam commands work (for Phaser games)

### TypeScript Compilation
- [ ] `npx tsc --noEmit` passes
- [ ] No type errors
- [ ] No syntax errors

### Edge Cases
- [ ] Empty state tested
- [ ] Boundary conditions tested
- [ ] Error conditions tested (if applicable)

## Documentation

- [ ] Progress.txt updated with learnings
- [ ] Code comments added (if needed)
- [ ] Test seam commands documented (if added)

## Git

- [ ] Changes committed
- [ ] Commit message follows format: `feat: TASK-{ID} - {description}`
- [ ] No unnecessary files committed

## Final Verification

- [ ] All checklist items completed
- [ ] All success criteria verified
- [ ] Ready to mark task complete
