// Template for HUD components
// Customize for specific HUD element needs

export class HUDComponent {
  private scene: Phaser.Scene;
  private background: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text;
  
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    this.scene = scene;
    
    // Create background
    this.background = scene.add.graphics();
    this.background.fillStyle(0x000000, 0.7);
    this.background.fillRoundedRect(x, y, width, height, 5);
    this.background.setDepth(100);
    
    // Create text
    this.text = scene.add.text(x + 10, y + 10, '', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.text.setDepth(101);
  }
  
  setText(text: string) {
    this.text.setText(text);
  }
  
  setColor(color: string) {
    this.text.setColor(color);
  }
  
  destroy() {
    this.background.destroy();
    this.text.destroy();
  }
}

// Usage example
/*
const hud = new HUDComponent(this, 10, 10, 120, 40);
hud.setText('01:00');
hud.setColor('#ffffff');
*/
