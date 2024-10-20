import { Component, ViewChild } from '@angular/core';
import { ToolBarComponent } from '../tool-bar/tool-bar.component';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';
import { PressAComponent } from '../press-a/press-a.component';

@Component({
  selector: 'app-begin-quest',
  standalone: true,
  imports: [LottiePlayerComponent, PressAComponent],
  templateUrl: './begin-quest.component.html',
  styleUrl: './begin-quest.component.scss'
})
export class BeginQuestComponent {

  private message = `Jimmy!!!
  Bad news!  Your refrigerator is broken and I can't fix it.  
  
  My tools are scattered all over the place.
  
  But, if you can collect all my tools and buy a new refrigerator from the appliance store, I can get that fixed for you.
  
  Better hurry, you're foods going to spoil soon.`;
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
