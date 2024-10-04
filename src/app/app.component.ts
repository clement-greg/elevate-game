import { AfterViewInit, Component, HostListener, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Game } from './models/game';
import { ToolBarComponent } from './utilities/tool-bar/tool-bar.component';
import { CommonModule } from '@angular/common';
import { HudComponent } from './game-parts/hud/hud.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolBarComponent, CommonModule, HudComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {

  constructor(private zone: NgZone) {

  }
  ngAfterViewInit(): void {

    this.startGame();
  }
  title = 'elevate-game';

  showToolbar = false;

  startGame() {
    if (!document.getElementById('game-container')) {
      setTimeout(() => this.startGame(), 200);
      return;
    }
    if(!this.zone) {
      console.error('sorry, no zone here either');
    } else {
      console.info('yup, zone here!!!')
    }
    Game.getInstance(this.zone).start();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if(event.key === 'e' || event.key === 'E') {
      this.showToolbar = !this.showToolbar;
    }
  }
}
