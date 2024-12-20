import { Component, NgZone } from '@angular/core';
import { GameProviderService } from '../../models/services/game-provider.service';
import { HudCoinComponent } from '../hud-coin/hud-coin.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hud',
  standalone: true,
  imports: [HudCoinComponent, CommonModule],
  templateUrl: './hud.component.html',
  styleUrl: './hud.component.scss'
})
export class HudComponent {

  gameHUD: any;
  constructor(private gameProvider: GameProviderService, 
    zone: NgZone
  ) {
    
    this.initializeGameHUD();
  }

  initializeGameHUD() {
    if(!this.gameProvider.getInstance().gameHUD) {
      setTimeout(()=> this.initializeGameHUD(), 100);
      return;
    }
    this.gameHUD = this.gameProvider.getInstance().gameHUD;
  }
}
