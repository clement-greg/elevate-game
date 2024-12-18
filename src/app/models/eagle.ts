//
declare var Matter: any;
import { ToolBarComponent } from "../components/tool-bar/tool-bar.component";
import { Config } from "./config";
import { EagleDropping } from "./eagle-dropping";
import { Game } from "./game";
import { MoveableObject } from "./moveable-object";
var Engine = Matter.Engine,
    MatterWorld = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

export class Eagle extends MoveableObject {
    moveDirection;
    initialX;
    initialY;
    moveDistance = 600;
    moveSpeed = 5;
    lottieId = ToolBarComponent.newid();
    stationaryWait = .5;
    newlyCreated = false;
    frame = 0;
    frameCount = 5;
    delayCount = 0;
    lastDrop = new Date();
    private parent: HTMLElement;

    constructor(public engine, x, y) {
        super(engine, x, y, 187.5, 100, true);
        const eagleDiv = document.createElement('div');
        eagleDiv.className = 'eagle';
        this.domObject = eagleDiv;
        this.body.label = 'eagle';
        this.body.isStatic = true;
        this.body.friction = 0;
        Body.setMass(this.body, 100000);
        this.initialX = x;
        this.initialY = y;
        eagleDiv.innerHTML = `<lottie-player  autoplay="true" loop  id="${this.lottieId}" background="transparent" src="https://lottie.host/4b0b71c0-3cdb-4f4d-a332-20b88d05a675/TYU8Wvk4WS.json"></lottie-player>`;
    }

    doDropping(game: Game) {
        if (this.isInViewport) {
            const elapsed = new Date().getTime() - this.lastDrop.getTime();
            if (elapsed > 2000) {
                const dropping = new EagleDropping(this, game, this.body.velocity.x);
                this.lastDrop = new Date();
                game.addSprite(dropping);
                //this.lastDrop = new Date(2028, 1, 1);
            }
        }
    }

    get isInViewport() {
        return true;
        if (!this.parent) {
            this.parent = document.getElementById('game-div');

        }

        const rect = this.domObject.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= ((window.innerWidth || document.documentElement.clientWidth) + 150)
        )
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


        const newX = this.body.position.x + this.moveSpeed * (this.moveDirection === 'Left' ? -1 : 1);
        Matter.Body.setPosition(this.body, { x: newX, y: this.initialY });

        super.advance();
    }
}