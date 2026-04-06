import { Fighter } from './fighter';
import { AIController, Difficulty } from './ai-controller';
import { InputManager, InputState } from './input-manager';

export type GamePhase = 'title' | 'bow' | 'countdown' | 'fight' | 'roundEnd' | 'result';

export interface GameCallbacks {
  onPhaseChange: (phase: GamePhase) => void;
  onCountdownTick: (count: number) => void;
  onMatchEnd: (winner: string) => void;
}

export class FightEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  jimmy: Fighter;
  bill: Fighter;
  private ai: AIController;
  private input: InputManager;
  private animationFrameId = 0;
  private callbacks: GameCallbacks;

  phase: GamePhase = 'title';
  difficulty: Difficulty = 'easy';
  private countdownValue = 3;
  private countdownStartTime = 0;
  private resultTime = 0;
  private roundEndTime = 0;
  private bowStartTime = 0;
  private bowPhase: 1 | 2 = 1;
  private isFirstRound = true;
  winner: string | null = null;

  // Rounds - best of 5 (first to 3)
  jimmyWins = 0;
  billWins = 0;
  private roundWinner: string | null = null;
  private readonly winsNeeded = 3;

  // Background & logos
  private bgImage!: HTMLImageElement;
  private jimmyLogo!: HTMLImageElement;
  private billLogo!: HTMLImageElement;
  private bloodPool!: HTMLImageElement;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.callbacks = callbacks;
    this.input = new InputManager();

    const groundY = canvas.height - 250;

    this.jimmy = new Fighter({
      name: 'Jimmy',
      spriteBasePath: 'assets/images/animation-packs/jimmy',
      facingRight: true,
      x: canvas.width - 200,
      y: groundY,
    });
    this.jimmy.spriteNaturallyFacesRight = false;

    this.bill = new Fighter({
      name: 'Bill',
      spriteBasePath: 'assets/images/animation-packs/bill',
      facingRight: true,
      x: 200,
      y: groundY,
    });

    this.ai = new AIController(this.bill, this.jimmy, this.difficulty);
  }

  async init(): Promise<void> {
    await Promise.all([
      this.jimmy.loadSprites(),
      this.bill.loadSprites(),
      this.loadImage('bg').then(img => this.bgImage = img),
      this.loadImage('jimmyLogo').then(img => this.jimmyLogo = img),
      this.loadImage('billLogo').then(img => this.billLogo = img),
      this.loadImage('bloodPool').then(img => this.bloodPool = img),
    ]);
    this.setPhase('title');
    this.gameLoop(0);
  }

  private loadImage(key: string): Promise<HTMLImageElement> {
    const paths: Record<string, string> = {
      bg: 'assets/images/kill-bill/bg-3.png',
      jimmyLogo: 'assets/images/kill-bill/elevate.png',
      billLogo: 'assets/images/kill-bill/merica-home-warrany.png',
      bloodPool: 'assets/images/kill-bill/blood-pool.png',
    };
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = paths[key];
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load ${paths[key]}`));
    });
  }

  setDifficulty(diff: Difficulty) {
    this.difficulty = diff;
    this.ai.setDifficulty(diff);
  }

  startMatch() {
    this.jimmyWins = 0;
    this.billWins = 0;
    this.roundWinner = null;
    this.isFirstRound = true;
    this.startRound();
  }

  private startRound() {
    this.resetFighters();
    if (this.isFirstRound) {
      this.isFirstRound = false;
      this.setPhase('bow');
      this.bowPhase = 1;
      this.bowStartTime = performance.now();
      this.jimmy.forceState('bow');
      this.bill.forceState('bow');
    } else {
      this.setPhase('countdown');
      this.countdownValue = 3;
      this.countdownStartTime = performance.now();
    }
    this.jimmy.isControllable = false;
    this.bill.isControllable = false;
  }

  private resetFighters() {
    const groundY = this.canvas.height - 250;
    this.jimmy.x = this.canvas.width - 200;
    this.jimmy.y = groundY;
    this.jimmy.groundY = groundY;
    this.jimmy.health = 100;
    this.jimmy.facingRight = true;
    this.jimmy.forceState('idle');
    this.jimmy.velocityX = 0;
    this.jimmy.velocityY = 0;
    this.jimmy.knockbackVelocity = 0;
    this.jimmy.isGrounded = true;

    this.bill.x = 200;
    this.bill.y = groundY;
    this.bill.groundY = groundY;
    this.bill.health = 100;
    this.bill.facingRight = true;
    this.bill.forceState('idle');
    this.bill.velocityX = 0;
    this.bill.velocityY = 0;
    this.bill.knockbackVelocity = 0;
    this.bill.isGrounded = true;

    this.winner = null;
    this.ai = new AIController(this.bill, this.jimmy, this.difficulty);
  }

  private setPhase(phase: GamePhase) {
    this.phase = phase;
    this.callbacks.onPhaseChange(phase);
  }

  private gameLoop = (timestamp: number) => {
    this.update(timestamp);
    this.render(timestamp);
    this.input.savePreviousState();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(timestamp: number) {
    const inputState = this.input.getState();

    switch (this.phase) {
      case 'title':
        this.updateTitle(timestamp, inputState);
        break;
      case 'bow':
        this.updateBow(timestamp);
        break;
      case 'countdown':
        this.updateCountdown(timestamp, inputState);
        break;
      case 'fight':
        this.updateFight(timestamp, inputState);
        break;
      case 'roundEnd':
        this.updateRoundEnd(timestamp);
        break;
      case 'result':
        this.updateResult(timestamp, inputState);
        break;
    }
  }

  private updateTitle(timestamp: number, input: InputState) {
    // Animate fighters in win state during title screen
    this.jimmy.setState('win');
    this.bill.setState('win');
    this.jimmy.update(timestamp, this.canvas.width);
    this.bill.update(timestamp, this.canvas.width);

    if (this.input.isJustPressed(input, 'start') || this.input.isJustPressed(input, 'punch')) {
      this.startMatch();
    }
  }

  private updateBow(timestamp: number) {
    this.jimmy.update(timestamp, this.canvas.width);
    this.bill.update(timestamp, this.canvas.width);

    if (timestamp - this.bowStartTime > 2000) {
      if (this.bowPhase === 1) {
        // Transition to bow2 (bow to each other)
        this.bowPhase = 2;
        this.bowStartTime = timestamp;
        this.jimmy.forceState('bow2');
        this.bill.forceState('bow2');
      } else {
        // Done bowing, start countdown
        this.jimmy.forceState('idle');
        this.bill.forceState('idle');
        this.setPhase('countdown');
        this.countdownValue = 3;
        this.countdownStartTime = performance.now();
      }
    }
  }

  private updateCountdown(timestamp: number, input: InputState) {
    const elapsed = timestamp - this.countdownStartTime;
    const newCount = 3 - Math.floor(elapsed / 1000);

    if (newCount !== this.countdownValue && newCount >= 0) {
      this.countdownValue = newCount;
      this.callbacks.onCountdownTick(this.countdownValue);
    }

    if (elapsed >= 3000) {
      // Enable controls as soon as "FIGHT!" appears
      this.jimmy.isControllable = true;
      this.bill.isControllable = true;
      this.processPlayerInput(input);
      this.ai.update(timestamp);
    }

    if (elapsed >= 4000) {
      // "FIGHT!" has been shown for 1 second
      this.setPhase('fight');
    }

    this.jimmy.update(timestamp, this.canvas.width);
    this.bill.update(timestamp, this.canvas.width);
  }

  private updateFight(timestamp: number, input: InputState) {
    // Process Jimmy's input
    this.processPlayerInput(input);

    // Update AI
    this.ai.update(timestamp);

    // Update fighters
    this.jimmy.update(timestamp, this.canvas.width);
    this.bill.update(timestamp, this.canvas.width);

    // Prevent fighters from walking through each other (only block on ground)
    this.preventOverlap();

    // Jimmy faces his movement direction when running; keeps last direction otherwise
    if (!this.jimmy.isAttacking && this.jimmy.state !== 'punched') {
      if (this.jimmy.state === 'run' && this.jimmy.velocityX !== 0) {
        this.jimmy.facingRight = this.jimmy.velocityX < 0;
      }
    }
    if (!this.bill.isAttacking && this.bill.state !== 'punched') {
      this.bill.facingRight = this.jimmy.x > this.bill.x;
    }

    // Check attacks
    this.checkAttackCollisions();

    // Check win/lose
    if (this.jimmy.health <= 0) {
      this.roundWinner = 'Bill';
      this.billWins++;
      this.bill.setState('win');
      this.jimmy.setState('die');
      if (this.billWins >= this.winsNeeded) {
        this.winner = 'Bill';
        this.resultTime = timestamp;
        this.setPhase('result');
        this.callbacks.onMatchEnd(this.winner);
      } else {
        this.roundEndTime = timestamp;
        this.setPhase('roundEnd');
      }
    } else if (this.bill.health <= 0) {
      this.roundWinner = 'Jimmy';
      this.jimmyWins++;
      this.jimmy.setState('win');
      this.bill.setState('die');
      if (this.jimmyWins >= this.winsNeeded) {
        this.winner = 'Jimmy';
        this.resultTime = timestamp;
        this.setPhase('result');
        this.callbacks.onMatchEnd(this.winner);
      } else {
        this.roundEndTime = timestamp;
        this.setPhase('roundEnd');
      }
    }
  }

  private updateRoundEnd(timestamp: number) {
    this.jimmy.update(timestamp, this.canvas.width);
    this.bill.update(timestamp, this.canvas.width);

    // After 5 seconds, check if match is over or start next round
    if (timestamp - this.roundEndTime > 5000) {
      if (this.jimmyWins >= this.winsNeeded || this.billWins >= this.winsNeeded) {
        this.winner = this.jimmyWins >= this.winsNeeded ? 'Jimmy' : 'Bill';
        this.resultTime = timestamp;
        this.setPhase('result');
        this.callbacks.onMatchEnd(this.winner);
      } else {
        this.startRound();
      }
    }
  }

  private updateResult(timestamp: number, input: InputState) {
    this.jimmy.update(timestamp, this.canvas.width);
    this.bill.update(timestamp, this.canvas.width);

    // Allow restart after 3 seconds
    if (timestamp - this.resultTime > 3000) {
      if (this.input.isJustPressed(input, 'start') || this.input.isJustPressed(input, 'punch')) {
        this.resetFighters();
        this.setPhase('title');
      }
    }
  }

  private processPlayerInput(input: InputState) {
    if (this.jimmy.state === 'die' || this.jimmy.state === 'punched') return;
    if (this.jimmy.isAttacking) return;

    // Handle horizontal movement (works on ground and in air)
    if (input.left || input.right) {
      this.jimmy.velocityX = input.left ? -this.jimmy.moveSpeed : this.jimmy.moveSpeed;
      if (this.jimmy.isGrounded && this.jimmy.state !== 'jump') {
        this.jimmy.setState('run');
      }
    } else {
      this.jimmy.velocityX = 0;
      if (this.jimmy.state === 'run') {
        this.jimmy.setState('idle');
      }
    }

    // Handle actions
    if (this.input.isJustPressed(input, 'punch')) {
      this.jimmy.setState('punch');
    } else if (this.input.isJustPressed(input, 'kick')) {
      this.jimmy.setState('kick');
    } else if (input.block) {
      this.jimmy.setState('block');
    } else if (this.input.isJustPressed(input, 'up')) {
      this.jimmy.jump();
    } else if (!input.left && !input.right && this.jimmy.state === 'block') {
      this.jimmy.setState('idle');
    }
  }

  private checkAttackCollisions() {
    // Jimmy attacking Bill
    if (this.jimmy.isAttacking && this.jimmy.isAtImpactFrame() && !this.jimmy.hasHitRegistered()) {
      if (this.hitboxesOverlap(this.jimmy.getAttackHitbox(), this.bill.getHitbox())) {
        const damage = this.jimmy.state === 'kick' ? this.jimmy.kickDamage : this.jimmy.attackDamage;
        const direction = this.jimmy.visuallyFacingRight ? 1 : -1;
        this.bill.takeDamage(damage);
        this.bill.applyKnockback(direction, 12);
        this.jimmy.markHitRegistered();
      }
    }

    // Bill attacking Jimmy
    if (this.bill.isAttacking && this.bill.isAtImpactFrame() && !this.bill.hasHitRegistered()) {
      if (this.hitboxesOverlap(this.bill.getAttackHitbox(), this.jimmy.getHitbox())) {
        const damage = this.bill.state === 'kick' ? this.bill.kickDamage : this.bill.attackDamage;
        const direction = this.bill.visuallyFacingRight ? 1 : -1;
        this.jimmy.takeDamage(damage);
        this.jimmy.applyKnockback(direction, 12);
        this.bill.markHitRegistered();
      }
    }
  }

  private hitboxesOverlap(
    a: { left: number; top: number; right: number; bottom: number },
    b: { left: number; top: number; right: number; bottom: number }
  ): boolean {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  private preventOverlap() {
    // Only block when both fighters are on the ground
    if (!this.jimmy.isGrounded || !this.bill.isGrounded) return;

    const minDistance = (this.jimmy.width + this.bill.width) / 4;
    const dx = this.jimmy.x - this.bill.x;
    const dist = Math.abs(dx);

    if (dist < minDistance) {
      const overlap = minDistance - dist;
      const push = overlap / 2;
      if (dx > 0) {
        this.jimmy.x += push;
        this.bill.x -= push;
      } else {
        this.jimmy.x -= push;
        this.bill.x += push;
      }

      // Clamp to canvas bounds
      const margin = 20;
      this.jimmy.x = Math.max(margin, Math.min(this.canvas.width - margin, this.jimmy.x));
      this.bill.x = Math.max(margin, Math.min(this.canvas.width - margin, this.bill.x));
    }
  }

  // =================== RENDERING ===================

  private render(timestamp: number) {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (this.phase) {
      case 'title':
        this.renderTitle(timestamp);
        break;
      case 'bow':
        this.renderArena();
        this.renderScoreboard();
        this.renderFighters();
        this.renderHealthBars();
        break;
      case 'countdown':
        this.renderArena();
        this.renderScoreboard();
        this.renderFighters();
        this.renderHealthBars();
        this.renderCountdown(timestamp);
        break;
      case 'fight':
        this.renderArena();
        this.renderScoreboard();
        this.renderFighters();
        this.renderHealthBars();
        break;
      case 'roundEnd':
        this.renderArena();
        this.renderScoreboard();
        this.renderFighters();
        this.renderHealthBars();
        this.renderRoundEnd(timestamp);
        break;
      case 'result':
        this.renderArena();
        this.renderScoreboard();
        this.renderBloodPool(timestamp);
        this.renderFighters();
        this.renderHealthBars();
        this.renderResult(timestamp);
        break;
    }
  }

  private renderArena() {
    const { ctx, canvas } = this;

    // Background image
    ctx.drawImage(this.bgImage, 0, 0, canvas.width, canvas.height);
  }

  private renderFighters() {
    this.jimmy.draw(this.ctx);
    this.bill.draw(this.ctx);
  }

  private renderBloodPool(timestamp: number) {
    const delay = 2000;
    const elapsed = timestamp - this.resultTime - delay;
    if (elapsed < 0) return;

    const growDuration = 800; // ms to reach full size
    const scale = Math.min(1, elapsed / growDuration);
    const loser = this.winner === 'Jimmy' ? this.bill : this.jimmy;

    const fullW = 200;
    const fullH = fullW * (this.bloodPool.height / this.bloodPool.width);
    const w = fullW * scale;
    const h = fullH * scale;

    // Position at loser's feet
    const groundY = loser.y + loser.height / 2;
    this.ctx.drawImage(this.bloodPool, loser.x - w / 2, groundY - h * 0.3, w, h);
  }

  private renderScoreboard() {
    const { ctx, canvas } = this;
    const padding = 16;
    const dotSize = 14;
    const dotGap = 8;
    const logoH = 36;
    const dotsY = 10 + logoH + 10; // dots below logo
    const gap = 60; // space between the two sides

    // Logo sizes preserving aspect ratio
    const billLogoW = logoH * (this.billLogo.width / this.billLogo.height);
    const jimmyLogoW = logoH * (this.jimmyLogo.width / this.jimmyLogo.height);

    const dotsWidth = this.winsNeeded * dotSize + (this.winsNeeded - 1) * dotGap;

    // Each side width = max(logoW, dotsWidth)
    const billSideW = Math.max(billLogoW, dotsWidth);
    const jimmySideW = Math.max(jimmyLogoW, dotsWidth);
    const panelW = padding + billSideW + gap + jimmySideW + padding;
    const panelH = logoH + 10 + dotSize + 20 + 12 + padding;
    const panelX = canvas.width / 2 - panelW / 2;
    const panelY = 6;

    // Background panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bill side (left) - logo centered above dots
    const billCenterX = panelX + padding + billSideW / 2;
    ctx.drawImage(this.billLogo, billCenterX - billLogoW / 2, panelY + 6, billLogoW, logoH);
    for (let i = 0; i < this.winsNeeded; i++) {
      const dotX = billCenterX - dotsWidth / 2 + i * (dotSize + dotGap) + dotSize / 2;
      ctx.beginPath();
      ctx.arc(dotX, dotsY + dotSize / 2, dotSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = i < this.billWins ? '#ff3232' : 'rgba(255,255,255,0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Jimmy side (right) - logo centered above dots
    const jimmyCenterX = panelX + padding + billSideW + gap + jimmySideW / 2;
    ctx.drawImage(this.jimmyLogo, jimmyCenterX - jimmyLogoW / 2, panelY + 6, jimmyLogoW, logoH);
    for (let i = 0; i < this.winsNeeded; i++) {
      const dotX = jimmyCenterX - dotsWidth / 2 + i * (dotSize + dotGap) + dotSize / 2;
      ctx.beginPath();
      ctx.arc(dotX, dotsY + dotSize / 2, dotSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = i < this.jimmyWins ? '#0096ff' : 'rgba(255,255,255,0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Difficulty label centered between the two sides
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.difficulty.toUpperCase(), canvas.width / 2, dotsY + dotSize + 12);
    ctx.textBaseline = 'alphabetic';
  }

  private renderRoundEnd(timestamp: number) {
    const { ctx, canvas } = this;
    const elapsed = timestamp - this.roundEndTime;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Round winner text
    const pulse = Math.sin(timestamp / 200) * 0.3 + 0.7;
    const isJimmy = this.roundWinner === 'Jimmy';

    // Round winner logo (flashes with text)
    const roundLogo = isJimmy ? this.jimmyLogo : this.billLogo;
    const rLogoH = 40;
    const rLogoW = rLogoH * (roundLogo.width / roundLogo.height);
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.drawImage(roundLogo, canvas.width / 2 - rLogoW / 2, canvas.height / 2 - 150, rLogoW, rLogoH);
    ctx.restore();
    ctx.fillStyle = isJimmy ? `rgba(0, 150, 255, ${pulse})` : `rgba(255, 50, 50, ${pulse})`;
    ctx.font = 'bold 36px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = isJimmy ? '#0096ff' : '#ff3232';
    ctx.shadowBlur = 20;
    ctx.fillText(`${this.roundWinner!.toUpperCase()} WINS ROUND!`, canvas.width / 2, canvas.height / 2 - 30);
    ctx.shadowBlur = 0;

    // Score display
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px "Press Start 2P", monospace';
    ctx.fillText(`${this.jimmyWins} - ${this.billWins}`, canvas.width / 2, canvas.height / 2 + 20);

    // Countdown to next round
    const remaining = Math.max(0, Math.ceil((5000 - elapsed) / 1000));
    if (remaining > 0) {
      ctx.fillStyle = '#aaa';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(`NEXT ROUND IN ${remaining}...`, canvas.width / 2, canvas.height / 2 + 55);
    }
  }

  private renderHealthBars() {
    this.jimmy.drawHealthBar(this.ctx);
    this.bill.drawHealthBar(this.ctx);
  }

  private renderTitle(timestamp: number) {
    const { ctx, canvas } = this;

    // Background image
    ctx.drawImage(this.bgImage, 0, 0, canvas.width, canvas.height);

    // Dark overlay for contrast
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title glow effect
    const pulse = Math.sin(timestamp / 300) * 0.3 + 0.7;

    // Character portrait boxes
    const boxWidth = 250;
    const boxHeight = 320;
    const boxY = 100;
    const jimmyBoxX = canvas.width / 2 + 60;
    const billBoxX = canvas.width / 2 - boxWidth - 60;

    // Jimmy box
    ctx.strokeStyle = `rgba(0, 150, 255, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(jimmyBoxX, boxY, boxWidth, boxHeight);
    ctx.fillStyle = 'rgba(0, 50, 100, 0.3)';
    ctx.fillRect(jimmyBoxX, boxY, boxWidth, boxHeight);

    // Draw Jimmy in win pose inside box
    ctx.save();
    ctx.beginPath();
    ctx.rect(jimmyBoxX, boxY, boxWidth, boxHeight);
    ctx.clip();
    const jimmySave = { x: this.jimmy.x, y: this.jimmy.y, facing: this.jimmy.facingRight };
    this.jimmy.x = jimmyBoxX + boxWidth / 2;
    this.jimmy.y = boxY + boxHeight / 2 + 30;
    this.jimmy.facingRight = true;
    this.jimmy.draw(ctx, 0.5);
    this.jimmy.x = jimmySave.x;
    this.jimmy.y = jimmySave.y;
    this.jimmy.facingRight = jimmySave.facing;
    ctx.restore();

    // Bill box
    ctx.strokeStyle = `rgba(255, 50, 50, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(billBoxX, boxY, boxWidth, boxHeight);
    ctx.fillStyle = 'rgba(100, 20, 20, 0.3)';
    ctx.fillRect(billBoxX, boxY, boxWidth, boxHeight);

    // Draw Bill in win pose inside box
    ctx.save();
    ctx.beginPath();
    ctx.rect(billBoxX, boxY, boxWidth, boxHeight);
    ctx.clip();
    const billSave = { x: this.bill.x, y: this.bill.y, facing: this.bill.facingRight };
    this.bill.x = billBoxX + boxWidth / 2;
    this.bill.y = boxY + boxHeight / 2 + 30;
    this.bill.facingRight = false;
    this.bill.draw(ctx, 0.5);
    this.bill.x = billSave.x;
    this.bill.y = billSave.y;
    this.bill.facingRight = billSave.facing;
    ctx.restore();

    // Logos inside boxes (top)
    const titleJimmyLogoH = 30;
    const titleJimmyLogoW = titleJimmyLogoH * (this.jimmyLogo.width / this.jimmyLogo.height);
    ctx.drawImage(this.jimmyLogo, jimmyBoxX + boxWidth / 2 - titleJimmyLogoW / 2, boxY + 10, titleJimmyLogoW, titleJimmyLogoH);

    const titleBillLogoH = 30;
    const titleBillLogoW = titleBillLogoH * (this.billLogo.width / this.billLogo.height);
    ctx.drawImage(this.billLogo, billBoxX + boxWidth / 2 - titleBillLogoW / 2, boxY + 10, titleBillLogoW, titleBillLogoH);

    // Character names under boxes
    ctx.fillStyle = '#0096ff';
    ctx.font = 'bold 22px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('JIMMY', jimmyBoxX + boxWidth / 2, boxY + boxHeight + 35);

    ctx.fillStyle = '#ff3232';
    ctx.fillText('BILL', billBoxX + boxWidth / 2, boxY + boxHeight + 35);

    // VS text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 20;
    ctx.fillText('VS', canvas.width / 2, boxY + boxHeight / 2 + 10);
    ctx.shadowBlur = 0;

    // Title
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 36px "Press Start 2P", monospace';
    ctx.fillText('KILL BILL', canvas.width / 2, 60);

    // "Press Enter to Start" flashing
    if (Math.floor(timestamp / 500) % 2 === 0) {
      ctx.fillStyle = '#fff';
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillText('PRESS ENTER TO START', canvas.width / 2, canvas.height - 155);
    }

    // Difficulty selector
    ctx.fillStyle = '#aaa';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText('DIFFICULTY', canvas.width / 2, canvas.height - 115);

    const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
    const diffWidth = 120;
    const startX = canvas.width / 2 - (difficulties.length * diffWidth) / 2;

    difficulties.forEach((diff, i) => {
      const x = startX + i * diffWidth + diffWidth / 2;
      const isSelected = this.difficulty === diff;
      ctx.fillStyle = isSelected ? '#ff6600' : '#555';
      ctx.font = `${isSelected ? 'bold ' : ''}12px "Press Start 2P", monospace`;
      ctx.fillText(diff.toUpperCase(), x, canvas.height - 90);
      if (isSelected) {
        ctx.fillText('▲', x, canvas.height - 72);
      }
    });

    // Keyboard hints
    ctx.fillStyle = '#555';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('[1] EASY  [2] MEDIUM  [3] HARD', canvas.width / 2, canvas.height - 48);
  }

  private renderCountdown(timestamp: number) {
    const { ctx, canvas } = this;
    const elapsed = timestamp - this.countdownStartTime;
    const second = Math.floor(elapsed / 1000);

    let text = '';
    if (second < 1) text = '3';
    else if (second < 2) text = '2';
    else if (second < 3) text = '1';
    else text = 'FIGHT!';

    const scale = 1 + (elapsed % 1000) / 1000 * 0.3;

    ctx.save();
    ctx.fillStyle = text === 'FIGHT!' ? '#ff0000' : '#fff';
    ctx.font = `bold ${Math.floor(72 * scale)}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = text === 'FIGHT!' ? '#ff6600' : '#0096ff';
    ctx.shadowBlur = 30;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 30);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  private renderResult(timestamp: number) {
    const { ctx, canvas } = this;

    // Darken background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pulse = Math.sin(timestamp / 200) * 0.3 + 0.7;
    const isJimmy = this.winner === 'Jimmy';

    // Winner's logo at top (flashes with text)
    const winnerLogo = isJimmy ? this.jimmyLogo : this.billLogo;
    const logoH = 50;
    const logoW = logoH * (winnerLogo.width / winnerLogo.height);
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.drawImage(winnerLogo, canvas.width / 2 - logoW / 2, canvas.height / 2 - 170, logoW, logoH);
    ctx.restore();

    // Winner text
    ctx.fillStyle = isJimmy ? `rgba(0, 150, 255, ${pulse})` : `rgba(255, 50, 50, ${pulse})`;
    ctx.font = 'bold 40px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = isJimmy ? '#0096ff' : '#ff3232';
    ctx.shadowBlur = 25;
    ctx.fillText(`${this.winner!.toUpperCase()} WINS`, canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = 'bold 28px "Press Start 2P", monospace';
    ctx.fillText('THE MATCH!', canvas.width / 2, canvas.height / 2 + 5);
    ctx.shadowBlur = 0;

    // Final score
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px "Press Start 2P", monospace';
    ctx.fillText(`${this.jimmyWins} - ${this.billWins}`, canvas.width / 2, canvas.height / 2 + 45);

    // Restart prompt
    if (timestamp - this.resultTime > 3000 && Math.floor(timestamp / 500) % 2 === 0) {
      ctx.fillStyle = '#fff';
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillText('PRESS ENTER TO CONTINUE', canvas.width / 2, canvas.height / 2 + 80);
    }
  }

  handleDifficultyKey(key: string) {
    if (this.phase !== 'title') return;
    if (key === '1') this.setDifficulty('easy');
    else if (key === '2') this.setDifficulty('medium');
    else if (key === '3') this.setDifficulty('hard');
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;

    const groundY = height - 250;
    this.jimmy.groundY = groundY;
    this.bill.groundY = groundY;

    if (this.phase === 'title' || this.phase === 'countdown') {
      this.jimmy.y = groundY;
      this.bill.y = groundY;
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.input.destroy();
  }
}
