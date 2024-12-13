import { Component, OnDestroy, ViewChild } from '@angular/core';
import { LottiePlayerComponent } from '../../../lottie-player/lottie-player.component';
import { PressAComponent } from '../../../press-a/press-a.component';
import { ToolBarComponent } from '../../../tool-bar/tool-bar.component';
import { pauseSound, playSound } from '../../../../utilities/sound-utils';


@Component({
  selector: 'app-az-not-complete',
  standalone: true,
  imports: [LottiePlayerComponent, PressAComponent],
  templateUrl: './az-not-complete.component.html',
  styleUrl: './az-not-complete.component.scss'
})
export class AzNotCompleteComponent implements OnDestroy {
  private message = `You're not done yet!
  
  Collect all the tools and then buy an A/C.  Once your done with those two things, come back here.`;
  id = ToolBarComponent.newid();

  @ViewChild('lottiePlayer') lottiePlayer :LottiePlayerComponent;

  constructor() {
    this.doWords();
  }
  ngOnDestroy(): void {
    pauseSound('synth-voice');
  }

  lastVoice = new Date(2020, 1, 1);

  wordIndex = 0;
  doWords() {
    if (!document.getElementById(this.id)) {
      setTimeout(() => this.doWords(), 100);

      return;
    }

    const div = document.getElementById(this.id);

    if(this.wordIndex < this.message.length) {
      this.wordIndex++;
      const msg = this.message.substring(0, this.wordIndex);
      div.innerText  = msg;
      if (new Date().getTime() - this.lastVoice.getTime() > 11000) {
        playSound('synth-voice');
        this.lastVoice = new Date();
      }
      setTimeout(()=> this.doWords(), 30);
    } else {
      this.lottiePlayer.pause();
      pauseSound('synth-voice');
    }

  }
}
