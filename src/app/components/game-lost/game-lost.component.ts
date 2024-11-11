import { Component, OnDestroy, ViewChild } from '@angular/core';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';
import { PressAComponent } from '../press-a/press-a.component';
import { CommonModule } from '@angular/common';
import { pauseSound, playSound } from '../../utilities/sound-utils';

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
        // Vibrate the gamepad
        gamepad.vibrationActuator.playEffect("dual-rumble", {
          startDelay: 0,
          duration: 750, // Vibration duration in milliseconds
          weakMagnitude: 0.5, // Weak motor intensity (0.0 to 1.0)
          strongMagnitude: 1, // Strong motor intensity (0.0 to 1.0)
        }).then(() => {
          console.log("Vibration complete");
        }).catch((err) => {
          console.error("Vibration failed", err);
        });
      }
    }

    if (this.pulseCount < 3) {
      this.pulseCount++;
      setTimeout(() => this.pulse(), 1500);
    }
  }

}
