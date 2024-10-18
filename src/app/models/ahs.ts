import { ToolBarComponent } from "../components/tool-bar/tool-bar.component";
import { GameSprite } from "./game-sprite";

export class Dynamite extends GameSprite {

    lottieId = ToolBarComponent.newid();
    playing = false;
    constructor(engine, x, y) {
        super(engine, x, y, 72, 72);
        const div = document.createElement('div');
        div.className = 'dynamite';
        this.domObject = div;

        this.body.isStatic = true;
        this.body.friction = 0;
        this.body.label = 'dynamite';
        //this.id = ToolBarComponent.newid();
        this.objectType = 'dynamite';
        div.innerHTML = `<div style="position: absolute; width: 400px; height: 400px; margin-top: -147px;margin-left: -166px"><lottie-player speed="3" id="${this.lottieId}" background="transparent" src="https://lottie.host/738cd3df-d2aa-4870-93aa-9f77afea25b7/hElPz5c5rN.json"></lottie-player></div>`
    }

    play() {
        if (!this.playing) {
            const player = (document.getElementById(this.lottieId) as any);
            player.seek(0);
            player.play();
            this.playing = true;
            return true;
        }
        return false;
    }
}