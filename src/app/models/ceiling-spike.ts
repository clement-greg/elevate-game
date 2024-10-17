import { GameSprite } from "./game-sprite";


export class CeilingSpike extends GameSprite {
    constructor(engine, x, y) {
        super(engine, x, y, 72, 72);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'ceiling-spike';
        this.domObject = brickDiv;

        this.body.isStatic = true;
        this.body.friction = 0;
        this.body.label = 'ceiling-spike';
        this.objectType = 'ceiling-spike';
    }
}