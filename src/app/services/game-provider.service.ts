import { Injectable, NgZone } from '@angular/core';
import { GameInstanceManager } from '../models/game-instance';

@Injectable({
  providedIn: 'root'
})
export class GameProviderService {

  constructor(private zone: NgZone) { }

  getInstance() {
    return GameInstanceManager.getInstance(this.zone);
  }
}
