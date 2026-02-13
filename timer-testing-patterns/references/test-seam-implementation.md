# Test Seam Timer Implementation

## Adding Timer Commands to Test Seam

Add timer manipulation commands to scene's test seam:

```typescript
create() {
  // ... scene initialization ...
  
  window.__TEST__ = {
    sceneKey: this.scene.key,
    gameState: () => this.gameState,
    commands: {
      setTimer: (seconds: number) => {
        this.gameState.time_remaining = seconds;
        this.updateTimer();
      },
      fastForwardTimer: (seconds: number) => {
        this.gameState.time_remaining -= seconds;
        if (this.gameState.time_remaining < 0) {
          this.gameState.time_remaining = 0;
        }
        this.updateTimer();
      },
      triggerGameOver: () => {
        this.handleGameOver();
      }
    }
  };
}
```

## Timer Update Method

Ensure timer display updates when manipulated:

```typescript
updateTimer() {
  const minutes = Math.floor(this.gameState.time_remaining / 60);
  const seconds = this.gameState.time_remaining % 60;
  this.timerText.setText(
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  );
  
  // Update color if needed
  if (this.gameState.time_remaining <= 10) {
    this.timerText.setColor('#ff0000');
  }
}
```

## Game Over Handler

Handle game over when timer expires:

```typescript
handleGameOver() {
  if (this.gameState.time_remaining <= 0) {
    this.scene.start('GameOverScene', {
      score: this.gameState.score
    });
  }
}
```

## Complete Example

```typescript
export class GameScene extends Phaser.Scene {
  private gameState: GameState;
  private timerText: Phaser.GameObjects.Text;
  
  create() {
    // Initialize game state
    this.gameState = {
      time_remaining: 60,
      score: 0
    };
    
    // Create timer display
    this.timerText = this.add.text(10, 10, '01:00', {
      fontSize: '24px',
      color: '#ffffff'
    });
    
    // Start timer countdown
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.gameState.time_remaining--;
        this.updateTimer();
        if (this.gameState.time_remaining <= 0) {
          this.handleGameOver();
        }
      },
      loop: true
    });
    
    // Test seam setup
    window.__TEST__ = {
      sceneKey: this.scene.key,
      gameState: () => this.gameState,
      commands: {
        setTimer: (seconds: number) => {
          this.gameState.time_remaining = seconds;
          this.updateTimer();
        },
        fastForwardTimer: (seconds: number) => {
          this.gameState.time_remaining -= seconds;
          if (this.gameState.time_remaining < 0) {
            this.gameState.time_remaining = 0;
          }
          this.updateTimer();
        },
        triggerGameOver: () => {
          this.handleGameOver();
        }
      }
    };
  }
  
  updateTimer() {
    const minutes = Math.floor(this.gameState.time_remaining / 60);
    const seconds = this.gameState.time_remaining % 60;
    this.timerText.setText(
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
  }
  
  handleGameOver() {
    this.scene.start('GameOverScene', {
      score: this.gameState.score
    });
  }
}
```
