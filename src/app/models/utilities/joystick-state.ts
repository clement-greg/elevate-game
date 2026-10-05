// Returns the gamepad at the requested index, or the first connected gamepad if
// that slot is empty. Browsers don't guarantee a lone controller lands in slot 0
// (e.g. Chrome/Edge on macOS often report it at index 1).
export function getActiveGamepad(preferredIndex = 0): Gamepad | null {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads) {
        return null;
    }
    return gamepads[preferredIndex] ?? Array.from(gamepads).find(gp => !!gp) ?? null;
}

const AXIS_THRESHOLD = 0.5;

// Simple wrapper around the browser GamePad API to expose
// a more event driven API
export class JoystickState {
    left = false;
    up = false;
    right = false;
    down = false;
    start: number;
    onLeftJoyStick: () => void;
    onRightJoyStick: () => void;
    onUpJoyStick: () => void;
    onDownJoyStick: () => void;
    onButtonPress: (index: number) => void;
    private pressedButtons: number[] = [];

    constructor(public index: number) {
        this.gameLoop();
    }

    dispose() {
        delete this.onLeftJoyStick;
        delete this.onRightJoyStick;
        delete this.onUpJoyStick;
        delete this.onDownJoyStick;
        delete this.onButtonPress;
    }

    get isLeft() {
        return this.left;
    }
    get isRight() {
        return this.right;
    }
    get isUp() {
        return this.up;
    }
    get isDown() {
        return this.down;
    }
    buttonPressed(b: any) {
        if (typeof b === "object") {
            return b.pressed;
        }
        return b === 1.0;
    }

    gameLoop() {
        const gp = getActiveGamepad(this.index);
        if (gp) {


            let i = 0;
            for (let pressedIndex of this.pressedButtons) {
                const btn = gp.buttons[pressedIndex];

                if (!btn?.pressed) {
                    this.pressedButtons.splice(this.pressedButtons.indexOf(pressedIndex), 1);
                }
            }

            i = 0;
            for (const btn of gp?.buttons) {
                if (this.buttonPressed(btn) && this.pressedButtons.indexOf(i) === -1) {
                    this.pressedButtons.push(i);
                    if (this.onButtonPress) {
                        this.onButtonPress(i);
                    }
                }
                i++;
            }
            // Analog sticks rarely report exactly +/-1 (especially on macOS), so use a
            // threshold, and also honor the D-pad (standard mapping buttons 12-15).
            const dpad = (i: number) => this.buttonPressed(gp.buttons[i]);
            const left = gp.axes[0] < -AXIS_THRESHOLD || dpad(14);
            const right = gp.axes[0] > AXIS_THRESHOLD || dpad(15);
            const up = gp.axes[1] < -AXIS_THRESHOLD || dpad(12);
            const down = gp.axes[1] > AXIS_THRESHOLD || dpad(13);

            if (this.left && !left && this.onLeftJoyStick) {
                this.onLeftJoyStick();
            }
            if (this.right && !right && this.onRightJoyStick) {
                this.onRightJoyStick();
            }
            if (this.up && !up && this.onUpJoyStick) {
                this.onUpJoyStick();
            }
            if (this.down && !down && this.onDownJoyStick) {
                this.onDownJoyStick();
            }

            this.left = left;
            this.right = right;
            this.up = up;
            this.down = down;
        }
        this.start = requestAnimationFrame(this.gameLoop.bind(this));
    }
}
