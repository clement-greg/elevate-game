import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';
import { PressAComponent } from '../press-a/press-a.component';
import { CommonModule } from '@angular/common';
import { pauseSound, playSound } from '../../models/utilities/sound-utils';

@Component({
  selector: 'app-game-lost',
  standalone: true,
  imports: [LottiePlayerComponent, PressAComponent, CommonModule],
  templateUrl: './game-lost.component.html',
  styleUrl: './game-lost.component.scss'
})
export class GameLostComponent implements OnDestroy {
  showNextText = false;
  showPressA = false;
  pulseCount = 0;
  @ViewChild('jimmy') jimmy: LottiePlayerComponent;
  @Input() location: 'AZ' | 'UT' | 'NV' = 'UT';

  constructor() {
    setTimeout(() => this.showNextText = true, 1500);
    setTimeout(() => this.showPressA = true, 3500);
    setTimeout(() => this.jimmy.play(), 2000);
    pauseSound('warning-sound-game-end');
    playSound('bg-music-lost', .2);
    this.pulse();
  }
  ngOnDestroy(): void {
    pauseSound('bg-music-lost');
  }

  pulse() {
    const gamepad = navigator.getGamepads()[0];
    if (gamepad) {
      if (gamepad.vibrationActuator) {
        gamepad.vibrationActuator.playEffect("dual-rumble", {
          startDelay: 0,
          duration: 750,
          weakMagnitude: 0.5,
          strongMagnitude: 1,
        }).then(() => { }).catch((err) => { });
      }
    }

    if (this.pulseCount < 3) {
      this.pulseCount++;
      setTimeout(() => this.pulse(), 1500);
    }
  }

}
