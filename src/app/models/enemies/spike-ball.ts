import { MoveableObject } from "../base/moveable-object";
declare var Matter: any;

export class SpikeBall extends MoveableObject {
    moveDirection;
    initialX;
    initialY;
    moveDistance = 300;
    moveSpeed = 6;
    stationaryWait = 2;
    newlyCreated = false;
    frame = 0;
    frameCount = 4;
    delayCount = 0;
    rotate = 0;

    constructor(engine, x, y) {
        super(engine, x, y, 130, 130);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'spike-ball';
        this.domObject = brickDiv;
        this.body.label = 'spike-ball';
        Matter.Body.setMass(this.body, 1600);

        this.initialX = x;
        this.initialY = y;
        this.body.friction = 0;
    }

    override advance() {

        if (this.delayCount === 1) {
            if (this.moveDirection === 'Left') {
                this.rotate = this.rotate - 5;
            } 
            if (this.moveDirection === 'Right' || !this.moveDirection) {
                this.rotate = this.rotate +  5;
            }
            this.domObject.style.transform = `rotate(${this.rotate}deg)`;
            this.delayCount = 0;

        } else {
            this.delayCount = this.delayCount + 1;
        }
        this.frame++;
        if (this.frame === this.frameCount) {
            this.frame = 0;
        }
        if (this.moveDirection === 'Stationary' || this.newlyCreated) {
            if(!this.newlyCreated) {
                this.speedX  = 0;
                super.advance();
            }
            return;
        }
        if (this.moveDirection === 'Left') {
            if (this.x < this.initialX - this.moveDistance) {
                this.moveDirection = 'Stationary';
                this.speedX = 0;
                setTimeout(() => {
                    this.moveDirection = 'Right';
                    this.speedX = 2;
                }, this.stationaryWait * 1000);
            }
        } else {
            this.x = this.x + this.moveSpeed;
            if (this.x > this.initialX + this.moveDistance) {
                this.moveDirection = 'Stationary';
                this.speedX = 0;
                setTimeout(() => {
                    this.moveDirection = 'Left';
                    this.speedX = -2;
                }, this.stationaryWait * 1000);
            } else {
                this.speedX = 2;
            }
        }
        super.advance();

    }
}