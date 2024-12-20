declare var Matter: any;

import { Coin } from "./coin";
import { GameSprite } from "../base/game-sprite";
import { PubSub } from "../utilities/pub-sub";
var Engine = Matter.Engine,
    MatterWorld = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite;

export class MysteryBlock extends GameSprite {
    empty = false;
    frictionTop;
    
    constructor(engine, x, y) {
        super(engine, x, y, 72.8, 72.8);

        const brickDiv = document.createElement('div');
        brickDiv.className = 'mystery-block';


        this.domObject = brickDiv;
        this.body.isStatic = true;
        this.body.label = 'Mystery';

        const frictionBody = Bodies.rectangle(x - 2, y - 36, this.width - 4, 2);
        Composite.add(engine.world, frictionBody, { friction: 1, restitution: 1, inertia: Infinity });
        frictionBody.isStatic = true;
        frictionBody.friction = 1;
        frictionBody.label = 'Mystery';
        this.frictionTop = frictionBody;
        this.body.friction = 0;
    }

    emptyIt() {
        if (this.empty) {
            return false;
        }
        this.empty = true;
        this.domObject.style.backgroundPositionX = '-72px';
        this.domObject.classList.add('bounce');
        setTimeout(() => {
            this.domObject.classList.remove('bounce');
        }, 200);

        const coin = new Coin();

        coin.domObject.style.left = (this.x - this.width / 2) + 'px';
        coin.domObject.style.top = (this.y - 100) + 'px';
        PubSub.getInstance().publish('add-game-sprite', coin);

        setTimeout(() => {
            PubSub.getInstance().publish('remove-game-sprite', coin);
        }, 1000);

        return true;
    }
}