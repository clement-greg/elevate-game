import { Component } from '@angular/core';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';
import { PressAComponent } from '../press-a/press-a.component';

@Component({
  selector: 'app-game-won',
  standalone: true,
  imports: [LottiePlayerComponent, PressAComponent],
  templateUrl: './game-won.component.html',
  styleUrl: './game-won.component.scss'
})
export class GameWonComponent {

}
