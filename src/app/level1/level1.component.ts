import { AfterViewInit, Component, HostListener, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToolBarComponent } from '../utilities/tool-bar/tool-bar.component';
import { CommonModule } from '@angular/common';
import { HudComponent } from '../components/hud/hud.component';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';
import { BeginQuestComponent } from '../components/begin-quest/begin-quest.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PubSub } from '../models/pub-sub';
import { Game } from '../models/game';
import { WinGameComponent } from '../components/win-game/win-game.component';
import { ShopComponent } from '../components/shop/shop.component';
import { NotCompleteComponent } from '../not-complete/not-complete.component';

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
      this.questBeginRef.afterClosed().subscribe(() => Game.getInstance().dialogOpen = false);
    });

    PubSub.getInstance().subscribe('level-complete', () => {
      Game.getInstance().dialogOpen = true;
      const ref = dialog.open(WinGameComponent, { disableClose: true });
      ref.afterClosed().subscribe(() => Game.getInstance().dialogOpen = false);
      setTimeout(() => ref.close(), 10000);
    })

    PubSub.getInstance().subscribe('close-begin-quest', () => {
      this.questBeginRef.close();
    });

    PubSub.getInstance().subscribe('show-shop', () => {
      Game.getInstance().dialogOpen = true;
      const ref = dialog.open(ShopComponent);
      ref.afterClosed().subscribe(() => Game.getInstance().dialogOpen = false);
    });

    PubSub.getInstance().subscribe('hit-completion-barrier', () => {
      if (!Game.getInstance().dialogOpen) {
        Game.getInstance().dialogOpen = true;
        this.notCompletedRef = dialog.open(NotCompleteComponent);
        this.notCompletedRef.afterClosed().subscribe(() => Game.getInstance().dialogOpen = false);
      }
    });

    PubSub.getInstance().subscribe('close-info-barrier',()=> {
      this.notCompletedRef.close();
    });
  }
  ngAfterViewInit(): void {

    this.startGame();
  }
  title = 'elevate-game';

  showToolbar = false;

  get applianceShopLeft() {
    return Game.getInstance().applianceShopLeft + 'px';
  }

  get homeLeft() {
    return Game.getInstance().homeLeft + 'px';
  }


  get lastGuyLeft() {
    return (Game.getInstance().homeLeft - 200) + 'px';
  }

  get initialLeft() {
    return Game.getInstance().initialLeft + 'px';
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
    if (event.key === 'e' || event.key === 'E') {
      this.showToolbar = !this.showToolbar;
    }
  }
}
