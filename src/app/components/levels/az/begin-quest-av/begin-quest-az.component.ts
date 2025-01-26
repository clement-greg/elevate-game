import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ToolBarComponent } from '../../../tool-bar/tool-bar.component';
import { LottiePlayerComponent } from '../../../lottie-player/lottie-player.component';
import { PressAComponent } from '../../../press-a/press-a.component';
import { pauseSound, playSound } from '../../../../models/utilities/sound-utils';
import { CommonModule } from '@angular/common';
import { newid } from '../../../../models/utilities/misc-utils';

@Component({
  selector: 'app-begin-quest-az',
  standalone: true,
  imports: [LottiePlayerComponent, PressAComponent, CommonModule],
  templateUrl: './begin-quest-az.component.html',
  styleUrl: './begin-quest-az.component.scss'
})
export class BeginQuestAzComponent implements OnDestroy {

  statements = [
    `Uh-oh, Jimmy! 🛠️🚨

Guess what? Your A/C has decided to take an early retirement, and you're going to be sweating from head to crack. My tools are lost! If you can gather them and snag a brand-new A/C from the store, I’ll be right there to work my magic.`,
    `Bad news Bruh! You're going to need a lot of coin 💰.
  The new A2L incompatabilities are going to end up costing you thousands. 💰💰💰💰`,
    `Oh, and look out for the dirt-bag warranty guys. Sketchy out of pocket costs, contract loopholes and plan limits could end up costing you thousands on a 'Covered' warranty claim😡😡😡😡😡`
  ];
  id = newid();
  statementNumber = 0;
  showA = false;

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
        pauseSound('synth-voice');
        setTimeout(() => {
          playSound('synth-voice');
          this.lastVoice = new Date(2020, 1, 1);
          this.lottiePlayer.play();
          document.getElementById(this.id).innerText = '';
          this.wordIndex = 0;
          this.statementNumber++;

          this.doWords();

        }, 1000);
      } else {
        this.lottiePlayer.pause();
        pauseSound('synth-voice');
        this.showA = true;
        console.log('here')
      }
    }
  }
}
