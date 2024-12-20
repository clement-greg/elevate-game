import { AfterViewInit, Component, HostListener, Input, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToolBarComponent } from '../../../tool-bar/tool-bar.component';
import { CommonModule } from '@angular/common';
import { HudComponent } from '../../../hud/hud.component';
import { LottiePlayerComponent } from '../../../lottie-player/lottie-player.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PubSub } from '../../../../models/pub-sub';
import { ShopComponent } from '../shop/shop.component';
import { NotCompleteComponent } from '../not-complete/not-complete.component';
import { Config } from '../../../../models/config';
import { GameInstanceManager } from '../../../../models/game-instance';
import { BeginQuestComponent } from '../begin-quest/begin-quest.component';
import { Game } from '../../../../models/game';

@Component({
  selector: 'app-ut-level',
  standalone: true,
  imports: [RouterOutlet, ToolBarComponent, CommonModule, HudComponent, LottiePlayerComponent],
  templateUrl: './ut-level.component.html',
  styleUrl: './ut-level.component.scss'
})
export class Level1Component implements AfterViewInit {
  questBeginRef: MatDialogRef<BeginQuestComponent>;
  notCompletedRef: MatDialogRef<NotCompleteComponent>;
  // isVegas = false;
  // isAz = false;

  @Input() location: 'AZ' | 'UT' | 'NV';


  constructor(private zone: NgZone, dialog: MatDialog) {

    PubSub.getInstance().subscribe('quest-begin', () => {
      this.questBeginRef = dialog.open(BeginQuestComponent, { disableClose: true });
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
      const ref = dialog.open(ShopComponent);
      ref.afterClosed().subscribe(() => { GameInstanceManager.getInstance().dialogOpen = false; });
    });

    PubSub.getInstance().subscribe('hit-completion-barrier', () => {
      if (!GameInstanceManager.getInstance().dialogOpen) {
        GameInstanceManager.getInstance().dialogOpen = true;
        this.notCompletedRef = dialog.open(NotCompleteComponent);
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
