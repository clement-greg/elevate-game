declare var Matter: any;
import { GameSprite } from "../base/game-sprite";

export class Log extends GameSprite {
    moveDirection;
    initialX;
    initialY;
    moveDistance = 600;
    moveSpeed = 1.5;
    stationaryWait = 4;
    newlyCreated = false;
    frame = 0;
    frameCount = 4;
    delayCount = 0;
    sign;
    frictionTop;

    constructor(engine, x, y) {
        super(engine, x, y, 576, 72);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'log';
        this.domObject = brickDiv;

        this.body.isStatic = true;
        this.objectType = 'Log';
        this.body.label = 'log';

        this.initialX = x;
        this.initialY = y;
        this.body.friction = 0;
        Matter.Body.setMass(this.body, 100000);
        const frictionBody = Matter.Bodies.rectangle(x + 4, y - 37, this.width - 16, 2);
        Matter.Composite.add(engine.world, frictionBody);
        frictionBody.isStatic = true;
        frictionBody.friction = 1;
        frictionBody.label = 'log';
        this.frictionTop = frictionBody;
    }

    override advance() {
        const x = this.body.position.x;
        if (x >= this.initialX + this.moveDistance) {
            this.sign = -1;
        } else if (x <= this.initialX) {
            this.sign = 1;
        }
        const newX = this.body.position.x + this.moveSpeed * this.sign;
        Matter.Body.setPosition(this.body, { x: newX, y: this.initialY });
        Matter.Body.setPosition(this.frictionTop, { x: newX + 4, y: this.initialY });
        super.advance();
    }
}