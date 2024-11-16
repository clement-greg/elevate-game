declare var Matter: any;
import { GameSprite } from "./game-sprite";

export class ShortLog extends GameSprite {
    moveDirection;
    initialX;
    initialY;
    moveDistance = 400;
    moveSpeed = 2;
    stationaryWait = 2;
    newlyCreated = false;
    frame = 0;
    frameCount = 4;
    delayCount = 0;
    sign;
    frictionTop;

    constructor(engine, x, y) {
        super(engine, x, y, 216, 72);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'log-short';
        this.domObject = brickDiv;

       this.body.isStatic = true;

        this.initialX = x;
        this.initialY = y;
        this.body.friction = 0;
        const frictionBody = Matter.Bodies.rectangle(x + 4, y - 37, this.width- 16, 2);
        Matter.Composite.add(engine.world, frictionBody);
        frictionBody.isStatic = true;
        frictionBody.friction = 1;
        frictionBody.label = 'log-short';
        this.frictionTop = frictionBody;
        this.objectType = 'ShortLog';
    }

    override advance() {
        const x = this.body.position.y;

        if(x >= this.initialY + this.moveDistance) {
            this.sign = -1;
        } else if(x <= this.initialY) {
            this.sign = 1;
        }
        const newX = this.body.position.x;
        const newY = this.body.position.y + this.moveSpeed * this.sign;
        Matter.Body.setPosition(this.body, {x: newX, y: newY});
        Matter.Body.setPosition(this.frictionTop, {x: newX + 4, y: newY - 38});
        super.advance();

    }
}




