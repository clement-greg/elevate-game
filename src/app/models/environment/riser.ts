declare var Matter: any;
import { Game } from "../base/game";
import { GameSprite } from "../base/game-sprite";
import { World } from "./world";

export class Riser extends GameSprite {
    moveDirection;
    initialX;
    initialY;
    moveDistance = 400;
    moveSpeed = 4;
    downMoveSpeed = 15;
    stationaryWait = 1000;
    newlyCreated = false;
    frame = 0;
    frameCount = 4;
    delayCount = 0;
    sign = 1;
    frictionTop; 
    waiting = false;

    constructor(engine, x, y) {
        super(engine, x, y, 323, 34);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'riser';
        this.domObject = brickDiv;

        this.body.isStatic = true;

        this.initialX = x;
        this.initialY = y;
        this.body.friction = 1;
        // const frictionBody = Matter.Bodies.rectangle(x + 4, y - 37, this.width - 16, 2);
        // Matter.Composite.add(engine.world, frictionBody);
        // frictionBody.isStatic = true;
        // frictionBody.friction = 1;
        // frictionBody.label = 'riser-top';
        // this.frictionTop = frictionBody;
        this.objectType = 'riser';
        this.body.label = 'riser'
    }

    override advance() {
        if(this.waiting) {
            return;
        }
        const y = this.body.position.y;

        if (y >= World.getInstance().height - 150) {
            this.waiting = true;
            setTimeout(()=> this.waiting = false, this.stationaryWait);
            this.sign = -1;
        } else if (y <= 200) {
            this.waiting = true;
            setTimeout(()=> this.waiting = false, this.stationaryWait);
            this.sign = 1;
        }
        const newX = this.body.position.x;
        const newY = this.body.position.y + (this.sign > 0 ? this.downMoveSpeed : this.moveSpeed) * this.sign;

        Matter.Body.setPosition(this.body, { x: newX, y: newY });
        //Matter.Body.setPosition(this.frictionTop, { x: newX + 4, y: newY - 38 });
        super.advance();

    }
}
