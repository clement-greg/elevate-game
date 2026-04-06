export type AnimationState = 'idle' | 'run' | 'block' | 'punched' | 'kick' | 'punch' | 'win' | 'die' | 'jump' | 'bow' | 'bow2';

export interface SpriteConfig {
  image: HTMLImageElement;
  cols: number;
  rows: number;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
}

export interface FighterConfig {
  name: string;
  spriteBasePath: string;
  facingRight: boolean;
  x: number;
  y: number;
}

const ANIMATION_SPEEDS: Record<AnimationState, number> = {
  idle: 80,
  run: 22,
  block: 60,
  punched: 50,
  kick: 10,
  punch: 10,
  win: 70,
  die: 80,
  jump: 50,
  bow: 55,
  bow2: 55,
};

// Animations that play once and don't loop
const ONE_SHOT_ANIMS: AnimationState[] = ['punch', 'kick', 'punched', 'jump', 'die', 'bow', 'bow2'];

export class Fighter {
  name: string;
  x: number;
  y: number;
  width = 240;
  height = 340;
  facingRight: boolean;
  health = 100;
  maxHealth = 100;
  spriteNaturallyFacesRight = true; // false if sprite naturally faces left

  velocityX = 0;
  velocityY = 0;
  isGrounded = true;
  gravity = 0.8;
  jumpForce = -26;
  moveSpeed = 12;
  groundY: number;

  state: AnimationState = 'idle';
  private previousState: AnimationState = 'idle';
  sprites: Map<AnimationState, SpriteConfig> = new Map();
  private currentFrame = 0;
  private lastFrameTime = 0;
  private animationComplete = false;
  isAttacking = false;
  isBlocking = false;
  isControllable = true;
  private hitRegistered = false;

  // Attack hitbox
  attackRange = 110;
  attackDamage = 8;
  kickDamage = 12;

  // Knockback
  knockbackVelocity = 0;
  knockbackFriction = 0.85;

  constructor(config: FighterConfig) {
    this.name = config.name;
    this.x = config.x;
    this.y = config.y;
    this.groundY = config.y;
    this.facingRight = config.facingRight;
  }

