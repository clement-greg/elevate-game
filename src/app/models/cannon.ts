
//

declare var Matter: any;
import { ToolBarComponent } from "../components/tool-bar/tool-bar.component";
import { playSound } from "../utilities/sound-utils";
import { GameSprite } from "./game-sprite";

export class Cannon extends GameSprite {

    lottieId = ToolBarComponent.newid();
    lastFire: Date = new Date();
    timeBetweenFire = 3000;

    constructor(engine, x, y) {
        super(engine, x, y, 200, 95);
        const div = document.createElement('div');
        div.className = 'cannon';
        this.domObject = div;

        this.body.isStatic = false;
        this.body.friction = 1;
        this.body.label = 'cannon';
        //this.id = ToolBarComponent.newid();
        this.objectType = 'cannon';
        Matter.Body.setMass(this.body, 1600);
        div.innerHTML = `<lottie-player style="transform: translateY(-50px)"  id="${this.lottieId}" background="transparent" src="https://lottie.host/a581b223-f47b-48fd-9722-c96e896d940c/g8XouwblmA.json"></lottie-player>`
    }

    fire() {
        const ellapsed = new Date().getTime() - this.lastFire.getTime();
        if (ellapsed < this.timeBetweenFire) {
            return false;
        }
        if (!this.isInViewport) {
            this.lastFire = new Date();
            return false;
        }

        const player = (document.getElementById(this.lottieId) as any);
        if (player) {
            player.seek(0);
            player.play();
            this.lastFire = new Date();
            setTimeout(() => {
                playSound('cannon-sound');
            }, 500);
            return true;
        }

        return false;
    }

    private parent: HTMLElement;

    get isInViewport() {
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

    play() {
        const player = (document.getElementById(this.lottieId) as any);
        player.seek(0);
        player.play();
    }
}