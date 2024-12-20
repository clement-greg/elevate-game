import { Component, OnDestroy, ViewChild } from '@angular/core';
import { LottiePlayerComponent } from '../../../lottie-player/lottie-player.component';
import { PressAComponent } from '../../../press-a/press-a.component';
import { ToolBarComponent } from '../../../tool-bar/tool-bar.component';
import { pauseSound, playSound } from '../../../../models/utilities/sound-utils';
import { newid } from '../../../../models/utilities/misc-utils';


@Component({
  selector: 'app-nv-not-complete',
  standalone: true,
  imports: [LottiePlayerComponent, PressAComponent],
  templateUrl: './nv-not-complete.component.html',
  styleUrl: './nv-not-complete.component.scss'
})
export class NvNotCompleteComponent implements OnDestroy {
  private message = `You're not done yet!
  
  Collect all the tools and then buy a refrigerator.  Once your done with those two things, come back here.`;
  id = newid();

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
