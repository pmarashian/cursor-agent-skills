// Template for Phaser component test scenes
// Replace ComponentName with the component under test (e.g. Slider, Toggle, HUDTimer)

declare global {
  interface Window {
    __TEST__?: any;
  }
}

export class ComponentNameTestScene extends Phaser.Scene {
  // Replace with actual component state (e.g. slider value, toggle state)
  private componentValue: number = 0.5;

  constructor() {
    super({ key: 'ComponentNameTestScene' });
  }

  preload() {
    // Only assets needed for this component
    // this.load.image('slider-track', 'assets/sprites/slider-track.png');
    // this.load.image('slider-handle', 'assets/sprites/slider-handle.png');
  }

  create() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // Placeholder: one "component" (replace with actual component instantiation)
    const placeholder = this.add.rectangle(centerX, centerY, 200, 40, 0x1E293B);
    placeholder.setStrokeStyle(2, 0x64748B);

    this.add.text(centerX, centerY - 60, 'ComponentName Test', {
      fontSize: '18px',
      color: '#E6EEF6',
      fontFamily: '"Press Start 2P", "Courier New", monospace'
    }).setOrigin(0.5);

    this.setupTestSeam();
  }

  private setupTestSeam() {
    if (!window.__TEST__) {
      window.__TEST__ = {};
    }
    window.__TEST__.sceneKey = this.scene.key;
    window.__TEST__.ready = true;
    window.__TEST__.commands = {
      getState: () => ({
        value: this.componentValue,
        sceneKey: this.scene.key
      }),
      setValue: (value: number) => {
        this.componentValue = Math.max(0, Math.min(1, value));
        return this.componentValue;
      }
      // Add component-specific commands, e.g.:
      // getSliderValue: () => this.slider.getValue(),
      // setSliderValue: (v: number) => this.slider.setValue(v),
      // clickToggle: () => this.toggle.toggle(),
      // getToggleState: () => this.toggle.isOn()
    };
  }
}
