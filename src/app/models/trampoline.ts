import { ToolBarComponent } from "../components/tool-bar/tool-bar.component";
import { GameSprite } from "./game-sprite";

export class Trampoline extends GameSprite {

    lottieId = ToolBarComponent.newid();
    constructor(engine, x, y) {
        super(engine, x, y, 210, 75);
        const div = document.createElement('div');
        div.className = 'trampoline';
        this.domObject = div;

        this.body.isStatic = true;
        this.body.friction = 0;
        this.body.label = 'trampoline';
        //this.id = ToolBarComponent.newid();
        this.objectType = 'trampoline';
        div.innerHTML = `<lottie-player style="transform: translateY(-50px)" autoplay="false" id="${this.lottieId}" background="transparent" src="https://lottie.host/e0455592-8ff7-4619-8e1a-47e0a26f3a80/8c2P44mVWM.json"></lottie-player>`
    }

    play() {
        const player = (document.getElementById(this.lottieId) as any);
        player.seek(0);
        player.play();
    }
}