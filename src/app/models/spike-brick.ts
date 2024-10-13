import { GameSprite } from "./game-sprite";


export class SpikeBrick extends GameSprite {
    constructor(engine, x, y) {
        super(engine, x, y, 72, 72);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'spike-brick';
        this.domObject = brickDiv;

        this.body.isStatic = true;
        this.body.friction = 0;
        this.body.label = 'spike-brick';
        this.objectType = 'spike-brick';
    }
}