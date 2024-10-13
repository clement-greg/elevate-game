declare var Matter: any;

var Engine = Matter.Engine,
    MatterWorld = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite;
export class GameSprite {
    domObject;
    x;
    y;
    width;
    height;
    isGround = false;
    objectType = '';
    dragMode = false;
    body;
    log;
    isNew = false;
    originalX;
    originalY;
    dontUpdatePosition = false;
    id: string;

    constructor(engine, x, y, width, height, log = false, drawOptions = null) {
        this.x = x;
        this.y = y;
        this.log = log;
        this.width = width;
        this.height = height;
        //this.originalX = x;
        //this.originalY = y;

        this.objectType = this.constructor.name;

        if (engine) {
            if (!drawOptions) {
                this.body = Bodies.rectangle(x, y, width, height);

            } else {
                if (drawOptions.mode === 'ellipse') {
                    this.dontUpdatePosition = drawOptions.dontUpdatePosition;
                    let ellipseVerticesArray = [];

                    let ellipseFlatness = (height - 10) / (width - 10);
                    let ellipseVertices = 50;
                    let ellipseSize = (height - 10);

                    for (let i = 0; i < ellipseVertices; i++) {
                        let x = ellipseSize * Math.cos(i);
                        let y = ellipseFlatness * ellipseSize * Math.sin(i);
                        ellipseVerticesArray.push({ x: x, y: y });
                    }

                    // add one ellipse
                    this.body = Bodies.fromVertices(x, y + 20, ellipseVerticesArray, 5);
                }
            }
            Composite.add(engine.world, [this.body], { friction: 1, restitution: 0, inertia: 0 });
            this.body.friction = 1;
            this.body.restitution = 0;
            Matter.Body.setInertia(this.body, Infinity);
        }
    }

    advance() {
        if (this.dragMode) {
            return;
        }
        if (this.domObject && !this.isNew && this.body && !this.dontUpdatePosition) {
            Matter.Body.setAngularVelocity(this.body, 0);
            Matter.Body.rotate(this.body, 0);
            const pos = this.body.position;
            this.domObject.style.left = `${pos.x - this.width / 2}px`;
            this.domObject.style.top = `${pos.y - this.height / 2}px`;
            this.x = pos.x;
            this.y = pos.y;
        }
    }

    draw() { }
}

