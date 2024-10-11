declare var Matter: any;

import { World } from './world';
import { Ground } from './ground';
import { Brick } from './brick';
import { HTTP } from './http';
// import { Editor } from './editor';
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
import { ToolBarComponent } from '../utilities/tool-bar/tool-bar.component';

var Engine = Matter.Engine,
    MatterWorld = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;


export class Game {
    static gameInstance;
    world;
    internval;
    static gravity = 1;
    //player;
    player2: Player2;
    ground;

    gameSprites = [];
    pubSub = PubSub.getInstance();
    //collisionDetection;
    engine;
    gameHUD: GameHUD;

    infoBarier: Ground;
    showQuestBegin = false;
    questShown = false;
    applianceShopLeft = 8000;
    dialogOpen: boolean;
    gameStartTime: Date;
    gameTotalSeconds = 120;
    remaining: string;
    homeLeft = 16000;
    homeLeftEnd = this.homeLeft + 300;
    initialLeft = 400;

    // get applianceShopAreaLeft() {
    //     return this.applianceShopLeft - 100;
    // }

    get applianceShopAreaRight() {
        return this.applianceShopLeft + 450;
    }

    constructor(private zone: NgZone) {
        this.engine = Engine.create();

        Matter.Runner.run(this.engine);
        this.engine.gravity.y = Game.gravity;

        this.player2 = new Player2(this.engine, 80, 0, 71, 96);
        this.addSprite(this.player2);
        this.gameHUD = new GameHUD(zone);

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

        document.addEventListener('keyup', key => {
            if (key.key === ' ' && this.infoBarier) {
                if (this.showQuestBegin) {
                    PubSub.getInstance().publish('close-begin-quest');
                    this.removeSprite(this.infoBarier);
                    delete this.infoBarier;
                    this.showQuestBegin = false;
                }
            }
            if (key.key === 'ArrowUp') {
                console.log('arrowup');
                console.log({ playerLeft: this.playerLeft, left: this.applianceShopLeft, right: this.applianceShopAreaRight })
                if (this.playerLeft >= this.applianceShopLeft && this.playerLeft <= this.applianceShopAreaRight) {
                    PubSub.getInstance().publish('show-shop');
                }
            }

            if (key.key === 't' || key.key === 'T' && !this.fridge) {
                // this.fridge = new Fridge1(this.engine, this.playerLeft - 30, this.playerTop - 72);
                // Matter.Body.setMass(this.fridge.body, .1);
                // this.addSprite(this.fridge);
                // this.createFridgeConstraint();
                // PubSub.getInstance().publish('level-complete');
                if (this.playerTop > 0) {
                    Matter.Body.applyForce(this.player2.body, { x: this.player2.body.position.x, y: this.player2.body.position.y }, { x: 0, y: -.3 });
                }
            }
            if (key.key === 'D' || key.key === 'd') {
                if (this.fridgeContraint) {
                    Matter.Composite.remove(this.engine.world, this.fridgeContraint);
                    delete this.fridgeContraint;
                }
            }
        });
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

        // Matter.Events.on(this.engine, 'collisionActive', event => {
        //     for (const pair of event.pairs) {
        //         if (pair.bodyA.label === 'Player' || pair.bodyB.label === 'Player') {
        //             if (pair.bodyA.label === 'spike-ball' || pair.bodyB.label === 'spike-ball') {
        //                 this.loseLife();
        //             }
        //         }
        //     }
        //     console.log(event);
        // });

        for (const sprite of sprites) {
            if (sprite.objectType === 'Brick') {
                const brick = new Brick(this.engine, sprite.originalX, sprite.originalY);
                brick.x = sprite.originalX;
                brick.y = sprite.originalY;
                brick.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(brick);
            } else if (sprite.objectType === 'Saw') {
                const saw = new Saw(this.engine, sprite.originalX, sprite.originalY);
                saw.x = sprite.originalX;
                saw.y = sprite.originalY;
                saw.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(saw);
            } else if (sprite.objectType === 'Screwdriver') {
                const tool = new Screwdriver(this.engine, sprite.originalX, sprite.originalY);
                tool.x = sprite.originalX;
                tool.y = sprite.originalY;
                tool.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(tool);
            } else if (sprite.objectType === 'Wrench') {
                const tool = new Wrench(this.engine, sprite.originalX, sprite.originalY);
                tool.x = sprite.originalX;
                tool.y = sprite.originalY;
                tool.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(tool);
            } else if (sprite.objectType === 'Hammer') {
                const tool = new Hammer(this.engine, sprite.originalX, sprite.originalY);
                tool.x = sprite.originalX;
                tool.y = sprite.originalY;
                tool.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(tool);
            } else if (sprite.objectType === 'Drill') {
                const tool = new Drill(this.engine, sprite.originalX, sprite.originalY);
                tool.x = sprite.originalX;
                tool.y = sprite.originalY;
                tool.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(tool);
            } else if (sprite.objectType === 'MysteryBlock') {
                const mystery = new MysteryBlock(this.engine, sprite.originalX, sprite.originalY);
                mystery.x = sprite.originalX;
                mystery.y = sprite.originalY;
                mystery.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(mystery);

            } else if (sprite.objectType === 'SpikeBall') {
                const spikeBall = new SpikeBall(this.engine, sprite.originalX, sprite.originalY);
                spikeBall.x = sprite.originalX;
                spikeBall.y = sprite.originalY;
                spikeBall.initialX = spikeBall.x;
                spikeBall.initialY = spikeBall.y;
                spikeBall.moveSpeed = spikeBall.moveSpeed;
                spikeBall.moveDistance = spikeBall.moveDistance;
                spikeBall.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(spikeBall);
            } else if (sprite.objectType === 'Ram') {
                const ram = new Ram(this.engine, sprite.originalX, sprite.originalY);
                ram.x = sprite.originalX;
                ram.y = sprite.originalY;
                ram.initialX = ram.x;
                ram.initialY = ram.y;
                ram.moveSpeed = ram.moveSpeed;
                ram.moveDistance = ram.moveDistance;
                ram.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(ram);
            } else if (sprite.objectType === 'Coin') {
                const coin = new Coin(this.engine, sprite.originalX, sprite.originalY, 'static');
                coin.x = sprite.originalX;
                coin.y = sprite.originalY;
                coin.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(coin);
            } else if (sprite.objectType === 'Log') {
                const log = new Log(this.engine, sprite.originalX, sprite.originalY);
                log.x = sprite.originalX;
                log.y = sprite.originalY;
                log.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(log);
            } else if (sprite.objectType === 'ShortLog') {
                const log = new ShortLog(this.engine, sprite.originalX, sprite.originalY);
                log.x = sprite.originalX;
                log.y = sprite.originalY;
                log.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(log);
            } else if (sprite.objectType === 'ManHole') {
                const log = new ManHole(this.engine, sprite.originalX, sprite.originalY);
                log.x = sprite.originalX;
                log.y = sprite.originalY;
                log.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(log);
            } else if (sprite.objectType === 'Ice') {
                const log = new Ice(this.engine, sprite.originalX, sprite.originalY);
                log.x = sprite.originalX;
                log.y = sprite.originalY;
                log.id = sprite.id ?? ToolBarComponent.newid();
                this.addSprite(log);
            }
        }
    }

