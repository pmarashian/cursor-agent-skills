// Template for Phaser scenes
// Customize for specific scene needs

import { GameState } from '../types/GameState';

export class SceneName extends Phaser.Scene {
  private gameState: GameState;
  
  constructor() {
    super({ key: 'SceneName' });
  }
  
  preload() {
    // Load assets
    // this.load.image('key', 'path/to/image.png');
    // this.load.audio('key', 'path/to/audio.mp3');
  }
  
  create(data?: any) {
    // Initialize game state
    this.gameState = data?.gameState || {
      // Default state
    };
    
    // Initialize scene elements
    // this.createBackground();
    // this.createUI();
    
    // Set up test seam
    this.setupTestSeam();
  }
  
  update() {
    // Game loop
    // Update game state, check collisions, etc.
  }
  
  private setupTestSeam() {
    window.__TEST__ = {
      sceneKey: this.scene.key,
      gameState: () => this.gameState,
      commands: {
        // Scene-specific commands
        // Example: clickStartGame: () => { this.scene.start('GameScene'); }
      }
    };
  }
  
  shutdown() {
    // Clean up resources
    // this.timer?.destroy();
    // this.input.removeAllListeners();
  }
}
