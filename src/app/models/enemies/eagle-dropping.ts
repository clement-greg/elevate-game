import { ToolBarComponent } from "../../components/tool-bar/tool-bar.component";
import { Eagle } from "./eagle";
import { Game } from "../base/game";
import { MoveableObject } from "../base/moveable-object";
import { World } from "../environment/world";
import { newid } from "../utilities/misc-utils";
declare var Matter: any;
var Engine = Matter.Engine,
    MatterWorld = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;


export class EagleDropping extends MoveableObject {

    lottieId = newid();
    lastY: number = 0;


    constructor(private eagle: Eagle, private game: Game, private velocityX: number) {
        super(eagle.engine, eagle.x, eagle.y + 20, 50, 50);

        const dropping = document.createElement('div');
        dropping.className = 'eagle-dropping';
        this.domObject = dropping;
        this.body.label = 'eagle-dropping';
        this.body.friction = 0;
        Matter.Body.set(this.body, 'isSensor', true);
        //this.body.isStatic = true;
        //Body.setMass(this.body, 100000);

        dropping.innerHTML = `<lottie-player  autoplay="true" loop  id="${this.lottieId}" background="transparent" src="https://lottie.host/a4a6afff-2f63-48a2-8c04-2ed52a181ebd/b0eltvcyTk.json"></lottie-player>`;
    }

    override advance(): void {
        super.advance();
        const diff = Math.abs(this.y - this.lastY);
        Matter.Body.setVelocity(this.body, { x: this.velocityX, y: 10 });

        if (diff < .01 || this.y > World.getInstance().height - 50) {
            this.game.removeSprite(this);
        }
        this.lastY = this.y;
    }
}