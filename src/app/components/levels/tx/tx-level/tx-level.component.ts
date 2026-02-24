import { Component, HostListener, Input, NgZone } from '@angular/core';
import { Config } from '../../../../models/utilities/config';
import { PubSub } from '../../../../models/utilities/pub-sub';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';
import { ToolBarComponent } from '../../../tool-bar/tool-bar.component';
import { CommonModule } from '@angular/common';
import { HudComponent } from '../../../hud/hud.component';
import { LottiePlayerComponent } from '../../../lottie-player/lottie-player.component';
import { GameInstanceManager } from '../../../../models/base/game-instance';

import { Game } from '../../../../models/base/game';
import { BeginQuestTxComponent } from '../begin-quest-tx/begin-quest-tx.component';
import { TxNotCompleteComponent } from '../tx-not-complete/tx-not-complete.component';
import { TxShopComponent } from '../tx-shop/tx-shop.component';

@Component({
  selector: 'app-tx-level',
  standalone: true,
  imports: [RouterOutlet, ToolBarComponent, CommonModule, HudComponent, LottiePlayerComponent],
  templateUrl: './tx-level.component.html',
  styleUrl: './tx-level.component.scss'
})
export class TxLevelComponent {
  questBeginRef: MatDialogRef<BeginQuestTxComponent>;
  notCompletedRef: MatDialogRef<TxNotCompleteComponent>;
  // isVegas = false;
  // isAz = false;

  @Input() location: 'AZ' | 'UT' | 'NV' | 'TX';


  constructor(private zone: NgZone, dialog: MatDialog) {

    PubSub.getInstance().subscribe('quest-begin', () => {
      this.questBeginRef = dialog.open(BeginQuestTxComponent, { disableClose: true });
      GameInstanceManager.getInstance().dialogOpen = true;
      this.questBeginRef.afterClosed().subscribe(() => { GameInstanceManager.getInstance().dialogOpen = false; });
    });

    PubSub.getInstance().subscribe('close-begin-quest', () => {
      this.questBeginRef.close();
    });

    PubSub.getInstance().subscribe('game-lost', () => {
      dialog.closeAll();
    });
    PubSub.getInstance().subscribe('level-complete', () => {
      dialog.closeAll();
    });
    PubSub.getInstance().subscribe('close-all-diagrams', () => {
      GameInstanceManager.getInstance().dialogOpen = false;
      dialog.closeAll();

    });



    PubSub.getInstance().subscribe('show-shop', () => {
      GameInstanceManager.getInstance().dialogOpen = true;
      const ref = dialog.open(TxShopComponent);
      ref.afterClosed().subscribe(() => { GameInstanceManager.getInstance().dialogOpen = false; });
    });

    PubSub.getInstance().subscribe('hit-completion-barrier', () => {
      if (!GameInstanceManager.getInstance().dialogOpen) {
        GameInstanceManager.getInstance().dialogOpen = true;
        this.notCompletedRef = dialog.open(TxNotCompleteComponent);
        this.notCompletedRef.afterClosed().subscribe(() => { GameInstanceManager.getInstance().dialogOpen = false; });
      }
    });

    PubSub.getInstance().subscribe('close-info-barrier', () => {
      this.notCompletedRef.close();
    });
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const location = urlParams.get('location');
    if (location === 'NV') {
      this.location = 'NV';
    }
    if (location === 'AZ') {
      this.location = 'AZ';
    }
    if (location === 'TX') {
      this.location = 'TX';
    }
  }
  ngAfterViewInit(): void {

    this.startGame();
  }
  title = 'elevate-game';

  showToolbar = false;

  get isAz() {
    return this.location === 'AZ';
  }

  get isVegas() {
    return this.location === 'NV';
  }

  get showDiscoTime() {
    return GameInstanceManager.getInstance().showDiscoTime;
  }

  get applianceShopLeft() {
    return Game.applianceShopLeft + 'px';
  }

  get homeLeft() {
    return Game.homeLeft + 'px';
  }

  get showBilboardVideos() {
    return Config.getInstance().showBilboardVideos;
  }


  get lastGuyLeft() {
    return (Game.homeLeft - 200) + 'px';
  }

  get initialLeft() {
    return Game.initialLeft + 'px';
  }

  startGame() {
    if (!document.getElementById('game-container')) {
      setTimeout(() => this.startGame(), 200);
      return;
    }
    GameInstanceManager.getInstance(this.zone).start();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if ((event.key === 'e' || event.key === 'E') && Config.getInstance().allowDebug) {
      this.showToolbar = !this.showToolbar;
    }
    if ((event.key === 'd' || event.key === 'D') && Config.getInstance().allowDebug) {
      GameInstanceManager.getInstance().forceDiscoTime();
    }

    GameInstanceManager.getInstance().processKeyDownEvent(event);
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    GameInstanceManager.getInstance().processKeyUp(event);
  }

  get shopEntranceVisible() {
    return GameInstanceManager.getInstance().shopEntranceAvailable;
  }

  get shopEntranceAvailableSignLeft() {
    return (Game.applianceShopLeft + 25) + 'px';
  }
}
