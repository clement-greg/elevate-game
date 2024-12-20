declare var Matter: any;
import { GameSprite } from "../base/game-sprite";
var Engine = Matter.Engine,
    MatterWorld = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite;
export class Ground extends GameSprite {
    constructor(engine, x, y, width, height) {
        super(engine, x, y, width, height);
        this.body.isStatic = true;

        //Composite.add(engine.world, [this.body]);
    }
}