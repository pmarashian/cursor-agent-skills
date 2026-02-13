# Scene Lifecycle Patterns

## preload()

Load assets before scene starts:

```typescript
preload() {
  // Images
  this.load.image('player', 'assets/player.png');
  this.load.image('tile', 'assets/tile.png');
  
  // Audio
  this.load.audio('bgMusic', 'assets/music.mp3');
  this.load.audio('soundEffect', 'assets/sound.wav');
  
  // JSON data
  this.load.json('levelData', 'assets/level1.json');
}
```

## create()

Initialize scene after assets load:

```typescript
create(data?: any) {
  // Initialize game state
  this.gameState = data?.gameState || this.createDefaultState();
  
  // Create game objects
  this.createBackground();
  this.createPlayer();
  this.createUI();
  
  // Set up input
  this.setupInput();
  
  // Set up test seam
  this.setupTestSeam();
  
  // Start game loop
  this.startGameLoop();
}
```

## update()

Game loop - called every frame:

```typescript
update() {
  // Update player movement
  this.updatePlayer();
  
  // Check collisions
  this.checkCollisions();
  
  // Update UI
  this.updateUI();
  
  // Check win/lose conditions
  this.checkGameState();
}
```

## shutdown()

Clean up when scene stops:

```typescript
shutdown() {
  // Destroy timers
  this.timer?.destroy();
  
  // Remove listeners
  this.input.removeAllListeners();
  this.events.removeAllListeners();
  
  // Clean up game objects
  this.player?.destroy();
}
```

## Best Practices

- Load all assets in `preload()`
- Initialize everything in `create()`
- Keep `update()` efficient (called every frame)
- Clean up in `shutdown()`
- Set up test seam in `create()`
