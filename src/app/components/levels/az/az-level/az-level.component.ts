import { Component, HostListener, Input, NgZone } from '@angular/core';
import { NVGame } from '../../../../models/levels/nv-game';
import { Config } from '../../../../models/config';
import { PubSub } from '../../../../models/pub-sub';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';
import { ToolBarComponent } from '../../../tool-bar/tool-bar.component';
import { CommonModule } from '@angular/common';
import { HudComponent } from '../../../hud/hud.component';
import { LottiePlayerComponent } from '../../../lottie-player/lottie-player.component';
import { GameInstanceManager } from '../../../../models/game-instance';
import { AzShopComponent } from '../az-shop/az-shop.component';
import { AzNotCompleteComponent } from '../az-not-complete/az-not-complete.component';
import { BeginQuestAzComponent } from '../begin-quest-av/begin-quest-az.component';

@Component({
  selector: 'app-az-level',
  standalone: true,
  imports: [RouterOutlet, ToolBarComponent, CommonModule, HudComponent, LottiePlayerComponent],
  templateUrl: './az-level.component.html',
  styleUrl: './az-level.component.scss'
})
export class AzLevelComponent {
  questBeginRef: MatDialogRef<BeginQuestAzComponent>;
  notCompletedRef: MatDialogRef<AzNotCompleteComponent>;
  // isVegas = false;
  // isAz = false;

  @Input() location: 'AZ' | 'UT' | 'NV';


  constructor(private zone: NgZone, dialog: MatDialog) {

    PubSub.getInstance().subscribe('quest-begin', () => {
      this.questBeginRef = dialog.open(BeginQuestAzComponent, { disableClose: true });
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
      const ref = dialog.open(AzShopComponent);
      ref.afterClosed().subscribe(() => { GameInstanceManager.getInstance().dialogOpen = false; });
    });

    PubSub.getInstance().subscribe('hit-completion-barrier', () => {
      if (!GameInstanceManager.getInstance().dialogOpen) {
        GameInstanceManager.getInstance().dialogOpen = true;
        this.notCompletedRef = dialog.open(AzNotCompleteComponent);
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
    return NVGame.applianceShopLeft + 'px';
  }

  get homeLeft() {
    return NVGame.homeLeft + 'px';
  }

  get showBilboardVideos() {
    return Config.getInstance().showBilboardVideos;
  }


  get lastGuyLeft() {
    return (NVGame.homeLeft - 200) + 'px';
  }

  get initialLeft() {
    return NVGame.initialLeft + 'px';
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
    return (NVGame.applianceShopLeft + 25) + 'px';
  }
}
