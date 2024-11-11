import { AfterViewInit, Component, HostListener, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToolBarComponent } from '../tool-bar/tool-bar.component';
import { CommonModule } from '@angular/common';
import { HudComponent } from '../hud/hud.component';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';
import { BeginQuestComponent } from '../begin-quest/begin-quest.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PubSub } from '../../models/pub-sub';
import { Game } from '../../models/game';
import { ShopComponent } from '../shop/shop.component';
import { NotCompleteComponent } from '../not-complete/not-complete.component';
import { Config } from '../../models/config';

@Component({
  selector: 'app-level1',
  standalone: true,
  imports: [RouterOutlet, ToolBarComponent, CommonModule, HudComponent, LottiePlayerComponent],
  templateUrl: './level1.component.html',
  styleUrl: './level1.component.scss'
})
export class Level1Component implements AfterViewInit {
  questBeginRef: MatDialogRef<BeginQuestComponent>;
  notCompletedRef: MatDialogRef<NotCompleteComponent>;
  constructor(private zone: NgZone, dialog: MatDialog) {

    PubSub.getInstance().subscribe('quest-begin', () => {
      this.questBeginRef = dialog.open(BeginQuestComponent, { disableClose: true });
      Game.getInstance().dialogOpen = true;
      this.questBeginRef.afterClosed().subscribe(() => { Game.getInstance().dialogOpen = false; });
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
      Game.getInstance().dialogOpen = false;
      dialog.closeAll();

    });



    PubSub.getInstance().subscribe('show-shop', () => {
      Game.getInstance().dialogOpen = true;
      const ref = dialog.open(ShopComponent);
      ref.afterClosed().subscribe(() => { Game.getInstance().dialogOpen = false; });
    });

    PubSub.getInstance().subscribe('hit-completion-barrier', () => {
      if (!Game.getInstance().dialogOpen) {
        Game.getInstance().dialogOpen = true;
        this.notCompletedRef = dialog.open(NotCompleteComponent);
        this.notCompletedRef.afterClosed().subscribe(() => { Game.getInstance().dialogOpen = false; });
      }
    });

    PubSub.getInstance().subscribe('close-info-barrier', () => {
      this.notCompletedRef.close();
    });
  }
  ngAfterViewInit(): void {

    this.startGame();
  }
  title = 'elevate-game';

  showToolbar = false;

  get showDiscoTime() {
    return Game.getInstance().showDiscoTime;
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
    Game.getInstance(this.zone).start();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if ((event.key === 'e' || event.key === 'E') && Config.getInstance().allowDebug) {
      this.showToolbar = !this.showToolbar;
    }
    if((event.key === 'd' || event.key === 'D') && Config.getInstance().allowDebug ) {
      Game.getInstance().forceDiscoTime();
    }

    Game.getInstance().processKeyDownEvent(event);
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    Game.getInstance().processKeyUp(event);
  }

  get shopEntranceVisible() {
    return Game.getInstance().shopEntranceAvailable;
  }

  get shopEntranceAvailableSignLeft() {
    return (Game.applianceShopLeft + 25) + 'px';
  }
}
