import { AfterViewInit, Component, HostListener, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Game } from './models/game';
import { ToolBarComponent } from './utilities/tool-bar/tool-bar.component';
import { CommonModule } from '@angular/common';
import { HudComponent } from './components/hud/hud.component';
import { PubSub } from './models/pub-sub';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { BeginQuestComponent } from './components/begin-quest/begin-quest.component';
import { ShopComponent } from './components/shop/shop.component';
import { WinGameComponent } from './components/win-game/win-game.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolBarComponent, CommonModule, HudComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {

  questBeginRef: MatDialogRef<BeginQuestComponent>;
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
