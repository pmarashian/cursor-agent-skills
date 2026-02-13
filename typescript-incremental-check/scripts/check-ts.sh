#!/bin/bash
# Quick TypeScript compilation check
# Returns exit code 0 if successful, 1 if errors

npx tsc --noEmit

exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo "✅ TypeScript compilation successful"
else
  echo "❌ TypeScript compilation errors found"
fi

exit $exit_code
