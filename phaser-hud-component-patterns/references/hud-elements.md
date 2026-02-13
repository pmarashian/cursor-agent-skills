# HUD Elements

## Timer Display

Display timer in MM:SS format:

```typescript
createTimerDisplay() {
  // Background
  const bg = this.add.graphics();
  bg.fillStyle(0x000000, 0.7);
  bg.fillRoundedRect(10, 10, 120, 40, 5);
  bg.setDepth(100);
  
  // Timer text
  this.timerText = this.add.text(20, 20, '01:00', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  this.timerText.setDepth(101);
}

updateTimer() {
  const minutes = Math.floor(this.timeRemaining / 60);
  const seconds = this.timeRemaining % 60;
  this.timerText.setText(
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  );
  
  // Change color when low
  if (this.timeRemaining <= 10) {
    this.timerText.setColor('#ff0000');
  }
}
```

## Score/Coin Counter

Display score or coin count:

```typescript
createScoreDisplay() {
  // Background
  const bg = this.add.graphics();
  bg.fillStyle(0x000000, 0.7);
  bg.fillRoundedRect(this.cameras.main.width - 130, 10, 120, 40, 5);
  bg.setDepth(100);
  
  // Score text
  this.scoreText = this.add.text(
    this.cameras.main.width - 120,
    20,
    'Score: 0',
    {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }
  );
  this.scoreText.setDepth(101);
}

updateScore() {
  this.scoreText.setText(`Score: ${this.score}`);
}
```

## Health Bar

Display health as a bar:

```typescript
createHealthBar() {
  // Background bar
  this.healthBarBg = this.add.graphics();
  this.healthBarBg.fillStyle(0x333333, 0.8);
  this.healthBarBg.fillRect(10, 60, 200, 20);
  this.healthBarBg.setDepth(100);
  
  // Health bar
  this.healthBar = this.add.graphics();
  this.healthBar.setDepth(101);
  
  this.updateHealth();
}

updateHealth() {
  this.healthBar.clear();
  const healthPercent = this.health / this.maxHealth;
  const barWidth = 200 * healthPercent;
  
  // Color based on health
  const color = healthPercent > 0.5 ? 0x00ff00 : 
                healthPercent > 0.25 ? 0xffff00 : 0xff0000;
  
  this.healthBar.fillStyle(color, 1);
  this.healthBar.fillRect(10, 60, barWidth, 20);
}
```

## Positioning

Position HUD elements relative to camera:

```typescript
// Top-left
const x = 10;
const y = 10;

// Top-right
const x = this.cameras.main.width - width - 10;
const y = 10;

// Bottom-left
const x = 10;
const y = this.cameras.main.height - height - 10;

// Bottom-right
const x = this.cameras.main.width - width - 10;
const y = this.cameras.main.height - height - 10;
```

## Best Practices

- Use consistent depth values (100+ for HUD)
- Position relative to camera dimensions
- Use semi-transparent backgrounds
- Update text in real-time
- Expose HUD state in test seam
