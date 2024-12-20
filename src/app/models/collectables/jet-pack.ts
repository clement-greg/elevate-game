import { MoveableObject } from "../base/moveable-object";
declare var Matter: any;

export class JetPack extends MoveableObject {

    constructor(engine = null, x = null, y = null, extraClass = null) {
        super(engine, x, y, 72, 72);
        if (this.body) {
            this.body.isStatic = true;
        }
        this.width = 72;
        this.height = 72;
        const brickDiv = document.createElement('div');
        brickDiv.className = 'jet-pack';
        this.objectType = 'jet-pack';
        if (this.body) {
            this.body.label = 'jet-pack';
        }
        if (extraClass) {
            brickDiv.classList.add(extraClass);
        }

        this.domObject = brickDiv;

    }


}