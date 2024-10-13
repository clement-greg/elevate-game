import { Component } from '@angular/core';
import { ToolBarComponent } from '../tool-bar/tool-bar.component';

@Component({
  selector: 'app-win-game',
  standalone: true,
  imports: [],
  templateUrl: './win-game.component.html',
  styleUrl: './win-game.component.scss'
})
export class WinGameComponent {
  private message = `Thanks man!
  
  I'll get that refrigerator replaced right now`;
  id = ToolBarComponent.newid();

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
    }

  }
}
