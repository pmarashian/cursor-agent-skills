# Phaser Game Testing Patterns

## Test Seam as Primary Method

For Phaser games, test seam commands are the PRIMARY method for testing. DOM-based interactions don't work reliably with canvas-rendered content.

## Test Seam Discovery

Always check for test seam before attempting DOM interactions:

```bash
# Check if test seam exists
agent-browser eval "window.__TEST__ && window.__TEST__.commands"
```

## Common Test Seam Commands

```bash
# Navigation
agent-browser eval "window.__TEST__.commands.clickStartGame()"
agent-browser eval "window.__TEST__.commands.clickPlayAgain()"

# Game state
agent-browser eval "window.__TEST__.gameState()"

# Timer manipulation
agent-browser eval "window.__TEST__.commands.setTimer(5)"
agent-browser eval "window.__TEST__.commands.fastForwardTimer(10)"

# Player movement
agent-browser eval "window.__TEST__.commands.movePlayerToExit()"
agent-browser eval "window.__TEST__.commands.movePlayerTo(100, 200)"
```

## Scene Transition Testing

Test seam `sceneKey` may lag on scene transitions. Use console logs as fallback:

```bash
# Navigate to game
agent-browser eval "window.__TEST__.commands.clickStartGame()"

# Wait for transition
agent-browser wait 2000

# Check console logs (fallback if sceneKey doesn't update)
agent-browser console
```

## Known Issues

- **sceneKey may not update immediately** on scene transitions
- **Use console logs as fallback** verification
- **Wait 1-2 seconds** after transition before checking test seam

## Best Practices

- Prefer test seam commands over keyboard simulation
- Always check for test seam availability first
- Use console logs as fallback when sceneKey lags
- Document test seam commands in progress.txt
