import { Component, NgZone } from '@angular/core';
import { GameProviderService } from '../../services/game-provider.service';
import { Game, GameHUD } from '../../models/game';

@Component({
  selector: 'app-hud',
  standalone: true,
  imports: [],
  templateUrl: './hud.component.html',
  styleUrl: './hud.component.scss'
})
export class HudComponent {

  gameHUD: GameHUD;
  constructor(private gameProvider: GameProviderService, 
    zone: NgZone
  ) {
    
    this.gameHUD = gameProvider.getInstance().gameHUD;
  }
}
