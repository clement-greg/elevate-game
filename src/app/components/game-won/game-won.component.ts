import { Component } from '@angular/core';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';
import { PressAComponent } from '../press-a/press-a.component';
import { CommonModule } from '@angular/common';
import { Game } from '../../models/game';
import { pauseSound } from '../../utilities/sound-utils';

@Component({
  selector: 'app-game-won',
  standalone: true,
  imports: [LottiePlayerComponent, PressAComponent, CommonModule],
  templateUrl: './game-won.component.html',
  styleUrl: './game-won.component.scss'
})
export class GameWonComponent {

  showNextText = false;
  showPressA = false;
  constructor() {
    setTimeout(() => this.showNextText = true, 1500);
    setTimeout(() => this.showPressA = true, 4500);
    pauseSound('warning-sound-game-end');
  }

  get stars() {
    return Game.lastStars;
  }

}
