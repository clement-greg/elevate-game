//

declare var Matter: any;
import { GameSprite } from "./game-sprite";

export class IBeam extends GameSprite {
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
        brickDiv.className = 'i-beam';
        this.domObject = brickDiv;

        this.body.isStatic = true;
        this.body.label = 'i-beam';
        this.objectType = 'i-beam';

        this.initialX = x;
        this.initialY = y;
        this.body.friction = 0;
        Matter.Body.setMass(this.body, 100000);
        const frictionBody = Matter.Bodies.rectangle(x + 4, y - 40, this.width - 16, 2);
        Matter.Composite.add(engine.world, frictionBody);
        frictionBody.isStatic = true;
        frictionBody.friction = 1;
        frictionBody.label = 'i-beam';
        this.frictionTop = frictionBody;
    }
}