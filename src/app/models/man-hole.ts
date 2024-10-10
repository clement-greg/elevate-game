import { GameSprite } from "./game-sprite";

export class ManHole extends GameSprite {
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
        super(engine, x, y, 288, 144, false, { mode: 'ellipse', dontUpdatePosition: true });
        const brickDiv = document.createElement('div');
        brickDiv.className = 'man-hole';
        this.domObject = brickDiv;

        this.body.isStatic = true;

        this.body.friction = 0;
        this.body.label = 'man-hole';
        this.domObject.style.left = `${this.x - this.width / 2}px`;
        this.domObject.style.top = `${this.y - this.height / 2}px`;

    }

    override advance() {

    }
}