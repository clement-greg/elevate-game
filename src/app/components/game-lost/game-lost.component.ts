import { Component } from '@angular/core';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';
import { PressAComponent } from '../press-a/press-a.component';

@Component({
  selector: 'app-game-lost',
  standalone: true,
  imports: [LottiePlayerComponent, PressAComponent],
  templateUrl: './game-lost.component.html',
  styleUrl: './game-lost.component.scss'
})
export class GameLostComponent {

}
