declare var Matter: any;
import { GameSprite } from './game-sprite';
var Engine = Matter.Engine,
    MatterWorld = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite;

export class MoveableObject extends GameSprite {
    speedX;
    speedY;
    applyGravity = false;
    isGrounded = false;
    groundedSprite;
    moveSprite = true;

    constructor(engine, x, y, width, height, log = false) {
        super(engine, x, y, width, height, log);
    }

    override advance() {
        if (this.domObject) {
            let top = this.y;
            if (isNaN(top)) {
                top = 0;
            }
            if (this.speedY && !this.isGrounded) {
                top += this.speedY;
                this.y = top;
            }

            let left = this.x;
            if (isNaN(left)) {
                left = 0;
            }

            if (this.speedX) {
                left += this.speedX;
                this.x = left;
            }
            if (!this.speedX) {
                this.speedX = 0;
            }
            if (this.moveSprite) {
                //Matter.Body.setPosition(this.body, { x: this.x, y: this.y });
                //Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: 0 });
                if (this.body) {
                    Matter.Body.setVelocity(this.body, { x: this.speedX, y: 0 });
                }
            }
            super.advance();
        }
    }
}