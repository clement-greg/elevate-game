declare var Matter: any;

import { World } from './world';
import { Ground } from './ground';
import { Brick, SolidBlock } from './brick';
import { HTTP } from './http';
import { MysteryBlock } from './mystery-block';
import { SpikeBall } from './spike-ball';
import { PubSub } from './pub-sub';
import { Ram } from './ram';
import { Player2 } from './player-2';
import { Coin } from './coin';
import { Log } from './log';
import { ShortLog } from './short-log';
import { ManHole } from './man-hole';
import { Ice } from './ice';
import { NgZone } from '@angular/core';
import { Drill, Hammer, Saw, Screwdriver, Wrench } from './saw';
import { Fridge1, Fridge2, Fridge3 } from './fridge';
import { GameSprite } from './game-sprite';
import { ToolBarComponent } from '../components/tool-bar/tool-bar.component';
import { Trampoline } from './trampoline';
import { SpikeBrick } from './spike-brick';
import { Cannon } from './cannon';

var Engine = Matter.Engine,
    MatterWorld = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;


export class Game {
    static gameInstance;
    world;
    internval;
    static gravity = 1;
    player2: Player2;
    ground;

    gameSprites = [];
    pubSub = PubSub.getInstance();
    engine;
    gameHUD: GameHUD;

    infoBarier: Ground;
    showQuestBegin = false;
    questShown = false;
    static applianceShopLeft = 8000;
    dialogOpen: boolean;
    gameStartTime: Date;
    gameTotalSeconds = 240;
    //gameTotalSeconds = 5;
    remaining: string;
    static homeLeft = 16000;
    static homeLeftEnd = this.homeLeft + 300;
    static initialLeft = 400;
    showCloseBarrier = false;
    cannons: Cannon[] = [];


    static get applianceShopAreaRight() {
        return Game.applianceShopLeft + 450;
    }

    constructor(private zone: NgZone) {
        this.initialize(zone);
    }
    completionBarrier: any;

    initialize(zone: NgZone) {

        if (!document.getElementById('game-div')) {
            setTimeout(() => this.initialize(zone), 100);
            return;
        }
        this.engine = Engine.create();

        Matter.Runner.run(this.engine);
        this.engine.gravity.y = Game.gravity;

        this.player2 = new Player2(this.engine, 80, 0, 71, 96);
        this.addSprite(this.player2);

        zone.run(() => {

            this.gameHUD = new GameHUD(zone);
        });

        this.world = World.getInstance();
        const ground = new Ground(this.engine, 0, this.world.height - 65, this.world.width, 20);
        ground.width = this.world.width;
        ground.x = 0;
        ground.y = this.world.height - ground.height;
        ground.body.label = 'Ground'
        this.ground = ground;

        const left = new Ground(this.engine, 0, 0, 2, 10000);
        left.body.friction = 0;

        this.infoBarier = new Ground(this.engine, 1500, 0, 2, 10000);
        this.infoBarier.body.friction = 0;
        this.gameSprites.push(this.infoBarier);

        this.completionBarrier = new Ground(this.engine, Game.homeLeft - 150, 0, 2, 10000);
        this.completionBarrier.body.label = 'completion-barrier';
        this.completionBarrier.body.friction = 0;
        this.gameSprites.push(this.completionBarrier);

        HTTP.getData('./assets/levels/level1.json').then(json => {
            this.setupGame(json);
        });

        this.pubSub.subscribe('collision', data => {
            if (data.collidingSprite && data.collidingSprite.objectType !== 'Ground') {
            }
        });
        this.pubSub.subscribe('add-game-sprite', data => {
            this.addSprite(data);
        });
        this.pubSub.subscribe('remove-game-sprite', data => {
            this.removeSprite(data);
        });
    }


    processKeyDownEvent(key: KeyboardEvent) {
        if (key.key == 'ArrowRight') {
            this.player2.arrowRight = true;
        }

        if (key.key === 'ArrowLeft') {
            this.player2.arrowLeft = true;
        }
        if (key.key === ' ') {
            this.player2.jump();
        }
    }

