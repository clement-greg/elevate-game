import { MoveableObject } from "./moveable-object";
declare var Matter: any;

export class FlameThrower extends MoveableObject {

    constructor(engine = null, x = null, y = null, extraClass = null) {
        super(engine, x, y, 144, 72);
        if (this.body) {
            this.body.isStatic = true;
        }
        this.width = 72;
        this.height = 72;
        const brickDiv = document.createElement('div');
        brickDiv.className = 'flame-thrower';
        this.objectType = 'flame-thrower';
        if (this.body) {
            this.body.label = 'flame-thrower';
        }
        if (extraClass) {
            brickDiv.classList.add(extraClass);
        }

        this.domObject = brickDiv;

    }


}