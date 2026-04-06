interface Raindrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  splashed: boolean;
}

interface Splash {
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

interface SteamParticle {
  x: number;
  y: number;
  startY: number;
  radius: number;
  opacity: number;
  speedY: number;
  drift: number;
  growRate: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

interface PuddleZone {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export class RainEffect {
  private drops: Raindrop[] = [];
  private splashes: Splash[] = [];
  private steam: SteamParticle[] = [];
  private ripples: Ripple[] = [];
  private puddles: PuddleZone[] = [];
  private readonly windX = -2;
  private readonly dropColor = '174, 194, 224';
  private groundY: number;
  private canvasW: number;
  private canvasH: number;
  private _paused = false;

  pause() { this._paused = true; }
  resume() { this._paused = false; }

  constructor(canvasWidth: number, canvasHeight: number, groundY: number, dropCount = 200) {
    this.canvasW = canvasWidth;
    this.canvasH = canvasHeight;
    this.groundY = groundY;

    for (let i = 0; i < dropCount; i++) {
      this.drops.push(this.createDrop(true));
    }

    // Puddle zones (fractions of canvas mapped from background art)
    this.puddles = [
      { left: canvasWidth * 0.05, right: canvasWidth * 0.40, top: canvasHeight * 0.88, bottom: canvasHeight * 0.95 },  // large left puddle
      { left: canvasWidth * 0.55, right: canvasWidth * 0.63, top: canvasHeight * 0.83, bottom: canvasHeight * 0.87 },  // small center puddle
      { left: canvasWidth * 0.62, right: canvasWidth * 0.92, top: canvasHeight * 0.90, bottom: canvasHeight * 0.96 },  // large right puddle
    ];
  }

  resize(canvasWidth: number, canvasHeight: number, groundY: number) {
    this.canvasW = canvasWidth;
    this.canvasH = canvasHeight;
    this.groundY = groundY;

    this.puddles = [
      { left: canvasWidth * 0.05, right: canvasWidth * 0.40, top: canvasHeight * 0.88, bottom: canvasHeight * 0.95 },
      { left: canvasWidth * 0.55, right: canvasWidth * 0.63, top: canvasHeight * 0.83, bottom: canvasHeight * 0.87 },
      { left: canvasWidth * 0.62, right: canvasWidth * 0.92, top: canvasHeight * 0.90, bottom: canvasHeight * 0.96 },
    ];
  }

  private createDrop(randomY: boolean): Raindrop {
    return {
      x: Math.random() * (this.canvasW + 100) - 50, // slight overshoot for wind
      y: randomY ? Math.random() * this.canvasH : -Math.random() * 60,
      length: 12 + Math.random() * 18,
      speed: 8 + Math.random() * 6,
      opacity: 0.2 + Math.random() * 0.35,
      splashed: false,
    };
  }

  update() {
    if (this._paused) return;

    // Update drops
    for (const drop of this.drops) {
      drop.y += drop.speed;
      drop.x += this.windX;

      // Splash when crossing the ground, keep falling
      if (!drop.splashed && drop.y > this.groundY) {
        drop.splashed = true;
        if (Math.random() < 0.3) {
          this.splashes.push({
            x: drop.x,
            y: this.groundY,
            radius: 1,
            opacity: 0.6,
          });
        }

        // Spawn ripple if drop's X falls within a puddle
        for (const p of this.puddles) {
          if (drop.x >= p.left && drop.x <= p.right) {
            const rippleY = p.top + Math.random() * (p.bottom - p.top);
            this.ripples.push({
              x: drop.x,
              y: rippleY,
              radius: 1,
              maxRadius: 6 + Math.random() * 8,
              opacity: 0.5 + Math.random() * 0.2,
            });
            break;
          }
        }
      }

      // Reset once fully off-screen
      if (drop.y > this.canvasH) {
        Object.assign(drop, this.createDrop(false));
      }
    }

    // Update splashes
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.radius += 0.5;
      s.opacity -= 0.08;
      if (s.opacity <= 0) {
        this.splashes.splice(i, 1);
      }
    }

    // Spawn steam from the grate area only (fraction of bg image)
    if (Math.random() < 0.25) {
      const grateLeft = this.canvasW * 0.33;
      const grateRight = this.canvasW * 0.44;
      const grateTop = this.canvasH * 0.84;
      const grateBottom = this.canvasH * 0.89;

      const spawnX = grateLeft + Math.random() * (grateRight - grateLeft);
      const spawnY = grateTop + Math.random() * (grateBottom - grateTop);
      const depth = (spawnY - this.groundY) / (this.canvasH - this.groundY);
      const scale = 1 + Math.max(0, depth) * 2;
      this.steam.push({
        x: spawnX,
        y: spawnY,
        startY: spawnY,
        radius: (8 + Math.random() * 12) * scale,
        opacity: (0.08 + Math.random() * 0.12) * scale,
        speedY: -(0.3 + Math.random() * 0.5) * scale,
        drift: (Math.random() - 0.5) * 0.4 * scale,
        growRate: (0.15 + Math.random() * 0.2) * scale,
      });
    }

    // Update steam
    for (let i = this.steam.length - 1; i >= 0; i--) {
      const p = this.steam[i];
      p.y += p.speedY;
      p.x += p.drift;
      p.radius += p.growRate;
      p.opacity -= 0.001;
      if (p.opacity <= 0 || p.y < p.startY - 250) {
        this.steam.splice(i, 1);
      }
    }

    // Update ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 0.4;
      r.opacity -= 0.015;
      if (r.opacity <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this._paused) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.5;

    // Draw raindrops
    for (const drop of this.drops) {
      ctx.strokeStyle = `rgba(${this.dropColor}, ${drop.opacity})`;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x + this.windX * 0.5, drop.y + drop.length);
      ctx.stroke();
    }

    // Draw splashes
    for (const s of this.splashes) {
      ctx.strokeStyle = `rgba(${this.dropColor}, ${s.opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, Math.PI, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw puddle ripples (flattened ellipses for perspective)
    for (const r of this.ripples) {
      ctx.strokeStyle = `rgba(${this.dropColor}, ${r.opacity})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw steam / vapor
    for (const p of this.steam) {
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      gradient.addColorStop(0, `rgba(200, 210, 220, ${p.opacity})`);
      gradient.addColorStop(1, `rgba(200, 210, 220, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
