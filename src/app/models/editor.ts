import { Brick } from "./brick";
import { Coin } from "./coin";
import { HTTP } from "./http";
import { Ice } from "./ice";
import { Log } from "./log";
import { ManHole } from "./man-hole";
import { MysteryBlock } from "./mystery-block";
import { Ram } from "./ram";
import { ShortLog } from "./short-log";
import { Snackbar } from "./snackbar";
import { SpikeBall } from "./spike-ball";

export class Editor {

    game;
    constructor(game) {
        this.game = game;

        document.getElementById('add-brick').addEventListener('click', () => {
            const brick = new Brick(game.engine, 0, 0);
            this.createSprite(brick);
        });

        document.getElementById('add-log').addEventListener('click',()=> {
            const log = new Log(game.engine,0,0);
            this.createSprite(log);
        });

        document.getElementById('add-short-log').addEventListener('click',()=> {
            const log = new ShortLog(game.engine,0,0);
            this.createSprite(log);
        });

        document.getElementById('add-mystery').addEventListener('click', () => {
            const mystery = new MysteryBlock(game.engine, 0, 0);
            this.createSprite(mystery);
        });

        document.getElementById('add-spike-ball').addEventListener('click', () => {
            const spikeBall = new SpikeBall(game.engine, 0, 0);
            this.createSprite(spikeBall);
        });
        document.getElementById('add-ram').addEventListener('click', () => {
            const ram = new Ram(game.engine, 0, 0);
            this.createSprite(ram);
        });
        document.getElementById('add-man-hole').addEventListener('click',()=> {
            const log = new ManHole(game.engine,0,0);
            this.createSprite(log);
        });

        document.getElementById('add-ice').addEventListener('click',()=> {
            const log = new Ice(game.engine,0,0);
            this.createSprite(log);
        });
        document.getElementById('add-coin').addEventListener('click',()=> {
            const coin = new Coin(game.engine, 0, 0,  'static');
            this.createSprite(coin);
        });

        document.getElementById('print-debug').addEventListener('click', () => {
            console.log(game);
        });

        for (const sprite of game.gameSprites) {
            if (sprite.domObject) {
                new DragHelper(game).dragElement(sprite);
                this.addDoubleClickHandler(sprite, game);
            }
        }

        document.getElementById('serialize').addEventListener('click', async () => {
            await HTTP.postData('/receive', game.gameSprites);
            Snackbar.show('Level Saved');
        });
    }

    createSprite(sprite) {
        sprite.y = 0;
        sprite.x = 0;
        new DragHelper(this.game).dragElement(sprite);

        const gameDiv = document.getElementById('game-div');
        const transform = gameDiv.style.transform;
        this.game.addSprite(sprite);

        if (transform) {
            const x = parseInt(transform.replace('translateX(', '').replace(')', ''));
            sprite.x = Math.abs(x);
            sprite.domObject.style.left = `${sprite.x}px`;
        }
        sprite.isNew = true;
        this.addDoubleClickHandler(sprite, this.game);
    }

    addDoubleClickHandler(sprite, game) {
        sprite.domObject.addEventListener('dblclick', e => {

            const sprite = game.gameSprites.find(i => i.domObject === e.srcElement);

            if (sprite) {

                game.removeSprite(sprite);
            }
        });
    }


}

class DragHelper {
    game;
    constructor(game) {
        this.game = game;
    }

    pos1 = 0;
    pos2 = 0;
    pos3 = 0;
    pos4 = 0;
    elmnt = null;
    sprite = null;
    dragElement(sprite) {
        this.sprite = sprite;
        const elmnt = sprite.domObject;
        this.elmnt = sprite.domObject;
        if (document.getElementById(elmnt.id + "header")) {
            // if present, the header is where you move the DIV from:
            document.getElementById(elmnt.id + "header").onmousedown = this.dragMouseDown;
            document.getElementById(elmnt.id + "header").onmouseup = this.dragMouseUp;
            document.getElementById(elmnt.id + "header").onmouseleave = this.dragMouseUp;
            
        } else {
            // otherwise, move the DIV from anywhere inside the DIV:
            elmnt.onmousedown = this.dragMouseDown;
            elmnt.onmouseup = this.dragMouseUp;
            elmnt.onmouseleave = this.dragMouseUp;
        }
    }

    dragMouseDown = (e) => {
        if(e.button !== 0) {
            return;
        }
        const scrollPosition = parseInt((this.game.world.scrollPosition  + e.clientX )/ this.interval as any) * this.interval ;
        this.elmnt.style.left = (scrollPosition) + "px";
        this.sprite.x = scrollPosition;
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        this.pos3 = scrollPosition;
        this.pos4 = e.clientY;
        document.onmouseup = this.closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = this.elementDrag;
    }

    dragMouseUp = (e) => {
        if(e.button !== 0) {
            return;
        }
        const left = parseInt(this.sprite.domObject.style.left);
        const top = parseInt(this.sprite.domObject.style.top);
        //this.sprite.x = left + this.sprite.domObject.clientWidth / 2;
        //this.sprite.y = top  + this.sprite.domObject.clientHeight / 2;
        this.sprite.originalX = this.sprite.x;
        this.sprite.originalY = this.sprite.y;

    }

    interval = 72;
    elementDrag = (e) => {
        if(e.button !== 0) {
            return;
        }
        this.sprite.dragMode = true;
        e = e || window.event;
        e.preventDefault();

        const scrollPosition = this.game.world.scrollPosition; // parseInt(this.game.world.scrollPosition / this.interval) * this.interval;
        const mouseClientX = e.clientX + scrollPosition;// parseInt((e.clientX + this.game.world.scrollPosition) / this.interval) * this.interval;
        document.getElementById('game-div').style.transform
        let deltaX = mouseClientX - this.elmnt.offsetLeft;
        let deltaY = e.clientY - this.elmnt.offsetTop;

        const unitsX = parseInt(deltaX / this.interval as any) * this.interval;
        const unitsY = parseInt(deltaY / this.interval as any) * this.interval;

        // this.domObject.style.left = `${pos.x - this.width / 2}px`;
        // this.domObject.style.top = `${pos.y - this.height / 2}px`;
        if (unitsY != 0) {

            this.pos2 = this.pos4 - e.clientY;
            this.pos4 = e.clientY;
            this.elmnt.style.top = (unitsY + this.elmnt.offsetTop - (this.elmnt.clientHeight / 2)) + 'px';
            const y = parseInt(this.elmnt.style.top);
            this.sprite.y = y + (this.sprite.height / 2);
            // this.sprite.y = (unitsY + this.elmnt.offsetTop) - this.elmnt.clientHeight + (this.elmnt.clientHeight / 2);

        }
        if (unitsX != 0) {

            this.pos1 = this.pos3 - mouseClientX;
            this.pos3 = mouseClientX;
            this.elmnt.style.left = (unitsX + this.elmnt.offsetLeft - (this.elmnt.clientWidth / 2)) + "px";
            const x = parseInt(this.elmnt.style.left);
            this.sprite.x = x + (this.sprite.width / 2);
        }
    }

    closeDragElement = () => {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}