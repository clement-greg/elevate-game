import { Component, HostListener, NgZone } from '@angular/core';
import { Level1Component } from './components/level1/level1.component';
import { CommonModule } from '@angular/common';
import { TitleScreenComponent } from './components/title-screen/title-screen.component';
import { GameWonComponent } from './components/game-won/game-won.component';
import { PubSub } from './models/pub-sub';
import { Game } from './models/game';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Level1Component, CommonModule, TitleScreenComponent, GameWonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  startGame = false;
  hideTitleScreen = false;
  showGameWon = false;
  gameWonTimeout;
  constructor(private zone: NgZone) {


  }

  setupHandlers() {
    PubSub.getInstance().subscribe('level-complete', () => {
      this.startGame = false;
      this.showGameWon = true;

      Game.deleteInstance();
      this.gameWonTimeout =  setTimeout(() => {
        this.showGameWon = false;
        this.hideTitleScreen = false;
      }, 1000);
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === ' ' && !this.startGame) {
      Game.deleteInstance();
      this.setupHandlers();
      this.startGame = true;
      clearTimeout(this.gameWonTimeout);
      setTimeout(() => this.hideTitleScreen = true, 1000);
    }
  }

}
