import { GameSprite } from "./game-sprite";

export class Fridge1 extends GameSprite {
    constructor(engine, x, y) {
        super(engine, x, y, 72, 130);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'fridge1';
        this.domObject = brickDiv;

        //this.body.isStatic = true;
        this.body.friction = 1;
        this.body.label = 'fridge';
    }
}

export class Fridge2 extends GameSprite {
    constructor(engine, x, y) {
        super(engine, x, y, 72, 130);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'fridge2';
        this.domObject = brickDiv;

        //this.body.isStatic = true;
        this.body.friction = 1;
        this.body.label = 'fridge';
    } 
}

export class Fridge3 extends GameSprite {
    constructor(engine, x, y) {
        super(engine, x, y, 72, 130);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'fridge3';
        this.domObject = brickDiv;

        //this.body.isStatic = true;
        this.body.friction = 1;
        this.body.label = 'fridge';
    } 
}