declare var Matter: any;
var Engine = Matter.Engine,
    MatterWorld = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite;

import { ToolBarComponent } from '../components/tool-bar/tool-bar.component';
import { pauseSound, playSound } from '../utilities/sound-utils';
import { Config } from './config';
import { GameInstanceManager } from './game-instance';
import { GameSprite } from './game-sprite';
import { PubSub } from './pub-sub';

export class Player2 extends GameSprite {
    //keyboardHandler;
    runFrame = 0;
    applyingLeft = false;
    applyingRight = false;
    frameDelay = 0;
    groundSprite;
    moveSprite = false;
    pubsub;
    isGrounded = false;
    subscriptionEvents: any;
    lottieId = ToolBarComponent.newid();
    flameThrowerId = ToolBarComponent.newid();
    accelerating = false;
    dead: boolean;
    flameBody: any;
    flameBodyWidth = 550;
    //currentFlameWidth = 10;


    constructor(private engine, x, y, width, height) {
        super(engine, x, y, width, height);
        this.moveSprite = true;
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';
        playerDiv.style.position = 'absolute';
        this.domObject = playerDiv;
        this.body.label = 'Player';
        this.pubsub = PubSub.getInstance();
        this.body.staticFriction = 20;

        //
        playerDiv.innerHTML = `<lottie-player class="flame-gun"id="${this.flameThrowerId}" background="transparent" src="https://lottie.host/ab0aa70b-3019-4335-ba89-1d016e62a34d/5UXBaLgqpl.json"></lottie-player><lottie-player  style="transform: translateY(80px) translateX(-21px) scale(2); "  id="${this.lottieId}" background="transparent" src="https://lottie.host/ce873636-1d89-4e51-b903-4e458339ea12/Hdnd2ezUkH.json"></lottie-player>`

        this.subscriptionEvents = this.pubsub.subscribe('keydown', key => {
            if (key.code === 'Space' && this.isGrounded && !GameInstanceManager.getInstance().dialogOpen) {
                Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: 0 });
                let upForce = -0.32;
                Matter.Body.applyForce(this.body, { x: this.body.position.x, y: this.body.position.y }, { x: 0, y: upForce });
                this.isGrounded = false;
                delete this.groundSprite;

            }
        });
    }

    flameThrowerSetup = false;
    flaming = false;
    flameTimeout: any;
    runFlameThrower() {
        clearTimeout(this.flameTimeout);
        if(this.flaming) {
            this.flameTimeout = setTimeout(() => this.stopFlameThrower(), 750);
            playSound('flame-thrower', 1);
            return;
        }

        setTimeout(()=> {
            if (!this.flameBody) {
                this.flameBody = Bodies.rectangle(this.body.position.x, this.body.position.y, this.flameBodyWidth, 70);
                Matter.Body.set(this.flameBody, 'isSensor', true);
                this.flameBody.label = 'flame-body';
                Composite.add(this.engine.world, [this.flameBody]);
                playSound('flame-thrower', 1);
            }

        }, 500);

        const player = (document.getElementById(this.flameThrowerId) as any);
        player.seek(0);
        player.play();
        player.direction = 1;
        player.setDirection(1);
        if (!this.flameThrowerSetup) {
            player.addEventListener('complete', () => {
                if (this.flaming) {
                    player.seek(6);
                    player.play();
                }
            });
            this.flameThrowerSetup = true;
        }
        this.flaming = true;
        this.flameTimeout = setTimeout(() => this.stopFlameThrower(), 750);

    }



    stopFlameThrower() {
        pauseSound('flame-thrower');
        this.flaming = false;
        const player = (document.getElementById(this.flameThrowerId) as any);
        player.stop();
        player.setDirection(-1);
        player.seek(6);
        player.play();
        if (this.flameBody) {
            Matter.Composite.remove(this.engine.world, this.flameBody);
            delete this.flameBody;
        }
    }

    toggleFlameThrower() {
        if (this.flaming) {
            this.stopFlameThrower();
        } else {
            this.runFlameThrower();
        }
    }

    jump() {
        if ((this.isGrounded || GameInstanceManager.getInstance().gameHUD?.isJetPackMode) && !GameInstanceManager.getInstance().dialogOpen) {
            Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: 0 });
            let upForce = Config.getInstance().playerJumpForce;
            Matter.Body.applyForce(this.body, { x: this.body.position.x, y: this.body.position.y }, { x: 0, y: upForce });
            this.isGrounded = false;
            delete this.groundSprite;
            if (GameInstanceManager.getInstance().gameHUD?.isJetPackMode) {
                playSound('thrust-sound', .3);

                const player = (document.getElementById(this.lottieId) as any);
                if (player) {
                    player.seek(0);
                    player.play();
                }
            } else {
                playSound('jump-sound', .3);
            }
        }
    }

    die() {
        (document.getElementById(this.lottieId) as any).stop();
    }

    stickyX;
    stickyY;
    isMoving = false;
    arrowRight = false;
    arrowLeft = false;
    lastAcceleration: number;
    frameCount = 13;

    stopMomentum() {
        if (this.isGrounded) {
            if (!this.groundSprite || this.groundSprite.objectType !== 'Ice') {
                Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
            }
        }
    }

    override advance() {
        if (Math.abs(this.body.velocity.x) > 0.01) {
            this.domObject.classList.remove('standing');
        } else {
            this.domObject.classList.add('standing');
        }
        if (GameInstanceManager.getInstance().dialogOpen || this.dead) {
            return;
        }

        this.isMoving = (this.arrowRight || this.arrowLeft) && this.isGrounded;

        let isGrounded = Math.abs(this.body.velocity.y) < 0.1;
        this.lastAcceleration = isGrounded ? Config.getInstance().playerMoveForceGrounded : Config.getInstance().playerMoveForceNotGrounded;

        if (this.arrowRight && this.body.velocity.x < Config.getInstance().playerMaxXVelocity) {

            Matter.Body.applyForce(this.body, { x: this.body.position.x, y: this.body.position.y }, { x: this.lastAcceleration, y: 0 });
            this.domObject.style.transform = 'scaleX(1)';
            this.applyingLeft = false;
            this.applyingRight = true;
        }
        if (this.arrowLeft && this.body.velocity.x > -Config.getInstance().playerMaxXVelocity) {
            Matter.Body.applyForce(this.body, { x: this.body.position.x, y: this.body.position.y }, { x: -this.lastAcceleration, y: 0 });
            this.domObject.style.transform = 'scaleX(-1)';
            this.applyingRight = false;
            this.applyingLeft = true;
        }
        if (this.isMoving) {
            this.frameDelay += 1;
            if (this.frameDelay === 10) {
                this.runFrame += 1;
                if (this.runFrame >= this.frameCount) {
                    this.runFrame = 0;
                }
                this.frameDelay = 0;
            }
        }
        if (this.groundSprite?.objectType === 'Log') {
            if (!this.stickyX) {
                this.stickyX = this.body.position.x - this.groundSprite?.body.position.x;
            } else {
                if (!this.arrowLeft && !this.arrowRight) {
                    Matter.Body.setPosition(this.body, { x: this.groundSprite.body.position.x + this.stickyX, y: this.body.position.y });
                } else {
                    delete this.stickyX;
                }
            }
        } else {
            delete this.stickyX;
        }
        super.advance();
        if (this.groundSprite?.objectType === 'ShortLog') {
            Matter.Body.setPosition(this.body, { x: this.body.position.x, y: this.groundSprite.body.position.y - this.groundSprite.height });
            this.isGrounded = true;
        }
        this.domObject.style.backgroundPositionX = (this.runFrame * -72) + 'px';
        if (this.flameBody) {
            let x = this.body.position.x;
            const flameWidth = Math.abs(this.flameBody.bounds.min.x - this.flameBody.bounds.max.x);
            if (this.applyingLeft) {
                x -= (flameWidth / 2);
            } else {
                x += flameWidth / 2;
            }

            Matter.Body.setPosition(this.flameBody, { x: x, y: this.body.position.y + 20 });
        }
    }
}