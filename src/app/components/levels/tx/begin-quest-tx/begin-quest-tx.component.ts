import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ToolBarComponent } from '../../../tool-bar/tool-bar.component';
import { LottiePlayerComponent } from '../../../lottie-player/lottie-player.component';
import { PressAComponent } from '../../../press-a/press-a.component';
import { pauseSound, playSound } from '../../../../models/utilities/sound-utils';
import { CommonModule } from '@angular/common';
import { newid } from '../../../../models/utilities/misc-utils';

@Component({
  selector: 'app-begin-quest-tx',
  standalone: true,
  imports: [LottiePlayerComponent, PressAComponent, CommonModule],
  templateUrl: './begin-quest-tx.component.html',
  styleUrl: './begin-quest-tx.component.scss'
})
export class BeginQuestTxComponent implements OnDestroy {

  statements = [
    `Uh‑oh, Jimmy! 🛠️🚨
Looks like your A/C done hung up its spurs and rode off into the sunset, and you’re fixin’ to sweat from your hairline clear down to your hind end.
And wouldn’t ya know it — my dang tools have gone missin’!
If you can round ’em up and mosey over to the store for a brand‑spankin’ new A/C, I’ll come on by and work my magic like a good ol’ Texas handyman.`,

`Bad news, partner…
You’re gonna need a whole heap o’ cash 💰.
These new A2L incompatibilities are rougher than a cactus saddle and liable to cost you thousands. 💰💰💰💰`,

`And one more thing — keep your eyes peeled for them no‑good warranty varmints.
Shady out‑of‑pocket charges, sneaky contract loopholes, and “gotcha” plan limits can leave you payin’ big bucks on a claim that’s supposed to be “covered.” 😡😡😡😡`
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

        }, 1500);
      } else {
        this.lottiePlayer.pause();
        pauseSound('synth-voice');
        this.showA = true;
      }
    }
  }
}
