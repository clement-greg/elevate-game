import { GameSprite } from "./game-sprite";
declare var Matter: any;

var Engine = Matter.Engine,
    MatterWorld = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite;

export class Brick extends GameSprite {
    frictionTop;
    constructor(engine, x, y) {
        super(engine, x, y, 72, 72);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'brick';
        this.domObject = brickDiv;

        this.body.isStatic = true;
        this.body.friction = 0;
        this.body.label = 'Brick';

        const frictionBody = Bodies.rectangle(x + 4, y - 36, this.width - 16, 2);
        Composite.add(engine.world, frictionBody);
        frictionBody.isStatic = true;
        frictionBody.friction = 1;
        frictionBody.label = 'brick-top';
        this.frictionTop = frictionBody;
    }

    bounceIt() {
        this.domObject.classList.add('bounce');
        setTimeout(() => this.domObject.classList.remove('bounce'), 200);
    }
}

export class SolidBlock extends GameSprite {
    frictionTop;
    constructor(engine, x, y) {
        super(engine, x, y, 72, 72);
        const solidBlockDiv = document.createElement('div');
        solidBlockDiv.className = 'solid-block';
        this.objectType = 'solid-block';
        this.domObject = solidBlockDiv;

        this.body.isStatic = true;
        this.body.friction = 0;
        this.body.label = 'solid-block';

        const frictionBody = Bodies.rectangle(x + 4, y - 36, this.width - 16, 2);
        Composite.add(engine.world, frictionBody);
        frictionBody.isStatic = true;
        frictionBody.friction = 1;
        frictionBody.label = 'solid-block';
        this.frictionTop = frictionBody;
    }

    
}