    processKeyUp(key: KeyboardEvent) {
        if (key.key == 'ArrowRight') {
            this.player2.arrowRight = false;
        }

        if (key.key === 'ArrowLeft') {
            this.player2.arrowLeft = false;
        }
        if (key.key === ' ' && this.infoBarier) {
            if (this.showQuestBegin) {
                PubSub.getInstance().publish('close-begin-quest');
                this.removeSprite(this.infoBarier);
                delete this.infoBarier;
                this.showQuestBegin = false;
                this.gameStartTime = new Date();
                this.gameHUD.startTimer();
            }
        }
        if (key.key === ' ' && this.showCloseBarrier) {
            Matter.Body.applyForce(this.player2.body, { x: this.player2.body.position.x, y: this.player2.body.position.y }, { x: -1, y: 0 });
            setTimeout(() => PubSub.getInstance().publish('close-info-barrier'), 100);
            this.showCloseBarrier = false;
        }
        if (key.key === 'ArrowUp') {
            if (this.playerLeft >= Game.applianceShopLeft && this.playerLeft <= Game.applianceShopAreaRight) {
                PubSub.getInstance().publish('show-shop');
            }
        }
        if (key.key === 't' || key.key === 'T') {
            if (this.playerTop > 0) {
                Matter.Body.applyForce(this.player2.body, { x: this.player2.body.position.x, y: this.player2.body.position.y }, { x: 0, y: -.3 });
            }
        }
        if (key.key === 'w' || key.key === 'W') {
            PubSub.getInstance().publish('level-complete');
        }
        if (key.key === 'l' || key.key === 'L') {
            PubSub.getInstance().publish('game-lost');
        }
        if (key.key === 'D' || key.key === 'd') {
            if (this.fridgeContraint) {
                Matter.Composite.remove(this.engine.world, this.fridgeContraint);
                delete this.fridgeContraint;
            }
        }
    }

    purchaseFridge(number = 1 | 2 | 3) {
        switch (number) {
            case 1:
                this.fridge = new Fridge1(this.engine, this.playerLeft - 30, this.playerTop - 72);
                break;
            case 2:
                this.fridge = new Fridge2(this.engine, this.playerLeft - 30, this.playerTop - 72);
                break;
            case 3:
                this.fridge = new Fridge3(this.engine, this.playerLeft - 30, this.playerTop - 72);
                break;
        }
        Matter.Body.setMass(this.fridge.body, .1);
        this.addSprite(this.fridge);
        this.createFridgeConstraint();
    }

    private createFridgeConstraint() {
        this.fridgeContraint = Matter.Constraint.create({
            bodyA: this.player2.body,
            bodyB: this.fridge.body,
            stiffness: .05,
        });
        Matter.Composite.add(this.engine.world, this.fridgeContraint);
    }

    fridge: any;

    fridgeContraint;

    originalSprites: GameSprite[];

