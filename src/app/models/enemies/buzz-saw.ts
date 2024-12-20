import { ToolBarComponent } from "../../components/tool-bar/tool-bar.component";
import { playSound } from "../utilities/sound-utils";
import { GameSprite } from "../base/game-sprite";

export class BuzzSaw extends GameSprite {

    lottieId = ToolBarComponent.newid();
    // 
    sawSpinning = false;

    constructor(engine = null, x = null, y = null) {
        super(engine, x, y, 100, 150);
        if (this.body) {
            this.body.isStatic = true;
        }

        const div = document.createElement('div');
        div.className = 'buzz-saw';
        this.objectType = 'buzz-saw';
        if (this.body) {
            this.body.label = 'buzz-saw';
        }
        div.innerHTML = `<lottie-player   id="${this.lottieId}" background="transparent" src="https://lottie.host/1329a3fa-4b5c-4184-b4af-f452d4a18e27/IDpNUxBvgu.json"></lottie-player>`;

        this.domObject = div;

        setTimeout(() => {
            this.playLoop();

        });
    }

    parent;
    get isInViewport() {
        //return true;
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

    playLoop() {
        const player: any = document.getElementById(this.lottieId);
        player.seek(0);
        player.play();
        if (this.isInViewport) {
            setTimeout(()=> {
                playSound('saw', .1);
            }, 200);
        }

        setTimeout(() => this.sawSpinning = true, 500);
        setTimeout(() => this.sawSpinning = false, 5000);
        setTimeout(() => {

            setTimeout(() => {
                this.playLoop();
            }, 2000);
        }, 6000);
    }



}