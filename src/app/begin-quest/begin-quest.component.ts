import { Component } from '@angular/core';

@Component({
  selector: 'app-begin-quest',
  standalone: true,
  imports: [],
  templateUrl: './begin-quest.component.html',
  styleUrl: './begin-quest.component.scss'
})
export class BeginQuestComponent {

  private message = `Jimmy!!!
  Bad news!  Your refrigerator is broken and I can't fix it.  
  
  My tools are scattered all over the place.
  
  But, if you can collect all my tools and buy a new refrigerator from the appliance store, I can get that fixed for you.`;

  constructor() {
    this.doWords();
  }

  wordIndex = 0;
  doWords() {
    if (!document.getElementById('construction-worker-message')) {
      setTimeout(() => this.doWords(), 100);
      return;
    }

    const div = document.getElementById('construction-worker-message');

    if(this.wordIndex < this.message.length) {
      this.wordIndex++;
      const msg = this.message.substring(0, this.wordIndex);
      div.innerText  = msg;
      setTimeout(()=> this.doWords(), 30);
    }

  }
}
