declare var Matter: any;
import { GameSprite } from "./game-sprite";

export class Log extends GameSprite {
    moveDirection;
    initialX;
    initialY;
    moveDistance = 200;
    moveSpeed = 2;
    stationaryWait = 2;
    newlyCreated = false;
    frame = 0;
    frameCount = 4;
    delayCount = 0;
    sign;

    constructor(engine, x, y) {
        super(engine, x, y, 576, 72);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'log';
        this.domObject = brickDiv;

        this.body.isStatic = true;

        this.initialX = x;
        this.initialY = y;
        this.body.friction = 1;
        Matter.Body.setMass(this.body, 100000);

    }

    override advance() {
        const x = this.body.position.x;

        if (x >= this.initialX + this.moveDistance) {
            this.sign = -1;
        } else if (x <= this.initialX) {
            this.sign = 1;
        }
        Matter.Body.setPosition(this.body, { x: this.body.position.x + this.moveSpeed * this.sign, y: this.initialY });
        super.advance();

    }
}