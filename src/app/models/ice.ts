declare var Matter: any;
import { GameSprite } from "./game-sprite";
var Engine = Matter.Engine,
    MatterWorld = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite;

export class Ice extends GameSprite {
    frictionTop;
    constructor(engine, x, y) {
        super(engine, x, y, 72, 72);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'ice';
        this.domObject = brickDiv;

        this.body.isStatic = true;
        this.body.friction = 0;
        this.body.label = 'Ice';

        // const frictionBody = Bodies.rectangle(x + 4, y - 36, this.width - 16, 2);
        // Composite.add(engine.world, frictionBody);
        // frictionBody.isStatic = true;
        // frictionBody.friction = 1;
        // this.body.label = 'brick-top';
        // this.frictionTop = frictionBody;
    }

    bounceIt() {
        this.domObject.classList.add('bounce');
        setTimeout(() => this.domObject.classList.remove('bounce'), 200);
    }
}