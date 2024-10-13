import { Injectable, NgZone } from '@angular/core';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class GameProviderService {

  constructor(private zone: NgZone) { }

  getInstance() {
    console.log(12);
    return Game.getInstance(this.zone);
  }
}
