import { AfterViewInit, Component, HostListener, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Game } from './models/game';
import { ToolBarComponent } from './utilities/tool-bar/tool-bar.component';
import { CommonModule } from '@angular/common';
import { HudComponent } from './game-parts/hud/hud.component';
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
import { BeginQuestComponent } from './begin-quest/begin-quest.component';
import { ShopComponent } from './shop/shop.component';

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

    PubSub.getInstance().subscribe('quest-begin',()=> {
      this.questBeginRef =  dialog.open(BeginQuestComponent, { disableClose: true })
    });

    PubSub.getInstance().subscribe('close-begin-quest',()=> {
      this.questBeginRef.close();
    });

    PubSub.getInstance().subscribe('show-shop', ()=> {
      dialog.open(ShopComponent);
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

  startGame() {
    if (!document.getElementById('game-container')) {
      setTimeout(() => this.startGame(), 200);
      return;
    }
    if(!this.zone) {
      console.error('sorry, no zone here either');
    } else {
      console.info('yup, zone here!!!')
    }
    Game.getInstance(this.zone).start();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if(event.key === 'e' || event.key === 'E') {
      this.showToolbar = !this.showToolbar;
    }
  }
}
