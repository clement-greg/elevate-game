import { Component, ViewChild } from '@angular/core';
import { ToolBarComponent } from '../tool-bar/tool-bar.component';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';
import { PressAComponent } from '../press-a/press-a.component';

@Component({
  selector: 'app-not-complete',
  standalone: true,
  imports: [LottiePlayerComponent, PressAComponent],
  templateUrl: './not-complete.component.html',
  styleUrl: './not-complete.component.scss'
})
export class NotCompleteComponent {
  private message = `You're not done yet!
  
  Collect all the tools and then buy a refrigerator.  Once your done with those two things, come back here.`;
  id = ToolBarComponent.newid();

  @ViewChild('lottiePlayer') lottiePlayer :LottiePlayerComponent;

  constructor() {
    this.doWords();
  }

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
      setTimeout(()=> this.doWords(), 30);
    } else {
      this.lottiePlayer.pause();
    }

  }
}
