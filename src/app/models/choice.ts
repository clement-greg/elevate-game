//

import { ToolBarComponent } from "../components/tool-bar/tool-bar.component";
import { GameSprite } from "./game-sprite";
import { World } from "./world";
declare var Matter: any;

export class ChoiceBrick extends GameSprite {

    moveDirection;

    moveDistance = 400;

    stationaryWait = 2;
    newlyCreated = false;
    frame = 0;
    frameCount = 4;
    delayCount = 0;
    sign = 1;
    waiting = false;
    lottieId = ToolBarComponent.newid();

    constructor(engine, x, y) {
        // 1.16 ratio
        super(engine, x, y, 200, 232);
        const brickDiv = document.createElement('div');
        brickDiv.className = 'choice-brick';
        this.domObject = brickDiv;

       this.body.isStatic = true;


        this.body.friction = 0;
        this.body.label = 'choice-brick';


        this.objectType = 'choice-brick';
        brickDiv.innerHTML = `<lottie-player  id="${this.lottieId}" background="transparent" src="https://lottie.host/4939beb1-24ce-4ed7-bd24-32efd678b8aa/cPpJOGr69R.json"></lottie-player>`;
    }

    override advance() {
        if(this.waiting) {
            return;
        }
        const y = this.body.position.y;

        if(y >= World.getInstance().height - 150) {
            this.sign = -1;
            const player: any = document.getElementById(this.lottieId);
            player.seek(0);
            player.play();
            this.waiting = true;
            setTimeout(()=> {
                this.waiting = false;
            }, 1000);
        } else if(y <= 100) {
            this.sign = 1;
        }
        const speed = this.sign === 1 ? 20 : 3;
        const newX = this.body.position.x;
        const newY = this.body.position.y + speed * this.sign;
        Matter.Body.setPosition(this.body, {x: newX, y: newY});

        super.advance();

    }
}