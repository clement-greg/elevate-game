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

  private message = `Uh-oh, Jimmy! 🛠️🚨

Guess what? Your fridge has decided to take an early retirement, and my toolkit is doing a fantastic job of hiding from me! If you can gather my runaway tools and snag a brand-new fridge from the store, I’ll be right there to work my magic.

But hurry—those snacks won’t stay fresh forever! 🍏🍦🚀`;
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
