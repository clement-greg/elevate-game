declare var Matter: any;

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
    subscriptionEvents:any;


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

        this.subscriptionEvents =  this.pubsub.subscribe('keydown', key => {
            console.log('11')
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
        if(this.isGrounded && !Game.getInstance().dialogOpen) {
            Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: 0 });
            let upForce = -0.32;
            Matter.Body.applyForce(this.body, { x: this.body.position.x, y: this.body.position.y }, { x: 0, y: upForce });
            this.isGrounded = false;
            delete this.groundSprite;
        }
    }

    stickyX;
    stickyY;
    isMoving = false;
    arrowRight = false;
    arrowLeft = false;
    override advance() {
        if (Game.getInstance().dialogOpen) {
            return;
        }
        this.isMoving = (this.arrowRight || this.arrowLeft) && this.isGrounded;

        const isGrounded = Math.abs(this.body.velocity.y) < 0.1;
        if (this.arrowRight && this.body.velocity.x < 3) {
            let force = isGrounded ? 0.02 : 0.01;
            Matter.Body.applyForce(this.body, { x: this.body.position.x, y: this.body.position.y }, { x: force, y: 0 });
            this.domObject.style.transform = 'scaleX(1)';
            this.applyingLeft = false;
            this.applyingRight = true;
        }
        if (this.arrowLeft && this.body.velocity.x > -3) {
            let force = isGrounded ? -0.02 : -0.01;
            Matter.Body.applyForce(this.body, { x: this.body.position.x, y: this.body.position.y }, { x: force, y: 0 });
            this.domObject.style.transform = 'scaleX(-1)';
            this.applyingRight = false;
            this.applyingLeft = true;
        }
        if (this.isMoving) {
            this.frameDelay += 1;
            if (this.frameDelay === 6) {
                this.runFrame += 1;
                if (this.runFrame >= 12) {
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
        this.domObject.style.backgroundPositionX = (this.runFrame * -this.width) + 'px';
    }
}