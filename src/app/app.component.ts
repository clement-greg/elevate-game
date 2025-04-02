import { Component, HostListener, NgZone } from '@angular/core';
import { Level1Component } from './components/levels/ut/ut-level/ut-level.component';
import { CommonModule } from '@angular/common';
import { TitleScreenComponent } from './components/title-screen/title-screen.component';
import { GameWonComponent } from './components/game-won/game-won.component';
import { PubSub } from './models/utilities/pub-sub';
import { GameLostComponent } from './components/game-lost/game-lost.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfigComponent } from './components/config/config.component';
import { Config } from './models/utilities/config';
import { JoystickState } from './models/utilities/joystick-state';
import { LocationChooserComponent } from './components/location-chooser/location-chooser.component';
import { NvLevelComponent } from './components/levels/nv/nv-level/nv-level.component';
import { GameInstanceManager } from './models/base/game-instance';
import { AzLevelComponent } from './components/levels/az/az-level/az-level.component';
import { EliPopupComponent } from './components/eli-popup/eli-popup.component';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Level1Component, CommonModule, TitleScreenComponent, GameWonComponent, EliPopupComponent, GameLostComponent, NvLevelComponent, AzLevelComponent, RouterModule],
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
  location: 'AZ' | 'UT' | 'NV' = 'UT';
  showEliPopup = false;
  eliPopupMessage: string;
  wentFullScreen = false;



  constructor(private zone: NgZone,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog
  ) {

    this.setupJoystick();

    activatedRoute.queryParams.subscribe(params=> {
      if(params['state']) {
        this.location = params['state'];
        GameInstanceManager.location = this.location;
        this.beginGame();
      }
    });
  }

  setupJoystick() {
    this.joystickState.onButtonPress = this.joystickButtonPress.bind(this);
  }

  joystickButtonPress(btn: number) {
    this.goFullScreen();

    switch (btn) {
      case 0:
        this.doGameStart();
        break;
      case 9:
        if (GameInstanceManager.hasInstance) {
          this.showEliPopup = false;
          this.backToHomeScreen();
        }
        break;

    }
  }

  goFullScreen() {
    if (!this.wentFullScreen) {
      const elem = document.documentElement;
      elem.requestFullscreen();
      this.wentFullScreen = true;
    }

  }

  backToHomeScreen() {
    this.startGame = false;
    this.hideTitleScreen = false;
    this.showGameLost = false;
    this.showGameWon = false;
    GameInstanceManager.deleteInstance();
    this.dialog.closeAll();
  }

  setupHandlers() {
    PubSub.getInstance().subscribe('level-complete', () => {
      this.startGame = false;
      this.showGameWon = true;
      this.canRestart = false;
      this.showEliPopup = false;

      GameInstanceManager.deleteInstance();
      this.gameWonTimeout = setTimeout(() => {
        this.showGameWon = false;
        this.hideTitleScreen = false;
      }, Config.getInstance().showGameWinTime);
      setTimeout(() => this.canRestart = true, 4000);
    });


    PubSub.getInstance().subscribe('close-begin-quest', () => {
      clearTimeout(this.gameTimeout);
    });

    PubSub.getInstance().subscribe('eli-popup', args => {
      this.showEliPopup = false;
      setTimeout(() => {
        this.eliPopupMessage = args.message;
        this.showEliPopup = true;
      }, 5);

    });

    PubSub.getInstance().subscribe('game-lost', () => {
      this.startGame = false;
      this.showGameLost = true;
      this.canRestart = false;
      this.showEliPopup = false;

      GameInstanceManager.deleteInstance();
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
      this.goFullScreen();
    }
    if ((event.key === 'c' || event.key === 'C') && !this.startGame) {
      this.dialog.open(ConfigComponent);
    }

  }

  gameTimeout: any;
  locationChooserOpen = false;
  doGameStart() {

    if (!this.startGame && this.canRestart) {
      if (!this.locationChooserOpen) {
        const ref = this.dialog.open(LocationChooserComponent);
        ref.afterClosed().subscribe(result => {
          if (result) {
            this.location = result;
            GameInstanceManager.location = result;
            this.beginGame();
          }
          this.locationChooserOpen = false;

        });
        this.locationChooserOpen = true;
      }
    }
  }

  beginGame() {
    clearTimeout(this.gameTimeout);
    this.showGameWon = false;
    this.showGameLost = false;
    GameInstanceManager.deleteInstance();
    this.setupHandlers();
    this.startGame = true;
    clearTimeout(this.gameWonTimeout);
    setTimeout(() => this.hideTitleScreen = true, 1000);
    this.gameTimeout = setTimeout(() => this.backToHomeScreen(), 300000);
  }
}