  async loadSprites(): Promise<void> {
    const states: AnimationState[] = ['idle', 'run', 'block', 'punched', 'kick', 'punch', 'win', 'die', 'jump', 'bow', 'bow2'];
    const prefix = this.name.toLowerCase();
    const basePath = `assets/images/animation-packs/${prefix}`;

    const promises = states.map(async (state) => {
      const img = new Image();
      const filename = state === 'bow2' ? 'bow-2' : state;
      img.src = `${basePath}/${filename}.png`;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load ${img.src}`));
      });

      // Determine grid: kick and punch are 5x5, rest are 6x6
      // For Jimmy punched is 5x5, for Bill punched is 6x6
      let cols: number;
      let rows: number;
      if (state === 'kick' || state === 'punch') {
        cols = 5;
        rows = 5;
      } else if (state === 'punched' && prefix === 'jimmy') {
        cols = 5;
        rows = 5;
      } else {
        cols = 6;
        rows = 6;
      }
      // bow is 6x6 for both characters

      const frameWidth = img.width / cols;
      const frameHeight = img.height / rows;

      this.sprites.set(state, {
        image: img,
        cols,
        rows,
        frameWidth,
        frameHeight,
        totalFrames: cols * rows,
      });
    });

    await Promise.all(promises);
  }

  setState(newState: AnimationState) {
    if (this.state === 'die') return; // Dead stays dead
    if (newState === this.state) return;

    this.previousState = this.state;
    this.state = newState;
    this.currentFrame = 0;
    this.lastFrameTime = 0;
    this.animationComplete = false;
    this.hitRegistered = false;

    this.isAttacking = newState === 'punch' || newState === 'kick';
    this.isBlocking = newState === 'block';
  }

  forceState(newState: AnimationState) {
    this.previousState = this.state;
    this.state = newState;
    this.currentFrame = 0;
    this.lastFrameTime = 0;
    this.animationComplete = false;
    this.hitRegistered = false;
    this.isAttacking = newState === 'punch' || newState === 'kick';
    this.isBlocking = newState === 'block';
  }

  update(timestamp: number, canvasWidth: number) {
    // Always update animation frames regardless of controllability
    this.updateAnimation(timestamp);

    if (!this.isControllable && this.state !== 'win' && this.state !== 'die' && this.state !== 'idle') {
      return;
    }

    // Apply knockback
    if (Math.abs(this.knockbackVelocity) > 0.5) {
      this.x += this.knockbackVelocity;
      this.knockbackVelocity *= this.knockbackFriction;
    } else {
      this.knockbackVelocity = 0;
    }

    // Apply gravity
    if (!this.isGrounded) {
      this.velocityY += this.gravity;
      this.y += this.velocityY;
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.velocityY = 0;
        this.isGrounded = true;
        if (this.state === 'jump') {
          this.setState('idle');
        }
      }
    }

    // Horizontal movement during run or jump
    if ((this.state === 'run' || this.state === 'jump') && this.isControllable) {
      this.x += this.velocityX;
    }

    // Clamp position to canvas
    const margin = this.width / 2 - 40;
    this.x = Math.max(margin, Math.min(canvasWidth - margin, this.x));
  }

  private updateAnimation(timestamp: number) {
    const sprite = this.sprites.get(this.state);
    if (!sprite) return;

    const speed = ANIMATION_SPEEDS[this.state];
    if (timestamp - this.lastFrameTime >= speed) {
      this.lastFrameTime = timestamp;
      this.currentFrame++;

      if (this.currentFrame >= sprite.totalFrames) {
        if (ONE_SHOT_ANIMS.includes(this.state)) {
          this.currentFrame = sprite.totalFrames - 1;
          this.animationComplete = true;
          if (this.state === 'punch' || this.state === 'kick') {
            this.isAttacking = false;
            this.setState('idle');
          } else if (this.state === 'punched') {
            this.setState('idle');
          } else if (this.state === 'jump') {
            this.setState('idle');
          } else if (this.state === 'bow' || this.state === 'bow2') {
            // bow stays at last frame until manually changed
          }
          // 'die' stays at last frame
        } else {
          this.currentFrame = 0;
        }
      }
    }
  }

  isAnimationComplete(): boolean {
    return this.animationComplete;
  }

  canBeHit(): boolean {
    return this.state !== 'die' && this.state !== 'block' && !this.hitRegistered;
  }

  markHitRegistered() {
    this.hitRegistered = true;
  }

  hasHitRegistered(): boolean {
    return this.hitRegistered;
  }

  // Returns true when the attack animation is at the impact frame
  isAtImpactFrame(): boolean {
    if (!this.isAttacking) return false;
    const sprite = this.sprites.get(this.state);
    if (!sprite) return false;
    // Impact occurs around frame 10-15 (mid-animation)
    const impactFrame = Math.floor(sprite.totalFrames * 0.4);
    return this.currentFrame >= impactFrame && this.currentFrame <= impactFrame + 3;
  }

  jump() {
    if (this.isGrounded && this.state !== 'die') {
      this.isGrounded = false;
      this.velocityY = this.jumpForce;
      this.setState('jump');
    }
  }

  applyKnockback(direction: number, force: number = 15) {
    this.knockbackVelocity = direction * force;
  }

  takeDamage(amount: number) {
    if (this.isBlocking) {
      amount = Math.floor(amount * 0.15); // Block reduces damage by 85%
    }
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.setState('die');
    } else if (!this.isBlocking) {
      this.setState('punched');
    }
  }

  getHitbox(): { left: number; top: number; right: number; bottom: number } {
    return {
      left: this.x - this.width / 2,
      top: this.y - this.height / 2,
      right: this.x + this.width / 2,
      bottom: this.y + this.height / 2,
    };
  }

  /** Returns the actual visual direction the fighter is facing */
  get visuallyFacingRight(): boolean {
    if (this.spriteNaturallyFacesRight) {
      return this.facingRight;
    }
    return !this.facingRight;
  }

  getAttackHitbox(): { left: number; top: number; right: number; bottom: number } {
    const vRight = this.visuallyFacingRight;
    return {
      left: vRight ? this.x + this.width / 4 : this.x - this.width / 4 - this.attackRange,
      top: this.y - this.height / 3,
      right: vRight ? this.x + this.width / 4 + this.attackRange : this.x - this.width / 4,
      bottom: this.y + this.height / 4,
    };
  }

  draw(ctx: CanvasRenderingContext2D, scale: number = 1) {
    const sprite = this.sprites.get(this.state);
    if (!sprite) return;

    const col = this.currentFrame % sprite.cols;
    const row = Math.floor(this.currentFrame / sprite.cols);

    const sx = col * sprite.frameWidth;
    const sy = row * sprite.frameHeight;

    ctx.save();

    // Flip if facing left
    if (!this.facingRight) {
      ctx.translate(this.x, 0);
      ctx.scale(-1, 1);
      ctx.translate(-this.x, 0);
    }

    // Preserve sprite aspect ratio to avoid distortion
    let targetHeight = this.height * 1.125 * scale;

    // Jimmy's run sprite has a much wider aspect ratio than idle,
    // making him look shorter. Scale up the run height by 5% to compensate.
    let yOffset = 0;
    if (this.state === 'run' && !this.spriteNaturallyFacesRight) {
      const extraHeight = targetHeight * 0.15;
      targetHeight += extraHeight;
      yOffset = -extraHeight / 2; // shift up so feet stay on the ground
    }

    const spriteAspect = sprite.frameWidth / sprite.frameHeight;
    const drawHeight = targetHeight;
    const drawWidth = targetHeight * spriteAspect;

    ctx.drawImage(
      sprite.image,
      sx, sy, sprite.frameWidth, sprite.frameHeight,
      this.x - drawWidth / 2,
      this.y - drawHeight / 2 + yOffset,
      drawWidth,
      drawHeight
    );

    ctx.restore();
  }

  drawHealthBar(ctx: CanvasRenderingContext2D) {
    const barWidth = 80;
    const barHeight = 8;
    const radius = 4;
    const x = this.x - barWidth / 2;
    const y = this.y - this.height * 0.6;

    // Background with rounded rect
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, radius);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fill();

    // Health fill with rounded rect (clip to bar shape)
    const healthPercent = this.health / this.maxHealth;
    let color = '#00ff00';
    if (healthPercent < 0.3) color = '#ff0000';
    else if (healthPercent < 0.6) color = '#ffaa00';

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, radius);
    ctx.clip();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    ctx.restore();

    // Border
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, radius);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Name above bar
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.name.toUpperCase(), x + barWidth / 2, y - 4);
  }
}
