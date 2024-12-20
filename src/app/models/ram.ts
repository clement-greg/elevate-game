declare var Matter: any;
import { ToolBarComponent } from "../components/tool-bar/tool-bar.component";
import { Config } from "./config";
import { MoveableObject } from "./moveable-object";
var Engine = Matter.Engine,
    MatterWorld = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite;



export class Ram extends MoveableObject {
    moveDirection;
    initialX;
    initialY;
    moveDistance = 300;
    moveSpeed = 5;
    lottieId = ToolBarComponent.newid();
    stationaryWait = .5;
    newlyCreated = false;
    frame = 0;
    frameCount = 5;
    delayCount = 0;

    constructor(engine, x, y) {
        super(engine, x, y, 95.43, 95.43, true);
        const ramDiv = document.createElement('div');
        ramDiv.className = 'ram';
        this.domObject = ramDiv;
        this.body.label = 'Ram';
        this.body.friction = 0;
        Body.setMass(this.body, 100000);
        this.initialX = x;
        this.initialY = y;
        ramDiv.innerHTML = `<lottie-player  autoplay="true" loop  id="${this.lottieId}" background="transparent" src="https://lottie.host/5fa4b884-5c3e-4f04-b90c-38d8b1475ff1/Ki2NB41wG4.json"></lottie-player>`;

        //
    }

    override advance() {
        if (this.delayCount === 5) {
            this.domObject.style.backgroundPositionX = `-${this.frame * 100}px`;
            this.delayCount = 0;
        } else {
            this.delayCount = this.delayCount + 1;
        }
        this.frame++;
        if (this.frame === this.frameCount) {
            this.frame = 0;
        }
        if (this.moveDirection === 'Stationary' || this.newlyCreated) {
            if (!this.newlyCreated) {
                super.advance();
            }
            return;
        }

        if (this.moveDirection === 'Left') {
            if (this.x < this.initialX - this.moveDistance) {
                this.moveDirection = 'Stationary';
                (document.getElementById(this.lottieId) as any)?.pause();
                this.speedX = 0;
                setTimeout(() => {
                    this.moveDirection = 'Right';
                    (document.getElementById(this.lottieId) as any)?.play();
                    this.speedX = Config.getInstance().ramSpeed;
                    this.domObject.classList.remove('invert');
                }, this.stationaryWait * 1000);
            }
        } else {
            if (this.x > this.initialX + this.moveDistance) {
                this.moveDirection = 'Stationary';
                (document.getElementById(this.lottieId) as any)?.pause();
                setTimeout(() => {
                    this.moveDirection = 'Left';
                    this.speedX = -Config.getInstance().ramSpeed;
                    (document.getElementById(this.lottieId) as any)?.play();
                    this.domObject.classList.add('invert');
                }, this.stationaryWait * 1000);
            } else {
                this.speedX = Config.getInstance().ramSpeed;
            }
        }
        super.advance();
    }
}