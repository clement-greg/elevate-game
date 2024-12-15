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
import { AC1, AC2, AC3, Fridge1, Fridge2, Fridge3, WaterHeater1, WaterHeater2, WaterHeater3 } from './fridge';
import { GameSprite } from './game-sprite';
import { ToolBarComponent } from '../components/tool-bar/tool-bar.component';
import { Trampoline } from './trampoline';
import { SpikeBrick } from './spike-brick';
import { Cannon } from './cannon';
import { CannonBall } from './cannon-ball';
import { IBeam } from './i-beam';
import { JetPackMysteryBlock } from './jet-pack-mystery-block';
import { Config } from './config';
import { CeilingSpike } from './ceiling-spike';
import { Dynamite } from './ahs';
import { pauseSound, playSound } from '../utilities/sound-utils';
import { JoystickState } from './joystick-state';
import { GameInstanceManager } from './game-instance';
import { FireVent } from './fire-vent';
import { FlameThrowerMysteryBlock } from './flame-thrower-mystery-block';
import { Riser } from './riser';

var Engine = Matter.Engine,
    MatterWorld = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;


export class Game {
    static gameInstance;
    world;
    internval;

    player2: Player2;
    ground;

    gameSprites = [];
    pubSub = PubSub.getInstance();
    engine;
    gameHUD: GameHUD;

    infoBarier: Ground;
    showQuestBegin = false;
    questShown = false;

    // TODO should be dynamic based on the location
    static applianceShopLeft = 8000;
    dialogOpen: boolean;
    gameStartTime: Date;
    remaining: string;

    // TODO should be dynamic based on the location
    static homeLeft = 16000;
    static homeLeftEnd = this.homeLeft + 300;
    static initialLeft = 400;
    showCloseBarrier = false;
    cannons: Cannon[] = [];
    editorOpen: boolean;
    joystickState = new JoystickState(0);
    gameTimeout: any;


    static get applianceShopAreaRight() {
        return Game.applianceShopLeft + 450;
    }

    constructor(private zone: NgZone, private location: 'AZ' | 'UT' | 'NV') {
        this.initialize(zone);
        this.joystickState.onButtonPress = this.joystickButtonPress.bind(this);
    }
    completionBarrier: any;

    advanceInterval;

