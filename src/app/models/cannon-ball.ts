declare var Matter: any;
import { ToolBarComponent } from "../components/tool-bar/tool-bar.component";
import { GameSprite } from "./game-sprite";
import { MoveableObject } from "./moveable-object";

export class CannonBall extends MoveableObject {

    lottieId = ToolBarComponent.newid();
    lastFire: Date = new Date();
    timeBetweenFire = 6000;

    constructor(engine, x, y) {
        super(engine, x, y, 40, 40);
        const div = document.createElement('div');
        div.className = 'cannon-ball';
        this.objectType = 'cannon-ball';
        this.domObject = div;

        this.body.isStatic = true;
        this.body.friction = 1;
        this.body.label = 'cannon-ball';
        Matter.Body.setMass(this.body, .00001);
        this.speedX = -20;
    }

    override advance(): void {
        // console.log('advancing');
        this.x -= 4;
        Matter.Body.setPosition(this.body, { x: this.x, y: this.y });
        super.advance();
    }

}