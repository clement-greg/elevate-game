import { MoveableObject } from "./moveable-object";

export class Coin extends MoveableObject {
    frames = 13;
    runFrame = 0;
    slower = 2;
    slowerFactor = 7;

    constructor(engine = null, x = null, y = null, extraClass = null) {
        super(engine, x, y, 72, 72);
        if (this.body) {
            this.body.isStatic = true;
        }
        this.width = 72;
        this.height = 72;
        const brickDiv = document.createElement('div');
        brickDiv.className = 'coin';
        this.objectType = 'Coin';
        if (extraClass) {
            brickDiv.classList.add(extraClass);
        }
        this.domObject = brickDiv;

    }

    override advance() {
        if (this.slower % this.slowerFactor !== 0) {
            this.slower++;
            return;
        }
        this.slower = 1;
        this.domObject.style.backgroundPositionX = (this.runFrame * -72) + 'px';
        this.runFrame++;
        if (this.runFrame > this.frames) {
            this.runFrame = 0;
        }
        super.advance();
    }
}