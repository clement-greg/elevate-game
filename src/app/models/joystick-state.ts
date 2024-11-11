// Simple wrapper around the browser GamePad API to expose
// a more event driven API
export class JoystickState {
    left = false;
    up = false;
    right = false;
    down = false;
    onLeftJoyStick: () => void;
    onRightJoyStick: () => void;
    onUpJoyStick: () => void;
    onDownJoyStick: () => void;
    onButtonPress: (index: number) => void;
    private pressedButtons: number[] = [];

    constructor(public index: number) {
        this.gameLoop();
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
        const gamepads = navigator.getGamepads();
        if (!gamepads) {
            return;
        }

        const gp = gamepads[this.index];
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



            const js1 = this;
            if (js1.left && gp.axes[0] != -1) {
                if (this.onLeftJoyStick) {
                    this.onLeftJoyStick();
                }
            }
            if (js1.right && gp.axes[0] != 1) {
                if (this.onRightJoyStick) {
                    this.onRightJoyStick();
                }
            }
            if (js1.up && gp.axes[1] !== -1) {
                if (this.onUpJoyStick) {
                    this.onUpJoyStick();
                }
            }
            if (js1.down && gp.axes[1] !== 1) {
                if (this.onDownJoyStick) {
                    this.onDownJoyStick();
                }
            }

            js1.left = gp.axes[0] === -1;
            js1.right = gp.axes[0] === 1;
            js1.up = gp.axes[1] === -1;
            js1.down = gp.axes[1] === 1;

        }


        this.start = requestAnimationFrame(this.gameLoop.bind(this));
    }

    start: any;
}
