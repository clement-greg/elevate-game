import { Component, HostListener, NgZone } from '@angular/core';
import { Level1Component } from './components/level1/level1.component';
import { CommonModule } from '@angular/common';
import { TitleScreenComponent } from './components/title-screen/title-screen.component';
import { GameWonComponent } from './components/game-won/game-won.component';
import { PubSub } from './models/pub-sub';
import { Game } from './models/game';
import { GameLostComponent } from './components/game-lost/game-lost.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfigComponent } from './components/config/config.component';
import { Config } from './models/config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Level1Component, CommonModule, TitleScreenComponent, GameWonComponent, GameLostComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  startGame = false;
  hideTitleScreen = false;
  showGameWon = false;
  gameWonTimeout;
  showGameLost;
  canRestart = true;

  constructor(private zone: NgZone,
    private dialog: MatDialog
  ) {


  }

  setupHandlers() {
    PubSub.getInstance().subscribe('level-complete', () => {
      this.startGame = false;
      this.showGameWon = true;
      this.canRestart = false;

      Game.deleteInstance();
      this.gameWonTimeout = setTimeout(() => {
        this.showGameWon = false;
        this.hideTitleScreen = false;
      }, Config.getInstance().showGameWinTime);
      setTimeout(() => this.canRestart = true, 4000);
    });

    PubSub.getInstance().subscribe('game-lost', () => {
      this.startGame = false;
      this.showGameLost = true;
      this.canRestart = false;

      Game.deleteInstance();
      this.gameWonTimeout = setTimeout(() => {
        this.showGameLost = false;
        this.hideTitleScreen = false;
      }, Config.getInstance().showGameLostTime);
      setTimeout(() => this.canRestart = true, 4000);
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === ' ' && !this.startGame && this.canRestart) {
      this.showGameWon = false;
      this.showGameLost = false;
      Game.deleteInstance();
      this.setupHandlers();
      this.startGame = true;
      clearTimeout(this.gameWonTimeout);
      setTimeout(() => this.hideTitleScreen = true, 1000);
    }
    if ((event.key === 'c' || event.key === 'C') && !this.startGame) {
      this.dialog.open(ConfigComponent);
    }

  }

}
