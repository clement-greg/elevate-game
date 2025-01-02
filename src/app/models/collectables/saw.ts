declare var Matter: any;
import { GameSprite } from "../base/game-sprite";

export class Saw extends GameSprite {

    constructor(engine, x, y) {
        super(engine, x, y, 72, 72);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'saw tool';
        this.domObject = brickDiv;

        this.body.isStatic = true;
        this.body.friction = 0;
        this.body.label = 'saw';
        Matter.Body.setMass(this.body, 0.001);
    }
}

export class Screwdriver extends GameSprite {

    constructor(engine, x, y) {
        super(engine, x, y, 72, 72);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'screwdriver tool';
        this.domObject = brickDiv;

        this.body.isStatic = true;
        this.body.friction = 0;
        this.body.label = 'screwdriver';
        Matter.Body.setMass(this.body, 0.001);
    }
}

export class Wrench extends GameSprite {

    constructor(engine, x, y) {
        super(engine, x, y, 72, 72);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'wrench tool';
        this.domObject = brickDiv;

        this.body.isStatic = true;
        this.body.friction = 0;
        this.body.label = 'wrench';
        Matter.Body.setMass(this.body, 0.001);
    }
}

export class Hammer extends GameSprite {

    constructor(engine, x, y) {
        super(engine, x, y, 72, 72);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'hammer tool';
        this.domObject = brickDiv;

        this.body.isStatic = true;
        this.body.friction = 0;
        this.body.label = 'hammer';
        Matter.Body.setMass(this.body, 0.001);
    }
}

export class Drill extends GameSprite {

    constructor(engine, x, y) {
        super(engine, x, y, 72, 72);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'drill tool';
        this.domObject = brickDiv;

        this.body.isStatic = true;
        this.body.friction = 0;
        this.body.label = 'drill';
        Matter.Body.setMass(this.body, 0.001);
    }
}