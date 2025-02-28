import { Component, OnDestroy, ViewChild } from '@angular/core';
import { LottiePlayerComponent } from '../../../lottie-player/lottie-player.component';
import { PressAComponent } from '../../../press-a/press-a.component';
import { ToolBarComponent } from '../../../tool-bar/tool-bar.component';
import { pauseSound, playSound } from '../../../../models/utilities/sound-utils';
import { newid } from '../../../../models/utilities/misc-utils';


@Component({
  selector: 'app-begin-quest',
  standalone: true,
  imports: [LottiePlayerComponent, PressAComponent],
  templateUrl: './begin-quest.component.html',
  styleUrl: './begin-quest.component.scss'
})
export class BeginQuestComponent implements OnDestroy {

  statements = [
    `Uh-oh, Jimmy! 🛠️🚨

Guess what? Your fridge has decided to take an early retirement, and my toolkit is doing a fantastic job of hiding from me! If you can gather my runaway tools and snag a brand-new fridge from the store, I’ll be right there to work my magic.

But hurry—those snacks won’t stay fresh forever! 🍏🍦🚀`,
    `Oh, and look out for the old school warranty guys. Contract fine print could cost you thousands in unexpected costs!😡😡😡😡😡`
  ];
  id = newid();
  statementNumber = 0;

  @ViewChild('lottiePlayer') lottiePlayer: LottiePlayerComponent;

  constructor() {
    this.doWords();
  }
  ngOnDestroy(): void {
    
    pauseSound('synth-voice');
  }
  get message() {
    return this.statements[this.statementNumber];
  }

  wordIndex = 0;
  lastVoice = new Date(2020, 1, 1);

  doWords() {
    if (!document.getElementById(this.id)) {
      setTimeout(() => this.doWords(), 100);
      return;
    }

    const div = document.getElementById(this.id);

    if (this.wordIndex < this.message.length) {
      this.wordIndex++;
      const msg = this.message.substring(0, this.wordIndex);
      div.innerText = msg;
      if (new Date().getTime() - this.lastVoice.getTime() > 11000) {
        playSound('synth-voice');
        this.lastVoice = new Date();
      }
      setTimeout(() => this.doWords(), 30);
    } else {
      if (this.statementNumber < this.statements.length - 1) {

        this.lottiePlayer.pause();

        setTimeout(() => {
          this.lastVoice = new Date(2020, 1, 1);
          this.lottiePlayer.play();
          document.getElementById(this.id).innerText = '';
          this.wordIndex = 0;
          this.statementNumber++;

          this.doWords();

        }, 500);
      } else {
        this.lottiePlayer.pause();
        pauseSound('synth-voice');
      }
    }
  }
}
