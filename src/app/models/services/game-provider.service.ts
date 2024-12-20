import { Injectable, NgZone } from '@angular/core';
import { GameInstanceManager } from '../base/game-instance';

@Injectable({
  providedIn: 'root'
})
export class GameProviderService {

  constructor(private zone: NgZone) { }

  getInstance() {
    return GameInstanceManager.getInstance(this.zone);
  }
}
