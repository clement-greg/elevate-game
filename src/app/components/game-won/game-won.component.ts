import { Component, Input, OnDestroy } from '@angular/core';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';
import { PressAComponent } from '../press-a/press-a.component';
import { CommonModule } from '@angular/common';
import { pauseSound, playSound } from '../../utilities/sound-utils';
import { GameInstanceManager } from '../../models/game-instance';

@Component({
  selector: 'app-game-won',
  standalone: true,
  imports: [LottiePlayerComponent, PressAComponent, CommonModule],
  templateUrl: './game-won.component.html',
  styleUrl: './game-won.component.scss'
})
export class GameWonComponent implements OnDestroy {

  showNextText = false;
  showPressA = false;
  @Input() location: 'AZ' | 'UT' | 'NV' = 'UT';

  constructor() {
    setTimeout(() => this.showNextText = true, 1500);
    setTimeout(() => this.showPressA = true, 4500);
    pauseSound('warning-sound-game-end');
    playSound('bg-music-primary', .2);
  }
  ngOnDestroy(): void {
    pauseSound('bg-music-primary');
  }

  get stars() {

    return GameInstanceManager.lastStars;
  }

}
