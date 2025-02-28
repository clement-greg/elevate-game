import { Component, inject, NgZone, OnDestroy } from '@angular/core';
import { GameProviderService } from '../../models/services/game-provider.service';
import { Brick, SolidBlock } from '../../models/environment/brick';
import { MysteryBlock } from '../../models/collectables/mystery-block';
import { SpikeBall } from '../../models/enemies/spike-ball';
import { Ram } from '../../models/enemies/ram';
import { Coin } from '../../models/collectables/coin';
import { Log } from '../../models/environment/log';
import { ShortLog } from '../../models/environment/short-log';
import { ManHole } from '../../models/deadly-obsticles/man-hole';
import { Ice } from '../../models/environment/ice';
import { HTTP } from '../../models/utilities/http';
import { Drill, Hammer, Saw, Screwdriver, Wrench } from '../../models/collectables/saw';
import { GameSprite } from '../../models/base/game-sprite';
import { Trampoline } from '../../models/environment/trampoline';
import { SpikeBrick } from '../../models/deadly-obsticles/spike-brick';
import { Cannon } from '../../models/enemies/cannon';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { IBeam } from '../../models/environment/i-beam';
import { JetPackMysteryBlock } from '../../models/collectables/jet-pack-mystery-block';
import { CeilingSpike } from '../../models/deadly-obsticles/ceiling-spike';
import { Dynamite } from '../../models/enemies/ahs';
import { GameInstanceManager } from '../../models/base/game-instance';
import { Game } from '../../models/base/game';
import { FireVent } from '../../models/deadly-obsticles/fire-vent';
import { FlameThrowerMysteryBlock } from '../../models/collectables/flame-thrower-mystery-block';
import { Riser } from '../../models/environment/riser';
import { Eagle } from '../../models/enemies/eagle';
import { ChoiceBrick } from '../../models/enemies/choice';
import { BuzzSaw } from '../../models/enemies/buzz-saw';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { newid } from '../../models/utilities/misc-utils';

@Component({
  selector: 'app-tool-bar',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './tool-bar.component.html',
  styleUrl: './tool-bar.component.scss'
})
export class ToolBarComponent implements OnDestroy {
  private _snackBar = inject(MatSnackBar);
  game: Game;
  constructor(private gameProvider: GameProviderService,
    private zone: NgZone
  ) {
    this.game = gameProvider.getInstance();
    for (const sprite of this.game.gameSprites) {
      if (sprite.domObject) {
        new DragHelper(this.game).dragElement(sprite);
        this.addDoubleClickHandler(sprite, this.game);
      }
    }
    GameInstanceManager.getInstance().editorOpen = true;
  }
  ngOnDestroy(): void {
    GameInstanceManager.getInstance().editorOpen = false;
  }

  addBrick() {
    const brick = new Brick(this.game.engine, 0, 0);
    this.createSprite(brick);
  }

  addMysteryBlock() {
    const mystery = new MysteryBlock(this.game.engine, 0, 0);
    this.createSprite(mystery);
  }

  addSaw() {
    const saw = new Saw(this.game.engine, 0, 0);
    this.createSprite(saw);
  }

  addScrewdriver() {
    const tool = new Screwdriver(this.game.engine, 0, 0);
    this.createSprite(tool);
  }
  addWrench() {
    const tool = new Wrench(this.game.engine, 0, 0);
    this.createSprite(tool);
  }

  addIBeam() {
    const sprite = new IBeam(this.game.engine, 0, 0);
    this.createSprite(sprite);
  }

  addJetPackMystery() {
    const sprite = new JetPackMysteryBlock(this.game.engine, 0, 0);
    this.createSprite(sprite);
  }

  addHammer() {
    const tool = new Hammer(this.game.engine, 0, 0);
    this.createSprite(tool);
  }

  addDrill() {
    const tool = new Drill(this.game.engine, 0, 0);
    this.createSprite(tool);
  }

  addSpikeBall() {
    const spikeBall = new SpikeBall(this.game.engine, 0, 0);
    this.createSprite(spikeBall);
  }

  addRam() {
    const ram = new Ram(this.game.engine, 0, 0);
    this.createSprite(ram);
  }

  addCoin() {
    const coin = new Coin(this.game.engine, 0, 0, 'static');
    this.createSprite(coin);
  }

  addChoiceBrick() {
    const sprite = new ChoiceBrick(this.game.engine, 0, 0);
    this.createSprite(sprite);
  }

  addBuzzSaw() {
    const sprite = new BuzzSaw(this.game.engine, 0, 0);
    this.createSprite(sprite);
  }

  printDebug() {
    console.log(this.game);
  }

  addLog() {
    const log = new Log(this.game.engine, 0, 0);
    this.createSprite(log);
  }

  addTrampoline() {
    const tramp = new Trampoline(this.game.engine, 0, 0);
    this.createSprite(tramp);
  }

  addCannon() {
    const sprite = new Cannon(this.game.engine, 0, 0);
    this.createSprite(sprite);
  }

  addSolidBlock() {
    const sprite = new SolidBlock(this.game.engine, 0, 0);
    this.createSprite(sprite);
  }

