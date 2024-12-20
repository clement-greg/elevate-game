import { GameSprite } from "../base/game-sprite";

export class Fridge1 extends GameSprite {
    constructor(engine, x, y) {
        super(engine, x, y, 1, 1);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'fridge1';
        this.domObject = brickDiv;
        this.objectType = 'Fridge1';

        //this.body.isStatic = true;
        this.body.friction = 1;
        this.body.label = 'fridge';
    }
}

export class Fridge2 extends GameSprite {
    constructor(engine, x, y) {
        super(engine, x, y, 1, 1);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'fridge2';
        this.domObject = brickDiv;
        this.objectType = 'Fridge2';

        //this.body.isStatic = true;
        this.body.friction = 1;
        this.body.label = 'fridge';
    } 
}

export class Fridge3 extends GameSprite {
    constructor(engine, x, y) {
        super(engine, x, y, 1, 1);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'fridge3';
        this.domObject = brickDiv;
        this.objectType = 'Fridge3';

        //this.body.isStatic = true;
        this.body.friction = 1;
        this.body.label = 'fridge';
    } 
}




export class AC1 extends GameSprite {
    constructor(engine, x, y) {
        super(engine, x, y, 1, 1);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'ac1';
        this.domObject = brickDiv;
        this.objectType = 'ac1';

        //this.body.isStatic = true;
        this.body.friction = 1;
        this.body.label = 'ac1';
    }
}

export class AC2 extends GameSprite {
    constructor(engine, x, y) {
        super(engine, x, y, 1, 1);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'ac2';
        this.domObject = brickDiv;
        this.objectType = 'ac2';

        //this.body.isStatic = true;
        this.body.friction = 1;
        this.body.label = 'ac2';
    } 
}

export class AC3 extends GameSprite {
    constructor(engine, x, y) {
        super(engine, x, y, 1, 1);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'ac3';
        this.domObject = brickDiv;
        this.objectType = 'ac3';

        //this.body.isStatic = true;
        this.body.friction = 1;
        this.body.label = 'ac3';
    } 
}

export class WaterHeater1 extends GameSprite {
    constructor(engine, x, y) {
        super(engine, x, y, 1, 1);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'water-heater-1';
        this.domObject = brickDiv;
        this.objectType = 'water-heater-1';

        //this.body.isStatic = true;
        this.body.friction = 1;
        this.body.label = 'water-heater-1';
    }
}

export class WaterHeater2 extends GameSprite {
    constructor(engine, x, y) {
        super(engine, x, y, 1, 1);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'water-heater-2';
        this.domObject = brickDiv;
        this.objectType = 'water-heater-2';

        //this.body.isStatic = true;
        this.body.friction = 1;
        this.body.label = 'water-heater-2';
    } 
}

export class WaterHeater3 extends GameSprite {
    constructor(engine, x, y) {
        super(engine, x, y, 1, 1);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'water-heater-3';
        this.domObject = brickDiv;
        this.objectType = 'water-heater-1';

        //this.body.isStatic = true;
        this.body.friction = 1;
        this.body.label = 'water-heater-1';
    } 
}