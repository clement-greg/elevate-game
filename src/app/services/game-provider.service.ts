import { Injectable, NgZone } from '@angular/core';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class GameProviderService {

  constructor(private zone: NgZone) { }

  getInstance() {
    return Game.getInstance(this.zone);
  }
}