  addSpikeBrick() {
    const sprite = new SpikeBrick(this.game.engine, 0, 0);
    this.createSprite(sprite);
  }

  addDynamite() {
    const sprite = new Dynamite(this.game.engine, 0, 0);
    this.createSprite(sprite);
  }

  addFireVent() {
    const sprite = new FireVent(this.game.engine, 0, 0);
    this.createSprite(sprite);
  }

  addCeilingSpike() {
    const sprite = new CeilingSpike(this.game.engine, 0, 0);
    this.createSprite(sprite);
  }

  addShortLog() {
    const log = new ShortLog(this.game.engine, 0, 0);
    this.createSprite(log);
  }

  addManHole() {
    const log = new ManHole(this.game.engine, 0, 0);
    this.createSprite(log);
  }

  addIce() {
    const log = new Ice(this.game.engine, 0, 0);
    this.createSprite(log);
  }

  addRiser() {
    const sprite = new Riser(this.game.engine, 0, 0);
    this.createSprite(sprite);
  }

  addEagle() {
    const sprite = new Eagle(this.game.engine, 0, 0);
    this.createSprite(sprite);
  }

  addFlameThrowerMystery() {
    const sprite = new FlameThrowerMysteryBlock(this.game.engine, 0, 0);
    this.createSprite(sprite);
  }

  async save() {

    const jsonString = JSON.stringify(this.game.gameSprites, HTTP.spriteReplacer);

    let striped: GameSprite[] = JSON.parse(jsonString);

    for (const item of striped) {
      delete item.domObject;
      delete (item as any).keyboardHandler;
      delete (item as any).pubsub;
    }

    striped = striped.filter(i => i.objectType !== 'Player2' && i.objectType !== 'Ground');

    const ids = striped.filter(i => i.id).map(i => i.id);
    const itemsToBringBack = this.game.originalSprites.filter(i => i.id && ids.indexOf(i.id) === -1);
    for (const itemToBringBack of itemsToBringBack) {
      striped.push(itemToBringBack);
    }

    navigator.clipboard.writeText(JSON.stringify(striped, HTTP.spriteReplacer));
    this._snackBar.open('JSON Copied');

    // const link = document.createElement('a');
    // link.setAttribute('download', 'level1.json');
    // link.href = this.makeFile();
    // document.body.appendChild(link);
    // window.requestAnimationFrame(() => {
    //   const evt = new MouseEvent('click');
    //   link.dispatchEvent(evt);
    //   document.body.removeChild(link);
    // });
  }

  private textFile = null;
  private makeFile() {
    const json = JSON.stringify(this.game.gameSprites, HTTP.replacer);
    const data = new Blob([json], { type: 'text/plain' });

    if (this.textFile) {
      window.URL.revokeObjectURL(this.textFile);
    }

    this.textFile = window.URL.createObjectURL(data);

    return this.textFile;

  }


  createSprite(sprite: GameSprite) {
    sprite.y = 0;
    sprite.x = 0;
    new DragHelper(this.game).dragElement(sprite);

    const gameDiv = document.getElementById('game-div');
    const transform = gameDiv.style.left;
    this.game.addSprite(sprite);

    if (transform) {
      const x = parseInt(transform.replace('translateX(', '').replace(')', ''));
      sprite.x = Math.abs(x);
      sprite.domObject.style.left = `${sprite.x + 300}px`;
    } else {
      sprite.domObject.style.left = '300px';
    }
    sprite.isNew = true;
    this.addDoubleClickHandler(sprite, this.game);
    sprite.id = newid();
  }

  // public static newid() {
  //   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  //     const r = Math.random() * 16 | 0;
  //     const v = c === 'x' ? r : (r & 0x3 | 0x8);
  //     return v.toString(16);
  //   });
  // }

  addDoubleClickHandler(sprite, game: Game) {
    sprite.domObject.addEventListener('dblclick', e => {

      let root: HTMLElement = e.srcElement;
      while (root && !root.classList.contains('sprite')) {
        root = root.parentElement;
      }

      const sprite = game.gameSprites.find(i => i.domObject === root);

      if (sprite) {

        game.removeSprite(sprite);
        if (sprite.id) {
          const original = game.originalSprites.find(i => i.id === sprite.id);
          if (original) {
            game.originalSprites.splice(game.originalSprites.indexOf(original), 1);
          }
        }
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
    if (e.button !== 0) {
      return;
    }
    const scrollPosition = parseInt((this.game.world.scrollPosition + e.clientX) / this.interval as any) * this.interval;
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
    if (e.button !== 0) {
      return;
    }
    this.sprite.originalX = this.sprite.x;
    this.sprite.originalY = this.sprite.y;
  }

  interval = 72;
  elementDrag = (e) => {
    if (e.button !== 0) {
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

    if (unitsY != 0) {

      this.pos2 = this.pos4 - e.clientY;
      this.pos4 = e.clientY;
      this.elmnt.style.top = (unitsY + this.elmnt.offsetTop - (this.elmnt.clientHeight / 2)) + 'px';
      const y = parseInt(this.elmnt.style.top);
      this.sprite.y = y + (this.sprite.height / 2);

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
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
