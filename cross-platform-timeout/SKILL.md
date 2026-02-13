---
name: cross-platform-timeout
description: Run a command with a time limit in a cross-platform way. Do not rely on GNU timeout (coreutils)—it is not default on macOS. Use when agents may run on macOS or when timeout 10s npm run dev fails.
---

# Cross-Platform "Run with Timeout"

**Do not use `timeout`** (GNU coreutils) when agents may run on macOS—it is not installed by default.

## Options

- **macOS / BSD**: `(cmd &); sleep N; kill $!` — run command in background, sleep N seconds, then kill the background job.
- **Alternative**: Small Node script that spawns the command and kills it after N seconds.

## When to Use

- When a task uses something like `timeout 10s npm run dev` and it fails on macOS.
- Prefer documenting one cross-platform pattern rather than retrying with `timeout` repeatedly.

## Keep It Short

This skill should stay a few lines; the main point is "do not use `timeout` unless the environment is known to provide it."