    coinCount = 0;

    get playerLeft() {
        return parseFloat(this.player2.domObject.style.left.replace('px', ''));
    }

    get playerTop() {
        return parseFloat(this.player2.domObject.style.top.replace('px', ''));
    }

    private colletableLabels = ['saw', 'wrench', 'hammer', 'screwdriver', 'drill', 'coin'];
    private enemyLabels = ['Ram', 'spike-ball', 'man-hole'];

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



        const left = this.playerLeft;
        if (left > (this.initialLeft - 50) && !this.showQuestBegin && !this.questShown && this.playerTop > 0) {
            this.questShown = true;
            this.zone.run(() => {
                this.showQuestBegin = true;
                PubSub.getInstance().publish('quest-begin');
                document.getElementById('construction-worker').parentNode.removeChild(document.getElementById('construction-worker'));
            });
        }


        if (left > this.homeLeft && left < this.homeLeftEnd && this.gameHUD.hasAllTools && this.fridgeContraint) {
            PubSub.getInstance().publish('level-complete');
            this.gameHUD = new GameHUD(this.zone);
        }
        const count = this.gameSprites.filter(i => i.objectType === 'Coin').length;
        if (count != this.coinCount) {

            this.coinCount = count;
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
                    break;
                case 'saw':
                    this.gameHUD.collectSaw();
                    break;
                case 'drill':
                    this.gameHUD.collectDrill();
                    break;
                case 'screwdriver':
                    this.gameHUD.collectScrewdriver();
                    break;
                case 'wrench':
                    this.gameHUD.collectWrench();
                    break;
            }
        }
        const enemyCollisions = playerCollisions.filter(i => this.enemyLabels.indexOf(i.bodyA.label) > -1 || this.enemyLabels.indexOf(i.bodyB.label) > -1);
        if (enemyCollisions.length > 0) {
            this.loseLife();
        }


        if (!this.player2.isGrounded) {
            for (const sprite of this.gameSprites) {
                if (sprite.objectType === 'Brick'
                    || sprite.objectType === 'MysteryBlock'
                    || sprite.objectType === 'Log'
                    || sprite.objectType === 'Fridge1'
                    || sprite.objectType === 'Fridge2'
                    || sprite.objectType === 'Fridge3'
                    || sprite.objectType === 'ShortLog') {
                    const brickCollision = Matter.Collision.collides(sprite.body, this.player2.body);
                    if (brickCollision) {
                        if (sprite.objectType === 'Log' || sprite.objectType === 'ShortLog') {
                            this.player2.isGrounded = true;
                            this.player2.groundSprite = sprite;
                        }
                        const deltaX = Math.abs(brickCollision.bodyA.position.x - brickCollision.bodyB.position.x);
                        if (brickCollision.bodyA.position.y < brickCollision.bodyB.position.y && deltaX < 20) {
                            this.player2.isGrounded = true;
                            this.player2.groundSprite = sprite;
                        }
                    }
                    if (sprite.objectType === 'MysteryBlock') {
                        if (brickCollision) {
                            const deltaX = Math.abs(brickCollision.bodyA.position.x - brickCollision.bodyB.position.x);
                            if (brickCollision.bodyA.position.y > brickCollision.bodyB.position.y && deltaX < 50) {
                                if (sprite.emptyIt()) {
                                    this.gameHUD.incrementCoinCount();
                                }
                            }
                        }
                    }
                    if (sprite.objectType === 'Brick') {
                        if (brickCollision) {
                            const deltaX = Math.abs(brickCollision.bodyA.position.x - brickCollision.bodyB.position.x);
                            if (brickCollision.bodyA.position.y > brickCollision.bodyB.position.y && deltaX < 30) {
                                sprite.bounceIt();
                            }
                        }
                    }

                    if (!this.player2.isGrounded) {
                        if (sprite.frictionTop) {
                            const brickCollision = Matter.Collision.collides(sprite.frictionTop, this.player2.body);
                            if (brickCollision) {
                                if (brickCollision.bodyA.position.y < brickCollision.bodyB.position.y) {
                                    this.player2.isGrounded = true;
                                    this.player2.groundSprite = sprite;
                                }
                            }
                        }
                    }
                }
            }
        }

        this.centerPlayer();
    }

    loseLife() {
        this.player2.x = 0;
        this.player2.y = 0;
        Matter.Body.setPosition(this.player2.body, { x: 0, y: 0 });
        Matter.Body.setVelocity(this.player2.body, { x: 0, y: 0 });

        document.getElementById('game-div').classList.add('reset');
        document.getElementById('bg-buildings').classList.add('reset');
        document.getElementById('bg-plants').classList.add('reset');
        document.getElementById('bg-sky').classList.add('reset');

        document.getElementById('game-div').style.transform = 'translateX(0px)';
        document.getElementById('bg-buildings').style.transform = 'translateX(0px)';
        document.getElementById('bg-plants').style.transform = 'translateX(0px)';
        document.getElementById('bg-sky').style.transform = 'translateX(0px)';

        setTimeout(() => {
            document.getElementById('game-div').classList.remove('reset');
            document.getElementById('bg-buildings').classList.remove('reset');
            document.getElementById('bg-plants').classList.remove('reset');
            document.getElementById('bg-sky').classList.remove('reset');

        }, 2000);

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
            // TODO: lose the game
        }
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = Math.floor(remainingSeconds % 60);
        this.zone.run(() => {
            this.remaining = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        });
        this.gameHUD.setTimeRemaining(this.remaining);
        this.advance();
        for (const sprite of this.gameSprites) {
            sprite.advance();
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

    hasWrench = false;
    hasSaw = false;
    hasDrill = false;
    hasHammer = false;
    hasScrewdriver = false;
    timeRemaining: string;

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