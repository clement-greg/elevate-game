import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FightEngine, GamePhase } from './fight-engine';

@Component({
  selector: 'app-kill-bill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kill-bill.component.html',
  styleUrls: ['./kill-bill.component.scss'],
})
export class KillBillComponent implements OnInit, OnDestroy {
  @ViewChild('fightCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private router = inject(Router);
  private engine!: FightEngine;
  phase: GamePhase = 'title';
  loading = true;
  private resizeHandler = this.onResize.bind(this);

  ngOnInit() {
    this.initGame();
    window.addEventListener('resize', this.resizeHandler);
  }

  private async initGame() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.engine = new FightEngine(canvas, {
      onPhaseChange: (phase) => {
        this.phase = phase;
      },
      onCountdownTick: (_count) => {},
      onMatchEnd: (_winner) => {
        setTimeout(() => this.router.navigate(['/'], { queryParams: { chooser: 'true' } }), 15000);
      },
    });

    await this.engine.init();
    this.loading = false;
  }

  private onResize() {
    if (this.engine) {
      this.engine.resize(window.innerWidth, window.innerHeight);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.engine) {
      this.engine.handleDifficultyKey(event.key);
    }
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
    if (this.engine) {
      this.engine.destroy();
    }
  }
}
