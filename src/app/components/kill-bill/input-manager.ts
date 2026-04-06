export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  punch: boolean;
  kick: boolean;
  block: boolean;
  start: boolean;
}

export class InputManager {
  private keys: Set<string> = new Set();
  private prevKeys: Set<string> = new Set();
  private gamepadState: InputState = this.emptyState();
  private prevGamepadState: InputState = this.emptyState();
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
  }

  private emptyState(): InputState {
    return {
      left: false, right: false, up: false, down: false,
      punch: false, kick: false, block: false, start: false,
    };
  }

  private onKeyDown(e: KeyboardEvent) {
    this.keys.add(e.code);
    e.preventDefault();
  }

  private onKeyUp(e: KeyboardEvent) {
    this.keys.delete(e.code);
    e.preventDefault();
  }

  getState(): InputState {
    // Poll gamepad
    const gp = this.pollGamepad();

    const state: InputState = {
      // WASD + Arrow Keys + Gamepad
      left: this.keys.has('KeyA') || this.keys.has('ArrowLeft') || gp.left,
      right: this.keys.has('KeyD') || this.keys.has('ArrowRight') || gp.right,
      up: this.keys.has('KeyW') || this.keys.has('ArrowUp') || this.keys.has('Space') || gp.up,
      down: this.keys.has('KeyS') || this.keys.has('ArrowDown') || gp.down,
      // J = punch, K = kick, L = block (or gamepad buttons)
      punch: this.keys.has('KeyJ') || gp.punch,
      kick: this.keys.has('KeyK') || gp.kick,
      block: this.keys.has('KeyL') || gp.block,
      start: this.keys.has('Enter') || gp.start,
    };

    return state;
  }

  // Returns true if the key was just pressed this frame (not held)
  isJustPressed(current: InputState, field: keyof InputState): boolean {
    return current[field] && !this.getPrevField(field);
  }

  private getPrevField(field: keyof InputState): boolean {
    // For keyboard, check prevKeys
    switch (field) {
      case 'punch': return this.prevKeys.has('KeyJ') || this.prevGamepadState.punch;
      case 'kick': return this.prevKeys.has('KeyK') || this.prevGamepadState.kick;
      case 'block': return this.prevKeys.has('KeyL') || this.prevGamepadState.block;
      case 'up': return this.prevKeys.has('KeyW') || this.prevKeys.has('ArrowUp') || this.prevKeys.has('Space') || this.prevGamepadState.up;
      case 'start': return this.prevKeys.has('Enter') || this.prevGamepadState.start;
      default: return false;
    }
  }

  savePreviousState() {
    this.prevKeys = new Set(this.keys);
    this.prevGamepadState = { ...this.gamepadState };
  }

  private pollGamepad(): InputState {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (!gp) return this.emptyState();

    const deadzone = 0.3;
    const axes = gp.axes;
    const buttons = gp.buttons;

    this.gamepadState = {
      left: axes[0] < -deadzone || (buttons[14]?.pressed ?? false),
      right: axes[0] > deadzone || (buttons[15]?.pressed ?? false),
      up: axes[1] < -deadzone || (buttons[12]?.pressed ?? false),
      down: axes[1] > deadzone || (buttons[13]?.pressed ?? false),
      punch: buttons[0]?.pressed ?? false,     // A / Cross
      kick: buttons[2]?.pressed ?? false,       // X / Square
      block: buttons[1]?.pressed ?? false,      // B / Circle
      start: buttons[9]?.pressed ?? false,      // Start
    };

    return this.gamepadState;
  }

  destroy() {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
  }
}
