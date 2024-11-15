import { playSound } from "../utilities/sound-utils";
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

        const frictionBody = Bodies.rectangle(x - 1, y - 37, 74, 2);
        Composite.add(engine.world, frictionBody, {friction: 1, restitution: 0, inertia: 0});
        frictionBody.isStatic = true;
        frictionBody.friction = 1;
        frictionBody.label = 'brick-top';
        this.frictionTop = frictionBody;
    }

    bounceIt() {
        this.domObject.classList.add('bounce');
        setTimeout(() => this.domObject.classList.remove('bounce'), 200);
    }

    breakIt() {
        const player: any = document.createElement('lottie-player');
        player.style.height = '200px';
        player.style.width = '200px';
        player.loop = false;
        player.autoplay = true;
        player.style.position = 'absolute';
        player.style.left = `${this.x - 110}px`;
        player.style.top = `${this.y - 90}px`;
        player.src = 'https://lottie.host/712046f0-d63c-44b3-8b31-b43c42998093/L6iZBWH4nN.json';
        document.getElementById('game-div').appendChild(player);

        setTimeout(() => player.parentNode.removeChild(player), 200);
        
        playSound('break-brick-sound');

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

        const frictionBody = Bodies.rectangle(x + 4, y - 37, this.width - 16, 2);
        Composite.add(engine.world, frictionBody, {friction: 1, restitution: 0, inertia: 0});
        frictionBody.isStatic = true;
        frictionBody.friction = 1;
        frictionBody.restitution = 0;
        frictionBody.label = 'solid-block';
        this.frictionTop = frictionBody;
    }


}