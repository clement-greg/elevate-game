declare var Matter: any;
import { MoveableObject } from "./moveable-object";
var Engine = Matter.Engine,
    MatterWorld = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite;

export class Ram extends MoveableObject {
    moveDirection;
    initialX;
    initialY;
    moveDistance = 300;
    moveSpeed = 5;
    stationaryWait = .5;
    newlyCreated = false;
    frame = 0;
    frameCount = 5;
    delayCount = 0;

    constructor(engine, x, y) {
        super(engine, x, y,  95.43, 95.43, true);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'ram';
        this.domObject = brickDiv;
        this.body.label = 'Ram';
        this.body.friction = 0;
        Body.setMass(this.body, 100000);
    }

    override advance() {
        if (this.delayCount === 5) {
            this.domObject.style.backgroundPositionX = `-${this.frame * 100}px`;
            this.delayCount = 0;
        } else {
            this.delayCount = this.delayCount + 1;
        }
        this.frame++;
        if (this.frame === this.frameCount) {
            this.frame = 0;
        }
        if (this.moveDirection === 'Stationary' || this.newlyCreated) {
            return;
        }

        if (this.moveDirection === 'Left') {
            //this.x = this.x - this.moveSpeed;
            if (this.x < this.initialX - this.moveDistance) {
                //this.x = this.initialX - this.moveDistance;
                this.moveDirection = 'Stationary';
                this.speedX = 0;
                setTimeout(() => {
                    this.moveDirection = 'Right';
                    this.speedX = 2;
                    this.domObject.classList.remove('invert');
                }, this.stationaryWait * 1000);
            }
        } else {
            //this.x = this.x + this.moveSpeed;
            if (this.x > this.initialX + this.moveDistance) {
                this.moveDirection = 'Stationary';
                setTimeout(() => {
                    this.moveDirection = 'Left';
                    this.speedX = -2;
                    this.domObject.classList.add('invert');
                }, this.stationaryWait * 1000);
            } else {
                this.speedX = 2;
            }
        }
        super.advance();
    }
}