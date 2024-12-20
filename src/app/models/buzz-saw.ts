import { ToolBarComponent } from "../components/tool-bar/tool-bar.component";
import { GameSprite } from "./game-sprite";

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

        setTimeout(()=> {
            this.playLoop();

        });
    }

    playLoop() {
        const player: any = document.getElementById(this.lottieId);
        player.seek(0);
        player.play();

        setTimeout(()=> this.sawSpinning = true, 500);
        setTimeout(()=> this.sawSpinning = false, 5000);
        setTimeout(()=> {

            setTimeout(()=> {
                this.playLoop();
            }, 1500);
        }, 6000);
    }



}