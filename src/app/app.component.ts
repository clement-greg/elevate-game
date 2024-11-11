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
import { JoystickState } from './models/joystick-state';

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
  joystickState = new JoystickState(0);

  constructor(private zone: NgZone,
    private dialog: MatDialog
  ) {

    this.setupJoystick();

  }

  setupJoystick() {
    this.joystickState.onButtonPress = this.joystickButtonPress.bind(this);
  }

  joystickButtonPress(btn: number) {

    switch (btn) {
      case 0:
        this.doGameStart();
        break;
      case 9:
        if (Game.hasInstance) {
          this.startGame = false;
          this.hideTitleScreen = false;
          this.showGameLost = false;
          this.showGameWon = false;
          Game.deleteInstance();
          this.dialog.closeAll();
        }
        break;
        
    }
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

  primaryButtons = [' ', 'a', 'A'];

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.primaryButtons.indexOf(event.key) > -1 && !this.startGame && this.canRestart) {
      this.doGameStart();
    }
    if ((event.key === 'c' || event.key === 'C') && !this.startGame) {
      this.dialog.open(ConfigComponent);
    }

  }

  doGameStart() {
    if (!this.startGame && this.canRestart) {
      this.showGameWon = false;
      this.showGameLost = false;
      Game.deleteInstance();
      this.setupHandlers();
      this.startGame = true;
      clearTimeout(this.gameWonTimeout);
      setTimeout(() => this.hideTitleScreen = true, 1000);
    }
  }

}
