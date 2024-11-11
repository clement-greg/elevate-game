import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-hud-coin',
  standalone: true,
  imports: [],
  templateUrl: './hud-coin.component.html',
  styleUrl: './hud-coin.component.scss'
})
export class HudCoinComponent implements OnDestroy {
  interval: any;

      frames = 13;
    runFrame = 0;

  constructor() {
    this.interval = setInterval(()=> this.advance(), 100);
  }
  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  private advance() {
        this.runFrame++;
        if (this.runFrame > this.frames) {
            this.runFrame = 0;
        }
  }

  get backgroundPosition() {
    return (this.runFrame * -29.1) + 'px'
  }

}