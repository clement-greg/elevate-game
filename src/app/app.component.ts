import { AfterViewInit, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Game } from './models/game';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  ngAfterViewInit(): void {

    this.startGame();
  }
  title = 'elevate-game';

  startGame() {
    if (!document.getElementById('game-container')) {
      setTimeout(() => this.startGame(), 200);
      return;
    }
    Game.getInstance().start();
  }
}
