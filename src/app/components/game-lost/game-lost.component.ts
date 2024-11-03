import { Component, ViewChild } from '@angular/core';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';
import { PressAComponent } from '../press-a/press-a.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-lost',
  standalone: true,
  imports: [LottiePlayerComponent, PressAComponent, CommonModule],
  templateUrl: './game-lost.component.html',
  styleUrl: './game-lost.component.scss'
})
export class GameLostComponent {
  showNextText = false;
  showPressA = false;
  @ViewChild('jimmy') jimmy: LottiePlayerComponent;
  constructor() {
    setTimeout(() => this.showNextText = true, 1500);
    setTimeout(() => this.showPressA = true, 3500);
    setTimeout(() => this.jimmy.play(), 2000);
  }

}