    setupGame(json) {
        const sprites = JSON.parse(json);
        this.originalSprites = sprites;

        for (const sprite of sprites) {
            if (sprite.objectType === 'Brick') {
                const newSprite = new Brick(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                this.addSprite(newSprite);
            } else if (sprite.objectType === 'Saw') {
                const newSprite = new Saw(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                this.addSprite(newSprite);
            } else if (sprite.objectType === 'Screwdriver') {
                const newSprite = new Screwdriver(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                this.addSprite(newSprite);
            } else if (sprite.objectType === 'Wrench') {
                const newSprite = new Wrench(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                this.addSprite(newSprite);
            } else if (sprite.objectType === 'Hammer') {
                const newSprite = new Hammer(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                this.addSprite(newSprite);
            } else if (sprite.objectType === 'Drill') {
                const newSprite = new Drill(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                this.addSprite(newSprite);
            } else if (sprite.objectType === 'MysteryBlock') {
                const newSprite = new MysteryBlock(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                this.addSprite(newSprite);
            } else if (sprite.objectType === 'SpikeBall') {
                const newSprite = new SpikeBall(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.moveSpeed = newSprite.moveSpeed;
                newSprite.moveDistance = newSprite.moveDistance;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                this.addSprite(newSprite);
            } else if (sprite.objectType === 'Ram') {
                const newSprite = new Ram(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                newSprite.moveSpeed = newSprite.moveSpeed;
                newSprite.moveDistance = newSprite.moveDistance;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(newSprite);
            } else if (sprite.objectType === 'Coin') {
                const newSprite = new Coin(this.engine, sprite.originalX, sprite.originalY, 'static');
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                this.addSprite(newSprite);
            } else if (sprite.objectType === 'Log') {
                const newSprite = new Log(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                this.addSprite(newSprite);
            } else if (sprite.objectType === 'ShortLog') {
                console.log({ x: sprite.originalX, y: sprite.originalY });
                const newSprite = new ShortLog(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                console.log(JSON.stringify(newSprite, HTTP.replacer));
                this.addSprite(newSprite);
            } else if (sprite.objectType === 'ManHole') {
                const newSprite = new ManHole(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                this.addSprite(newSprite);
            } else if (sprite.objectType === 'Ice') {
                const newSprite = new Ice(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                this.addSprite(newSprite);
            } else if (sprite.objectType === 'trampoline') {
                const newSprite = new Trampoline(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                this.addSprite(newSprite);
            } else if (sprite.objectType === 'cannon') {
                const newSprite = new Cannon(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                this.cannons.push(newSprite);
                this.addSprite(newSprite);

            } else if (sprite.objectType === 'spike-brick') {
                const newSprite = new SpikeBrick(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(newSprite);
            }

            else if (sprite.objectType === 'solid-block' || sprite.objectType === 'SolidBlock') {
                const newSprite = new SolidBlock(this.engine, sprite.originalX, sprite.originalY);
                newSprite.x = sprite.originalX;
                newSprite.y = sprite.originalY;
                newSprite.originalX = sprite.originalX;
                newSprite.originalY = sprite.originalY;
                newSprite.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(newSprite);
            }
        }
    }

    get playerLeft() {
        return parseFloat(this.player2.domObject.style.left.replace('px', ''));
    }

    get playerTop() {
        return parseFloat(this.player2.domObject.style.top.replace('px', ''));
    }

    private colletableLabels = ['saw', 'wrench', 'hammer', 'screwdriver', 'drill', 'coin'];
    private enemyLabels = ['spike-ball', 'man-hole'];
    private impactObjectsLabels = ['trampoline', 'spike-brick', 'cannon', 'Ram', 'Brick', 'brick-top', 'mystery-top', 'Ice', 'Mystery', 'log-short', 'log', 'solid-block'];

    playCollectTool() {
        const audio: HTMLAudioElement = document.getElementById('collect-tool-sound') as HTMLAudioElement;
        audio.currentTime = 0;
        audio.play();
    }

    bounceCount = 0;
    advance() {
        if (this.showQuestBegin) {
            return;
        }

        this.player2.advance();
        for (const sprite of this.gameSprites) {
            if (sprite.applyGravity) {
                if (!sprite.speedY) {
                    sprite.speedY = 0;
                }
                sprite.speedY += this.world.gravity;
            }
        }

        if (this.playerTop > 1000) {
            this.loseLife();
        }

        for(const cannon of this.cannons) {
            cannon.fire();
        }

        const left = this.playerLeft;
        if (left > (Game.initialLeft - 50) && !this.showQuestBegin && !this.questShown && this.playerTop > 0) {
            this.questShown = true;
            this.zone.run(() => {
                this.showQuestBegin = true;
                PubSub.getInstance().publish('quest-begin');
                document.getElementById('construction-worker').parentNode.removeChild(document.getElementById('construction-worker'));
            });
        }


        if (left > Game.homeLeft && left < Game.homeLeftEnd && this.gameHUD.hasAllTools && this.fridgeContraint) {
            PubSub.getInstance().publish('level-complete');
            this.gameHUD = new GameHUD(this.zone);
        }

        const collisions = Matter.Detector.collisions(this.engine.world);
        const playerCollisions = collisions.filter(i => i.bodyA.label === 'Player' || i.bodyB.label === 'Player');

        const groundCollision = playerCollisions.find(i => i.bodyA.label === 'Ground' || i.bodyB.label === 'Ground');

        delete this.player2.groundSprite;
        if (groundCollision && groundCollision.collided) {
            this.player2.isGrounded = true;
        } else {
            this.player2.isGrounded = false;
        }

        if (this.fridge && !this.fridgeContraint) {

            const col = playerCollisions.find(i => i.bodyA.label === 'fridge' || i.bodyB.label === 'fridge');
            if (col) {
                this.createFridgeConstraint();
            }
        }


        const collectables = playerCollisions.filter(i => this.colletableLabels.indexOf(i.bodyA.label) > -1 || this.colletableLabels.indexOf(i.bodyB.label) > -1);


        for (const collectableCollision of collectables) {
            const colletableBody = this.colletableLabels.indexOf(collectableCollision.bodyA.label) > -1 ? collectableCollision.bodyA : collectableCollision.bodyB;

            this.removeSprite(this.gameSprites.find(i => i.body === colletableBody));
            switch (colletableBody.label) {
                case 'coin':
                    this.gameHUD.incrementCoinCount();
                    break;
                case 'hammer':
                    this.gameHUD.collectHammer();
                    //this.playCollectTool();
                    break;
                case 'saw':
                    console.log(collectableCollision);
                    this.gameHUD.collectSaw();
                    this.playCollectTool();
                    break;
                case 'drill':
                    this.gameHUD.collectDrill();
                    this.playCollectTool();
                    break;
                case 'screwdriver':
                    this.gameHUD.collectScrewdriver();
                    this.playCollectTool();
                    break;
                case 'wrench':
                    this.gameHUD.collectWrench();
                    this.playCollectTool();
                    break;
            } 
        }

        const impactCollisions = playerCollisions.filter(i => this.impactObjectsLabels.indexOf(i.bodyA.label) > -1 || this.impactObjectsLabels.indexOf(i.bodyB.label) > -1);


        //console.log(playerCollisions);
        for (const collision of impactCollisions) {

            let forceY = (this.bounceCount + 1) * -0.1;
            this.bounceCount++;
            if (forceY < -0.6) {
                forceY = -0.6;
            }
            if (collision.penetration.y < 0) {
                const label = collision.bodyA.label === 'Player' ? collision.bodyB.label : collision.bodyA.label;
                switch (label) {
                    case 'trampoline':
                        Matter.Body.applyForce(this.player2.body, { x: this.player2.body.position.x, y: this.player2.body.position.y }, { x: 0, y: forceY });

                        const trampSound: HTMLAudioElement = document.getElementById('bounce-sound') as HTMLAudioElement;
                        trampSound.currentTime = 0;
                        trampSound.play();
                        const sprite = this.gameSprites.find(i => (i.body === collision.bodyA || i.body === collision.bodyB) && i !== this.player2);
                        if (sprite) {
                            sprite.play();
                        }
                        break;
                    case 'spike-brick':
                        this.loseLife();
                        break;
                    case 'Ram':
                        const ram = this.gameSprites.find(i => (i.body === collision.bodyA || i.body === collision.bodyB) && i !== this.player2);
                        if (ram) {

                            const killSound: HTMLAudioElement = document.getElementById('kill-enemy-sound') as HTMLAudioElement;
                            killSound.currentTime = 0;
                            killSound.play();
                            Matter.Body.applyForce(this.player2.body, { x: this.player2.body.position.x, y: this.player2.body.position.y }, { x: 0, y: -0.2 });
                            this.removeSprite(ram);
                        }
                        break;
                    case 'Mystery':
                    case 'mystery-top':
                    case 'brick-top':
                    case 'Brick':
                    case 'log-short':
                    case 'log':
                    case 'Ice':
                    case 'cannon':
                    case 'solid-block':
                        this.player2.isGrounded = true;
                        this.player2.groundSprite = this.gameSprites.find(i => (
                            i.body === collision.bodyA
                            || i.frictionBody === collision.bodyA
                            || i.frictionBody === collision.bodyB
                            || i.body === collision.bodyB) && i !== this.player2);
                        break;
                }

            } else if (Math.abs(collision.penetration.x) > 0) {

                const label = collision.bodyA.label === 'Player' ? collision.bodyB.label : collision.bodyA.label;
                switch (label) {
                    case 'Ram':
                        this.loseLife();
                        break;
                }
            }
            if (collision.penetration.y > 0) {
                const label = collision.bodyA.label === 'Player' ? collision.bodyB.label : collision.bodyA.label;
                const otherSprite = this.gameSprites.find(i => (i.body === collision.bodyA || i.body === collision.bodyB) && i !== this.player2);
                switch (label) {
                    case 'brick-top':
                    case 'Brick':
                        //otherSprite.bounceIt();
                        otherSprite.breakIt();
                        this.removeSprite(otherSprite);
                        break;
                    case 'Mystery':
                    case 'mystery-top':
                        if (!otherSprite.empty) {
                            otherSprite.emptyIt();
                            this.gameHUD.incrementCoinCount();
                        }
                        break;
                }
            }
        }

        const enemyCollisions = playerCollisions.filter(i => this.enemyLabels.indexOf(i.bodyA.label) > -1 || this.enemyLabels.indexOf(i.bodyB.label) > -1);
        if (enemyCollisions.length > 0) {
            this.loseLife();
        }

        const completionBarrier = playerCollisions.filter(i => i.bodyA.label === 'completion-barrier' || i.bodyB.label === 'completion-barrier');
        if (completionBarrier.length) {

            if (this.gameHUD.hasAllTools && this.fridgeContraint) {
                const sprite = this.gameSprites.find(i => i.body.label === 'completion-barrier');
                this.removeSprite(sprite);
            } else {
                this.showCloseBarrier = true;
                PubSub.getInstance().publish('hit-completion-barrier');
            }
        }

        this.centerPlayer();
        if (this.player2.isGrounded) {
            this.bounceCount = 0;
        }
    }

    loseLife() {
        this.player2.x = 0;
        this.player2.y = 0;
        Matter.Body.setPosition(this.player2.body, { x: 0, y: 0 });
        Matter.Body.setVelocity(this.player2.body, { x: 0, y: 0 });

        document.getElementById('game-div').classList.add('reset');
        document.getElementById('bottom-filler').classList.add('reset');
        document.getElementById('bg-buildings').classList.add('reset');
        document.getElementById('bg-plants').classList.add('reset');
        document.getElementById('bg-sky').classList.add('reset');

        document.getElementById('game-div').style.transform = 'translateX(0px)';
        document.getElementById('bg-buildings').style.transform = 'translateX(0px)';
        document.getElementById('bg-plants').style.transform = 'translateX(0px)';
        document.getElementById('bg-sky').style.transform = 'translateX(0px)';
        document.getElementById('bottom-filler').style.transform = 'translateX(0px)';

        setTimeout(() => {
            document.getElementById('game-div').classList.remove('reset');
            document.getElementById('bg-buildings').classList.remove('reset');
            document.getElementById('bg-plants').classList.remove('reset');
            document.getElementById('bg-sky').classList.remove('reset');
            document.getElementById('bottom-filler').classList.add('reset');

        }, 2000);

        const el: HTMLAudioElement = document.getElementById('die-sound') as HTMLAudioElement;
        el.currentTime = 0;
        el.play();

        setTimeout(() => {
            if (this.player2.x < 0) {
                this.player2.x = 0;
                this.player2.y = 50;
                Matter.Body.setPosition(this.player2.body, { x: 0, y: 50 });
                Matter.Body.setVelocity(this.player2.body, { x: 0, y: 0 });
            }
        }, 1000);
    }

    addSprite(sprite) {
        this.gameSprites.push(sprite);
        if (sprite.domObject) {
            const div = document.getElementById('game-div');
            div.appendChild(sprite.domObject);
            sprite.domObject.classList.add('sprite');
        }
    }

    centerPlayer() {
        const windowWidth = window.innerWidth;
        const worldWidth = this.world.width;
        const playerLeft = this.player2.x + (this.player2.width / 2);

        if (playerLeft > windowWidth / 2 && playerLeft < (worldWidth - (windowWidth / 2))) {

            const x = windowWidth - playerLeft;
            const offset = windowWidth / 2 - x;
            document.getElementById('game-div').style.transform = 'translateX(-' + offset + 'px)';
            document.getElementById('bottom-filler').style.transform = 'translateX(-' + offset + 'px)';
            document.getElementById('bg-buildings').style.transform = 'translateX(-' + (offset * .1) + 'px)';
            document.getElementById('bg-plants').style.transform = 'translateX(-' + (offset * .5) + 'px)';
            document.getElementById('bg-sky').style.transform = 'translateX(-' + (offset * .01) + 'px)';
            this.world.scrollPosition = offset;
        }
    }

    static getInstance(zone: NgZone = null): Game {
        if (!Game.gameInstance) {
            Game.gameInstance = new Game(zone);
        }

        return Game.gameInstance;
    }

    static deleteInstance() {
        PubSub.deleteInstance();
        World.deleteInstance();
        if (Game.gameInstance) {
            // if(Game.getInstance().player2) {
            //     Game.getInstance().player2.subscriptionEvents.unsubscribe();

            // }
            Game.gameInstance.stop();
        }
        delete Game.gameInstance;
    }

    static clearInstance(zone: NgZone) {
        Game.gameInstance = new Game(zone);
    }

    removeSprite(sprite) {
        if (sprite.body) {
            Matter.Composite.remove(this.engine.world, sprite.body)
        }
        if (sprite.frictionTop) {
            Matter.Composite.remove(this.engine.world, sprite.frictionTop)
        }
        if (sprite.domObject) {
            sprite.domObject.parentNode.removeChild(sprite.domObject);

        }
        this.gameSprites.splice(this.gameSprites.indexOf(sprite), 1);
    }

    start() {
        this.gameStartTime = new Date();
        this.internval = setInterval(() => this.doGameLoop(), 10);
    }

    stop() {
        clearInterval(this.internval);
    }

    doGameLoop() {
        const now = new Date();
        let remainingSeconds = this.gameTotalSeconds - (now.getTime() - this.gameStartTime.getTime()) / 1000;
        if (remainingSeconds < 0) {
            remainingSeconds = 0;
            PubSub.getInstance().publish('game-lost');
        }
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = Math.floor(remainingSeconds % 60);
        this.zone.run(() => {
            this.remaining = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        });
        if (this.gameHUD) {
            this.gameHUD.setTimeRemaining(this.remaining);
            this.advance();
            for (const sprite of this.gameSprites) {
                sprite.advance();
            }
        }


    }
}

export class GameHUD {

    constructor(private zone: NgZone) {

    }

    private _coinCount = 0;
    get coinCount() {
        return this._coinCount;
    }
    set coinCount(value: number) {
        this.zone.run(() => {
            this._coinCount = value;
        });
    }

    timerStarted = false;
    hasWrench = false;
    hasSaw = false;
    hasDrill = false;
    hasHammer = false;
    hasScrewdriver = false;
    timeRemaining: string;

    startTimer() {
        this.timerStarted = true;
    }

    get hasAllTools() {
        return this.hasWrench && this.hasSaw && this.hasHammer && this.hasScrewdriver && this.hasDrill;
    }


    get money() {
        return this._coinCount * 10;
    }

    setTimeRemaining(value: string) {
        this.zone.run(() => this.timeRemaining = value);
    }

    incrementCoinCount() {
        const audio: HTMLAudioElement = document.getElementById('chime') as HTMLAudioElement;
        audio.currentTime = 0;
        audio.play();
        this.coinCount++;
    }

    collectWrench() {
        this.zone.run(() => this.hasWrench = true);
    }

    collectSaw() {
        this.zone.run(() => this.hasSaw = true);

    }

    collectDrill() {
        this.zone.run(() => this.hasDrill = true);

    }

    collectHammer() {
        this.zone.run(() => this.hasHammer = true);

    }

    collectScrewdriver() {
        this.zone.run(() => this.hasScrewdriver = true);

    }
}