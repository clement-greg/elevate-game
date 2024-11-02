declare var Matter: any;

import { ToolBarComponent } from '../components/tool-bar/tool-bar.component';
import { playSound } from '../utilities/sound-utils';
import { Config } from './config';
import { Game } from './game';
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
    accelerating = false;
    dead: boolean;


    constructor(engine, x, y, width, height) {
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
        playerDiv.innerHTML = `<lottie-player  style="transform: translateY(80px) translateX(-21px) scale(2); "  id="${this.lottieId}" background="transparent" src="https://lottie.host/ce873636-1d89-4e51-b903-4e458339ea12/Hdnd2ezUkH.json"></lottie-player>`

        this.subscriptionEvents = this.pubsub.subscribe('keydown', key => {
            if (key.code === 'Space' && this.isGrounded && !Game.getInstance().dialogOpen) {
                Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: 0 });
                let upForce = -0.32;
                Matter.Body.applyForce(this.body, { x: this.body.position.x, y: this.body.position.y }, { x: 0, y: upForce });
                this.isGrounded = false;
                delete this.groundSprite;

            }
        });
    }


    jump() {
        if ((this.isGrounded || Game.getInstance().gameHUD.isJetPackMode) && !Game.getInstance().dialogOpen) {
            Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: 0 });
            let upForce = Config.getInstance().playerJumpForce;
            Matter.Body.applyForce(this.body, { x: this.body.position.x, y: this.body.position.y }, { x: 0, y: upForce });
            this.isGrounded = false;
            delete this.groundSprite;
            if (Game.getInstance().gameHUD.isJetPackMode) {
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
        if (Game.getInstance().dialogOpen || this.dead) {
            return;
        }
        this.isMoving = (this.arrowRight || this.arrowLeft) && this.isGrounded;

        let isGrounded = Math.abs(this.body.velocity.y) < 0.1;
        // if(!this.accelerating) {
        //     this.lastAcceleration = 0.005;
        // } else {
        //     this.lastAcceleration += 0.0005;
        // }
        //if(this.lastAcceleration > (isGrounded ? Config.getInstance().playerMoveForceGrounded : Config.getInstance().playerMoveForceNotGrounded)) {
        this.lastAcceleration = isGrounded ? Config.getInstance().playerMoveForceGrounded : Config.getInstance().playerMoveForceNotGrounded;
        //} 

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
            //this.domObject.classList.remove('standing');
            this.frameDelay += 1;
            if (this.frameDelay === 10) {
                this.runFrame += 1;
                if (this.runFrame >= this.frameCount) {
                    this.runFrame = 0;
                }
                this.frameDelay = 0;
            }
        } else {
            //this.domObject.classList.add('standing');
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


    }
}