    initialize(zone: NgZone) {
        if (!zone) {
            return;
        }

        if (!document.getElementById('game-div')) {
            setTimeout(() => this.initialize(zone), 100);
            return;
        }


        this.engine = Engine.create();
        clearInterval(this.advanceInterval);
        this.advanceInterval = setInterval(() => this.run(), 1000 / Config.getInstance().framesPerSecond);
        this.engine.gravity.y = Config.getInstance().gravity;

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
        this.warningStarted = false;

        const ceiling = new Ground(this.engine, 0, -50, this.world.width, 20);
        ceiling.body.friction = 0;


        const left = new Ground(this.engine, 0, 0, 2, 10000);
        left.body.friction = 0;

        // Might need to be dynamic
        this.infoBarier = new Ground(this.engine, 1500, 0, 2, 10000);
        this.infoBarier.body.friction = 0;
        this.gameSprites.push(this.infoBarier);

        // Might need to be dynamic
        this.completionBarrier = new Ground(this.engine, Game.homeLeft - 150, 0, 2, 10000);
        this.completionBarrier.body.label = 'completion-barrier';
        this.completionBarrier.body.friction = 0;
        this.gameSprites.push(this.completionBarrier);


        let level = 'level4.json';
        switch (this.location) {
            case 'AZ':
                level = 'az.json';
                break;
            case 'NV':
                level = 'nv.json';
                break;
        }
        HTTP.getData(`./assets/levels/${level}`).then(json => {
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

        this.pubSub.subscribe('jet-pack-change', () => {
            const hasJetPack = this.gameHUD.isJetPackMode;
            const domObject: HTMLElement = this.player2.domObject;
            if (hasJetPack) {
                PubSub.getInstance().publish('eli-popup', {
                    message: `Jetpack Mode Activated!!! 
                    `});
                domObject.classList.add('has-jet-pack');
            } else {
                domObject.classList.remove('has-jet-pack');
            }
        });
        this.pubSub.subscribe('flame-thrower-change', () => {
            const hasFlameThrower = this.gameHUD.isFlameThrower;
            const domObject: HTMLElement = this.player2.domObject;
            if (hasFlameThrower) {
                domObject.classList.add('has-flame-thrower');
                PubSub.getInstance().publish('eli-popup', {
                    message: `Flame thrower mode activated!!!`});
            } else {
                domObject.classList.remove('has-flame-thrower');
            }
        });

        // Might be dynamic based on location
        playSound('bg-music');
    }

    primaryButtonKeys = [' ', 'a', 'A'];
    secondaryButtonKeys = ['ArrowUp', 'b', 'B'];


    isMovingRight = false;
    isMovingLeft = false;
    processKeyDownEvent(key: KeyboardEvent) {
        if (key.key == 'ArrowRight') {
            this.player2.accelerating = true;
            this.player2.arrowRight = true;
            this.isMovingRight = true;
        }

        if (key.key === 'ArrowLeft') {
            this.player2.accelerating = true;
            this.player2.arrowLeft = true;
            this.isMovingLeft = true;
        }
        if (this.primaryButtonKeys.indexOf(key.key) > -1) {
            this.player2.jump();
        }

    }

    run() {
        Engine.update(this.engine, 1000 / Config.getInstance().framesPerSecond);
        this.advance();
    }

    shopEntranceAvailable = false;
    isJoystickLeft = false;
    isJoystickRight = false;

    joystickButtonPress(btn: number) {
        switch (btn) {
            case 0:
                this.doPrimaryKey();
                break;
            case 1:
                this.doSecondaryKey();
                break;
        }
    }

    doSecondaryKey() {
        if (!this.dialogOpen && !this.fridge && this.playerLeft >= Game.applianceShopLeft && this.playerLeft <= Game.applianceShopAreaRight) {
            PubSub.getInstance().publish('show-shop');
        } else if (this.dialogOpen) {
            if (this.infoBarier && this.showQuestBegin) {
                this.doPrimaryKey();
            } else {
                PubSub.getInstance().publish('close-all-diagrams');
                this.dialogOpen = false;
            }
        } else {
            if (this.gameHUD.isFlameThrower) {
                this.player2.runFlameThrower();
            }
        }
    }

    doPrimaryKey() {
        if (this.infoBarier) {
            if (this.showQuestBegin) {
                PubSub.getInstance().publish('close-begin-quest');
                this.removeSprite(this.infoBarier);
                delete this.infoBarier;
                this.showQuestBegin = false;
                this.gameStartTime = new Date();
                this.gameHUD.startTimer();
            }
        } else if (this.showCloseBarrier) {
            Matter.Body.applyForce(this.player2.body, { x: this.player2.body.position.x, y: this.player2.body.position.y }, { x: -1, y: 0 });
            setTimeout(() => PubSub.getInstance().publish('close-info-barrier'), 100);
            this.showCloseBarrier = false;
        } else {
            this.player2?.jump();
        }
    }

    processKeyUp(key: KeyboardEvent) {
        if (key.key == 'ArrowRight') {
            this.player2.accelerating = false;
            this.player2.arrowRight = false;
            this.isMovingRight = false;
        }

        if (key.key === 'ArrowLeft') {
            this.player2.accelerating = false;
            this.player2.arrowLeft = false;
            this.isMovingLeft = false;
        }
        if (this.primaryButtonKeys.indexOf(key.key) > -1 && this.infoBarier) {
            this.doPrimaryKey();
        }

        if (this.secondaryButtonKeys.indexOf(key.key) > -1) {
            this.doSecondaryKey();
        }
        if ((key.key === 't' || key.key === 'T') && Config.getInstance().allowDebug) {
            if (this.playerTop > 0) {
                Matter.Body.applyForce(this.player2.body, { x: this.player2.body.position.x, y: this.player2.body.position.y }, { x: 0, y: -.3 });
            }
        }
        if ((key.key === 's' || key.key === 'S') && Config.getInstance().allowDebug) {
            for (let i = 0; i < 220; i++) {
                this.gameHUD.incrementCoinCount();
            }
            PubSub.getInstance().publish('show-shop');
        }
        if ((key.key === 'w' || key.key === 'W') && Config.getInstance().allowDebug) {
            this.doWin();
        }
        if ((key.key === 'l' || key.key === 'L') && Config.getInstance().allowDebug) {
            this.doLost();
        }
        if (key.key === 'D' || key.key === 'd') {
            if (this.fridgeContraint) {
                Matter.Composite.remove(this.engine.world, this.fridgeContraint);
                delete this.fridgeContraint;
            }
        }
    }

    doWin() {
        PubSub.getInstance().publish('level-complete');
        playSound('game-over-won-sound');
        this.stop();
    }

    purchaseFridge(number = 1 | 2 | 3) {
        switch (this.location) {
            case 'AZ':
                switch (number) {
                    case 1:
                        this.fridge = new AC3(this.engine, this.playerLeft - 30, this.playerTop - 72);
                        break;
                    case 2:
                        this.fridge = new AC1(this.engine, this.playerLeft - 30, this.playerTop - 72);
                        break;
                    case 3:
                        this.fridge = new AC2(this.engine, this.playerLeft - 30, this.playerTop - 72);
                        break;
                }
                break;
            case 'NV':
                switch (number) {
                    case 1:
                        this.fridge = new WaterHeater1(this.engine, this.playerLeft - 30, this.playerTop - 72);
                        break;
                    case 2:
                        this.fridge = new WaterHeater2(this.engine, this.playerLeft - 30, this.playerTop - 72);
                        break;
                    case 3:
                        this.fridge = new WaterHeater3(this.engine, this.playerLeft - 30, this.playerTop - 72);
                        break;
                }
                break;
            default:
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
        }

        Matter.Body.setMass(this.fridge.body, .000000000000000001);

        this.addSprite(this.fridge);
        this.createFridgeConstraint();
        GameInstanceManager.lastStars = number;
        setTimeout(() => {

            this.playDiscoTimeIfNeeded();
        }, 2000);
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

    initializeSprite(template: GameSprite, instance: GameSprite) {
        instance.x = template.originalX;
        instance.y = template.originalY;
        instance.id = template.id ?? ToolBarComponent.newid();
        instance.originalX = template.originalX;
        instance.originalY = template.originalY;
        this.addSprite(instance);
    }

    setupGame(json) {
        const sprites = JSON.parse(json);
        this.originalSprites = sprites;
        this.originalSprites = this.originalSprites.filter(i => i.objectType !== 'Player2' && i.objectType != 'cannon-ball');

        for (const sprite of sprites) {
            if (sprite.objectType === 'Brick') {
                const newSprite = new Brick(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'Saw') {
                const newSprite = new Saw(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'Screwdriver') {
                const newSprite = new Screwdriver(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'Wrench') {
                const newSprite = new Wrench(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'Hammer') {
                const newSprite = new Hammer(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'Drill') {
                const newSprite = new Drill(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'MysteryBlock') {
                const newSprite = new MysteryBlock(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'jet-pack-mystery-block') {
                const newSprite = new JetPackMysteryBlock(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'ceiling-spike') {
                const newSprite = new CeilingSpike(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'SpikeBall') {
                const newSprite = new SpikeBall(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'Ram') {
                const newSprite = new Ram(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'Coin') {
                const newSprite = new Coin(this.engine, sprite.originalX, sprite.originalY, 'static');
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'Log') {
                const newSprite = new Log(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'ShortLog') {
                const newSprite = new ShortLog(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'i-beam' || sprite.objectType === 'IBeam') {
                const newSprite = new IBeam(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'ManHole') {
                const newSprite = new ManHole(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'Ice') {
                const newSprite = new Ice(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'trampoline') {
                const newSprite = new Trampoline(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'cannon') {
                const newSprite = new Cannon(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
                this.cannons.push(newSprite);
            } else if (sprite.objectType === 'spike-brick') {
                const newSprite = new SpikeBrick(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);;
            } else if (sprite.objectType === 'solid-block' || sprite.objectType === 'SolidBlock') {
                const newSprite = new SolidBlock(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'dynamite') {
                const newSprite = new Dynamite(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'fire-vent') {
                const newSprite = new FireVent(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'flame-thrower-mystery-block') {
                const newSprite = new FlameThrowerMysteryBlock(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            } else if (sprite.objectType === 'riser') {
                const newSprite = new Riser(this.engine, sprite.originalX, sprite.originalY);
                this.initializeSprite(sprite, newSprite);
            }
        }

        this.removeDuplicatePlayer();
    }

    removeDuplicatePlayer() {
        // This shouldn't be needed, but its producing a second player after playing again
        const playerDivs = document.querySelectorAll('.player');
        for (let i = 0; i < playerDivs.length; i++) {
            if (playerDivs[i] !== this.player2.domObject) {
                playerDivs[i].parentNode.removeChild(playerDivs[i]);
                break;
            }
        }
    }

    get playerLeft() {
        return parseFloat(this.player2.domObject?.style.left.replace('px', ''));
    }

    get playerTop() {
        return parseFloat(this.player2.domObject?.style.top.replace('px', ''));
    }

    private colletableLabels = ['saw', 'wrench', 'hammer', 'screwdriver', 'drill', 'coin'];
    private enemyLabels = ['spike-ball', 'man-hole'];
    private impactObjectsLabels = ['trampoline', 'riser', 'cannon-ball', 'spike-brick', 'dynamite', 'ceiling-spike', 'cannon', 'Ram', 'Brick', 'i-beam', 'brick-top', 'mystery-top', 'jet-pack-mystery-block', 'Ice', 'Mystery', 'log-short', 'log', 'solid-block', 'fire-vent', 'flame-thrower-mystery-block'];
    private flameTargetLabels = ['spike-ball', 'Ram', 'dynamite', 'cannon-ball'];

    playCollectTool() {
        playSound('collect-tool-sound');
        this.playDiscoTimeIfNeeded();
    }

    showDiscoTime = false;
    playDiscoTimeIfNeeded() {
        if (this.gameHUD.hasAllTools && this.fridgeContraint) {
            this.forceDiscoTime();
        }
    }

    forceDiscoTime() {
        setTimeout(() => {
            playSound('disco-time');
            this.zone.run(() => {
                this.showDiscoTime = true;
            });
            setTimeout(() => {
                this.zone.run(() => this.showDiscoTime = false);
            }, 2000);
        }, 1000);
    }

    bounceCount = 0;
    lastBounce = new Date();

    killRam(ram, bouncePlayer = true) {
        playSound('goat-sound');
        const ramDead = document.createElement('lottie-player');

        (ramDead as any).src = 'https://lottie.host/187ff4ec-50a4-4a0e-94ab-14ca38c87bdb/rFeMypKyaw.json';
        ramDead.style.position = 'absolute';
        ramDead.style.left = `${ram.x - 125}px`;
        ramDead.style.top = `${ram.y - 125}px`;
        ramDead.style.height = '200px';
        ramDead.style.width = '200px';
        ramDead.setAttribute('autoplay', '1');

        document.getElementById('game-div').appendChild(ramDead);

        setTimeout(() => {
            ramDead.parentNode.removeChild(ramDead);
        }, 1000);
        if (bouncePlayer) {
            Matter.Body.applyForce(this.player2.body, { x: this.player2.body.position.x, y: this.player2.body.position.y }, { x: 0, y: -0.4 });
        }
        this.removeSprite(ram);
        let forcex = -2.5;


        for (let i = 0; i < 5; i++) {
            const coin = new Coin(this.engine, ram.x, ram.y, 'static', false);
            this.addSprite(coin);
            coin.body.isStatic = false;
            Matter.Body.setStatic(coin.body, false);
            Matter.Body.setVelocity(coin.body, { x: forcex, y: -5.3 });
            forcex += .05;
        }
        PubSub.getInstance().publish('eli-popup', {
            message: `Nice Move!!!
Don't let those old school warranty guys stick it to you. 
            `});
    }

    killSpikeBall(spikeBall, bouncePlayer = true) {
        playSound('die-1');
        const deadSpikeBall = document.createElement('lottie-player');

        (deadSpikeBall as any).src = 'https://lottie.host/46d6333d-4d6c-4262-b500-e610f0526b15/u9eqjJU5zx.json';
        deadSpikeBall.style.position = 'absolute';
        deadSpikeBall.style.left = `${spikeBall.x - 125}px`;
        deadSpikeBall.style.top = `${spikeBall.y - 125}px`;
        deadSpikeBall.style.height = '200px';
        deadSpikeBall.style.width = '200px';
        deadSpikeBall.setAttribute('autoplay', '1');

        document.getElementById('game-div').appendChild(deadSpikeBall);

        setTimeout(() => {
            deadSpikeBall.parentNode.removeChild(deadSpikeBall);
        }, 1000);
        if (bouncePlayer) {
            Matter.Body.applyForce(this.player2.body, { x: this.player2.body.position.x, y: this.player2.body.position.y }, { x: 0, y: -0.4 });
        }
        this.removeSprite(spikeBall);
        let forcex = -2.5;

        for (let i = 0; i < 5; i++) {
            const coin = new Coin(this.engine, spikeBall.x, spikeBall.y, 'static', false);
            this.addSprite(coin);
            coin.body.isStatic = false;
            Matter.Body.setStatic(coin.body, false);
            Matter.Body.setVelocity(coin.body, { x: forcex, y: -5.3 });
            forcex += .05;
        }
        PubSub.getInstance().publish('eli-popup', {
            message: `Nice Move!!!
Don't let those old school warranty guys stick it to you. 
            `});
    }

    // 

    advance() {
        if (this.showQuestBegin) {
            return;
        }

        if (this.isJoystickLeft && !this.joystickState.left) {

            this.isJoystickLeft = false;
            this.player2.accelerating = false;
            this.player2.arrowLeft = false;
            this.player2.stopMomentum();
        }
        if (this.isJoystickRight && !this.joystickState.right) {
            this.player2.accelerating = false;
            this.player2.arrowRight = false;
            this.player2.stopMomentum();
            this.isJoystickRight = false;
        }
        if (this.joystickState.left) {
            this.player2.accelerating = true;
            this.player2.arrowLeft = true;
            this.isJoystickLeft = true;
        }
        if (this.joystickState.right) {
            this.player2.accelerating = true;
            this.player2.arrowRight = true;
            this.isJoystickRight = true;
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
        this.checkTime();
        for (const sprite of this.gameSprites) {
            sprite.advance();
        }

        if (this.playerTop > 1000) {
            this.loseLife();
        }

        this.shopEntranceAvailable = this.playerLeft >= Game.applianceShopLeft && this.playerLeft <= Game.applianceShopAreaRight && !this.fridge;

        if (this.questShown) {
            for (const cannon of this.cannons) {

                if (cannon.fire()) {
                    setTimeout(() => {

                        const cannonBall = new CannonBall(this.engine, cannon.x - 100, cannon.y - 20);
                        this.addSprite(cannonBall);

                        cannonBall.timeout = setTimeout(() => {
                            this.removeSprite(cannonBall);
                        }, 4000);
                    }, 600);
                }
            }
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
            this.doWin();
            this.gameHUD = new GameHUD(this.zone);
        }

        const collisions = Matter.Detector.collisions(this.engine.world);
        const playerCollisions = collisions.filter(i => i.bodyA.label === 'Player' || i.bodyB.label === 'Player');

        const groundCollision = playerCollisions.find(i => i.bodyA.label === 'Ground' || i.bodyB.label === 'Ground');

        //const riserColliesions = collisions.filter(i=>i.bodyA.label === 'riser' || i.bodyB.label === 'riser');



        delete this.player2.groundSprite;
        if (groundCollision && groundCollision.collided) {
            this.player2.isGrounded = true;
            this.player2.lastGroundedTime = new Date();
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
                    this.playCollectTool();
                    break;
                case 'saw':
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


        for (const collision of impactCollisions) {

            let forceY = (this.bounceCount + 1) * -0.1;
            this.bounceCount++;
            if (forceY < -0.6) {
                forceY = -0.6;
            }
            const label = collision.bodyA.label === 'Player' ? collision.bodyB.label : collision.bodyA.label;

            switch (label) {
                case 'dynamite':

                    const dynamite: Dynamite = this.gameSprites.find(i => (i.body === collision.bodyA || i.body === collision.bodyB) && i !== this.player2);
                    if (dynamite) {

                        if (dynamite.play()) {

                            playSound('warning-sound');

                            setTimeout(() => {
                                pauseSound('warning-sound');
                                playSound('explosion-sound');
                            }, 1800);
                            setTimeout(() => {
                                const diffX = this.playerLeft - dynamite.x;
                                const diffY = this.playerTop - dynamite.y;
                                if (diffX < 600 && diffX > -700) {
                                    if (diffY < 600 && diffY > -600) {
                                        PubSub.getInstance().publish('eli-popup', {
                                            message: `They gotcha!!
Overseas call centers, long hold times, and nasty surprises hiding in the fine print. 
                                            `});
                                        this.loseLife();
                                    }
                                }

                                let multiplier = 1;
                                for (let i = 0; i < 5; i++) {
                                    const coin = new Coin(this.engine, dynamite.x, dynamite.y, 'static', false);

                                    this.addSprite(coin);
                                    coin.body.isStatic = false;
                                    Matter.Body.setStatic(coin.body, false);
                                    Matter.Body.setVelocity(coin.body, { x: 0.1 * multiplier, y: -5.3 });
                                    multiplier *= -1;
                                }
                                this.removeSprite(dynamite);
                            }, 2000);
                        }
                    }
                    break;
                case 'fire-vent':
                    const fireVent: FireVent = this.gameSprites.find(i => (i.body === collision.bodyA || i.body === collision.bodyB) && i !== this.player2);
                    if (fireVent.firing) {
                        this.loseLife();
                    }
                    break;
            }

            if (collision.penetration.y < 0) {
                switch (label) {
                    case 'trampoline':
                        if (new Date().getTime() - this.lastBounce.getTime() > 500) {
                            Matter.Body.applyForce(this.player2.body, { x: this.player2.body.position.x, y: this.player2.body.position.y }, { x: 0, y: Config.getInstance().trampolineYForce });

                            playSound('bounce-sound');
                            const sprite = this.gameSprites.find(i => (i.body === collision.bodyA || i.body === collision.bodyB) && i !== this.player2);
                            if (sprite) {
                                sprite.play();
                            }
                        }
                        break;
                    case 'spike-brick':
                        this.loseLife();
                        break;
                    case 'Ram':
                        const ram = this.gameSprites.find(i => (i.body === collision.bodyA || i.body === collision.bodyB) && i !== this.player2);
                        if (ram) {
                            this.killRam(ram);
                        }
                        break;
                    case 'cannon-ball':
                        const cannonBall = this.gameSprites.find(i => (i.body === collision.bodyA || i.body === collision.bodyB) && i !== this.player2);
                        if (cannonBall) {
                            playSound('kill-enemy-sound');
                            Matter.Body.applyForce(this.player2.body, { x: this.player2.body.position.x, y: this.player2.body.position.y }, { x: 0, y: -0.6 });
                            this.removeSprite(cannonBall);
                            for (let i = 0; i < 6; i++) {
                                this.gameHUD.incrementCoinCount();
                            }
                            PubSub.getInstance().publish('eli-popup', {
                                message: `Nice Move!!!
Don't let those old school warranty guys stick it to you. 
                                `});
                        }
                        break;
                    case 'Mystery':
                    case 'mystery-top':
                    case 'brick-top':
                    case 'Brick':
                    case 'log-short':
                    case 'jet-pack-mystery-block':
                    case 'flame-thrower-mystery-block':
                    case 'i-beam':
                    case 'log':
                    case 'Ice':
                    case 'cannon':
                    case 'riser':
                    case 'solid-block':
                        this.player2.isGrounded = true;
                        this.player2.groundSprite = this.gameSprites.find(i => (
                            i.body === collision.bodyA
                            || i.frictionBody === collision.bodyA
                            || i.frictionBody === collision.bodyB
                            || i.body === collision.bodyB) && i !== this.player2);

                        //console.log('grounding');
                        this.player2.lastGroundedTime = new Date();
                        if (label != 'Ice') {
                            if (!this.player2.accelerating) {
                                this.player2.stopMomentum();
                            }
                        }
                        break;
                }

            } else if (Math.abs(collision.penetration.x) > 0) {

                switch (label) {
                    case 'Ram':
                        this.loseLife();
                        PubSub.getInstance().publish('eli-popup', {
                            message: `Noooooo!!
                The goat coveres everything, but only up to a certain amount.  The overage could leave you roasting on a spit.
                            `});
                        break;
                    case 'cannon-ball':
                        const cannonBall = this.gameSprites.find(i => (i.body === collision.bodyA || i.body === collision.bodyB) && i !== this.player2);
                        this.removeSprite(cannonBall);
                        this.loseLife();
                        PubSub.getInstance().publish('eli-popup', {
                            message: `Doh!
You're a target of the old school home warranty guys, and they got you. 
                            `});
                        break;

                }
            }
            if (collision.penetration.y > 0) {
                const label = collision.bodyA.label === 'Player' ? collision.bodyB.label : collision.bodyA.label;
                const otherSprite = this.gameSprites.find(i => (i.body === collision.bodyA || i.body === collision.bodyB) && i !== this.player2);
                switch (label) {
                    case 'brick-top':
                    case 'Brick':
                        otherSprite?.breakIt();
                        this.removeSprite(otherSprite);
                        break;
                    case 'jet-pack-mystery-block':
                    case 'Mystery':
                    case 'flame-thrower-mystery-block':
                    case 'mystery-top':
                        if (otherSprite && !otherSprite.empty && otherSprite.emptyIt) {
                            otherSprite.emptyIt();
                            if (label === 'jet-pack-mystery-block') {
                                this.playCollectTool();

                            } else if (label === 'flame-thrower-mystery-block') {
                                this.playCollectTool();

                            } else {
                                this.gameHUD.incrementCoinCount();

                            }
                        }
                        break;
                    case 'ceiling-spike':
                        this.loseLife();
                        break;
                }
            }
        }

        const enemyCollisions = playerCollisions.filter(i => this.enemyLabels.indexOf(i.bodyA.label) > -1 || this.enemyLabels.indexOf(i.bodyB.label) > -1);
        if (enemyCollisions.length > 0) {
            this.loseLife();
            for (const collision of enemyCollisions) {
                const label = collision.bodyA.label === 'Player' ? collision.bodyB.label : collision.bodyA.label;
                switch (label) {
                    case 'spike-ball':
                        this.pubSub.publish('eli-popup', {
                            message: `Owwww!! Look out for those guys.
Check the fine print. Unlimited is not unlimited when there are out of pocket costs.
                            ` });
                        break;
                }
            }
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
        const flameCollisions = collisions.filter(i => i.bodyA.label === 'flame-body' || i.bodyB.label === 'flame-body');
        const flameEnemyCollisions = flameCollisions.filter(i => this.flameTargetLabels.indexOf(i.bodyA.label) > -1 || this.flameTargetLabels.indexOf(i.bodyB.label) > -1);
        if (flameEnemyCollisions?.length > 0) {
            for (const collision of flameEnemyCollisions) {
                const other = collision.bodyA.label === 'flame-body' ? collision.bodyB : collision.bodyA;
                const label = collision.bodyA.label === 'flame-body' ? collision.bodyB.label : collision.bodyA.label;
                const otherGameSprite = this.gameSprites.find(i => i.body === other);
                switch (label) {
                    case 'Ram':
                        this.killRam(otherGameSprite, false);
                        break;
                    case 'dynamite':
                        if (!otherGameSprite.playing) {
                            let multiplier = 1;
                            for (let i = 0; i < 5; i++) {
                                const coin = new Coin(this.engine, otherGameSprite.x, otherGameSprite.y, 'static', false);

                                this.addSprite(coin);
                                coin.body.isStatic = false;
                                Matter.Body.setStatic(coin.body, false);
                                Matter.Body.setVelocity(coin.body, { x: 0.1 * multiplier, y: -5.3 });
                                multiplier *= -1;
                            }
                            this.removeSprite(otherGameSprite);
                            playSound('kill-enemy-sound');
                            PubSub.getInstance().publish('eli-popup', {
                                message: `Nice Move!!!
    Don't let those old school warranty guys stick it to you. 
                                `});
                        }
                        break;
                    case 'spike-ball':
                        this.killSpikeBall(otherGameSprite, false);
                        break;
                    case 'cannon-ball':

                        if (otherGameSprite) {
                            playSound('kill-enemy-sound');
                            this.removeSprite(otherGameSprite);
                            for (let i = 0; i < 6; i++) {
                                this.gameHUD.incrementCoinCount();
                            }
                        }
                        break;
                    default:
                        this.removeSprite(otherGameSprite);
                        playSound('kill-enemy-sound');
                        PubSub.getInstance().publish('eli-popup', {
                            message: `Nice Move!!!
Don't let those old school warranty guys stick it to you. 
                            `});
                }
            }
        }
    }

    loseLife() {
        if (this.editorOpen) {
            return;
        }
        const leftPosition = 150;
        this.player2.domObject.style.visibility = 'hidden';
        this.player2.x = leftPosition;
        this.player2.dead = true;
        this.player2.y = World.getInstance().height;
        Matter.Body.setPosition(this.player2.body, { x: this.player2.x, y: 0 });
        Matter.Body.setVelocity(this.player2.body, { x: 0, y: 0 });
        playSound('die-sound');
        this.gameHUD.isJetPackMode = false;
        this.gameHUD.isFlameThrower = false;
        PubSub.getInstance().publish('jet-pack-change');
        PubSub.getInstance().publish('flame-thrower-change');
        this.player2.die();

        const playerDying = document.createElement('div');
        playerDying.className = 'player-dying';
        playerDying.innerHTML = `<lottie-player style="transform: translateY(-50px)" autoplay="true" background="transparent" src="https://lottie.host/c71ebcd7-f1bc-47ba-9bdf-ebbf755f6f5a/crc0oSYsEC.json"></lottie-player>`;
        playerDying.style.left = (this.playerLeft - 16) + 'px';
        playerDying.style.top = (this.playerTop + 43) + 'px';
        document.getElementById('game-div').appendChild(playerDying);

        setTimeout(() => {
            this.player2.domObject.style.visibility = 'visible';
            this.player2.domObject.style.left = "0px";
            this.player2.domObject.style.bottom = `${World.getInstance().height}px`;
            this.player2.x = leftPosition;
            this.player2.y = World.getInstance().height;
            Matter.Body.setPosition(this.player2.body, { x: leftPosition, y: 50 });
            Matter.Body.setVelocity(this.player2.body, { x: 0, y: 0 });
            if (this.player2.x < 0) {
                this.player2.x = leftPosition;
                Matter.Body.setPosition(this.player2.body, { x: leftPosition, y: 50 });
                Matter.Body.setVelocity(this.player2.body, { x: 0, y: 0 });
            }
        }, 2500);
        setTimeout(() => {
            this.player2.dead = false;
        }, 3000)
        setTimeout(() => {
            playerDying.parentNode.removeChild(playerDying);
            document.getElementById('game-div').classList.add('reset');
            document.getElementById('bottom-filler').classList.add('reset');
            document.getElementById('bg-buildings').classList.add('reset');
            document.getElementById('bg-plants').classList.add('reset');
            document.getElementById('bg-sky').classList.add('reset');

            document.getElementById('game-div').style.left = '0px';
            document.getElementById('bg-buildings').style.left = '0px';
            document.getElementById('bg-plants').style.left = '0px';
            document.getElementById('bg-sky').style.left = '0px';
            document.getElementById('bottom-filler').style.left = '0px';

            setTimeout(() => {
                document.getElementById('game-div').classList.remove('reset');
                document.getElementById('bg-buildings').classList.remove('reset');
                document.getElementById('bg-plants').classList.remove('reset');
                document.getElementById('bg-sky').classList.remove('reset');
                document.getElementById('bottom-filler').classList.add('reset');

            }, 2000);

        }, 3000);



        const gamepad = navigator.getGamepads()[0];
        if (gamepad) {
            if (gamepad.vibrationActuator) {
                gamepad.vibrationActuator.playEffect("dual-rumble", {
                    startDelay: 0,
                    duration: 750,
                    weakMagnitude: 0.5,
                    strongMagnitude: 1,
                }).then(() => { }).catch((err) => { });
            }
        }
    }


    addSprite(sprite) {
        this.gameSprites.push(sprite);
        if (sprite.domObject) {
            const div = document.getElementById('game-div');
            if (div) {
                div.appendChild(sprite.domObject);
                sprite.domObject.classList.add('sprite');
            }
        }
    }


    lastPlantsCenter = new Date();
    lastBuildingsCenter = new Date();
    lastSkyCenter = new Date();
    lastPlantsLeft: number;
    lastBuildingsLeft: number = 0;

    centerPlayer() {
        const windowWidth = window.innerWidth;
        const worldWidth = this.world.width;
        const playerLeft = this.player2.x + (this.player2.width / 2);

        if (playerLeft > windowWidth / 2 && playerLeft < (worldWidth - (windowWidth / 2))) {

            const lastPlantsDiff = new Date().getTime() - this.lastPlantsCenter.getTime();
            const lastBuildingsDiff = new Date().getTime() - this.lastBuildingsCenter.getTime();
            const lastSkyDiff = new Date().getTime() - this.lastSkyCenter.getTime();

            const x = windowWidth - playerLeft;
            const offset = windowWidth / 2 - x;

            if (!document.getElementById('game-div')) {
                return;
            }
            document.getElementById('game-div').style.left = -offset + 'px';


            const plantsLeft = -(offset * .5);
            if (this.lastPlantsLeft != Math.floor(plantsLeft) && Config.getInstance().scrollBackground) {
                document.getElementById('bg-plants').style.left = plantsLeft + 'px';
                this.lastPlantsLeft = Math.floor(plantsLeft);
            }

            const buildingsLeft = -offset * .1;
            if (Math.abs(this.lastBuildingsLeft - Math.floor(buildingsLeft)) > 2 && Config.getInstance().scrollBackground) {
                document.getElementById('bg-buildings').style.left = buildingsLeft + 'px';
                this.lastBuildingsLeft = Math.floor(buildingsLeft);
            }

            if (lastBuildingsDiff > 200) {

                this.lastBuildingsCenter = new Date();
            }
            if (lastSkyDiff > 200 && Config.getInstance().scrollBackground) {

                document.getElementById('bg-sky').style.left = -(offset * .01) + 'px';
                this.lastSkyCenter = new Date();
            }
            this.world.scrollPosition = offset;

        }
    }

    showEliPopup(message: string) {
        this.pubSub.publish('eli-popup', { message });
    }

    removeSprite(sprite) {
        // Not sure why this is happening sometimes, not reproduceable
        if (!sprite) {
            console.error('NO SPRITE')
            return;
        }
        if ((sprite as any).timeout) {
            clearTimeout((sprite as any).timeout);
        }
        if (sprite.body) {
            Matter.Composite.remove(this.engine.world, sprite.body)
        }
        if (sprite.frictionTop) {
            Matter.Composite.remove(this.engine.world, sprite.frictionTop)
        }
        this.gameSprites.splice(this.gameSprites.indexOf(sprite), 1);
        if (sprite.domObject?.parentNode) {
            sprite.domObject.parentNode.removeChild(sprite.domObject);
        }
    }

    start() {
        this.gameStartTime = new Date();
    }

    running = true;
    stop() {

        this.running = false;
        clearInterval(this.internval);
        clearInterval(this.advanceInterval);
        pauseSound('flame-thrower')
        delete this.joystickState;
    }

    doLost() {
        PubSub.getInstance().publish('game-lost');
        playSound('game-over-lost-sound');
        this.stop();

    }

    warningStarted = false;

    checkTime() {
        const now = new Date();
        let remainingSeconds = Config.getInstance().gameSeconds - (now.getTime() - this.gameStartTime.getTime()) / 1000;
        if (remainingSeconds < 0 && !this.editorOpen && this.gameHUD.timerStarted) {
            remainingSeconds = 0;
            this.doLost();
        }
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = Math.floor(remainingSeconds % 60);
        this.zone.run(() => {
            this.remaining = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        });
        if (this.gameHUD) {
            this.gameHUD.timeRunningOut = remainingSeconds < 11;
            this.gameHUD.setTimeRemaining(this.remaining);
            if (!this.warningStarted && this.gameHUD.timeRunningOut && this.gameHUD.timerStarted) {
                playSound('warning-sound-game-end');
                this.warningStarted = true;
            }
        }


    }
}

export class GameHUD {
    isJetPackMode: any;
    isFlameThrower: boolean;

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
    timeRunningOut = false;

    startTimer() {
        this.timerStarted = true;
    }

    get hasAllTools() {
        return this.hasWrench && this.hasSaw && this.hasHammer && this.hasScrewdriver && this.hasDrill;
    }


    get money() {
        return this._coinCount * 20;
    }

    setTimeRemaining(value: string) {
        this.zone.run(() => this.timeRemaining = value);
    }

    incrementCoinCount() {
        playSound('chime');
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