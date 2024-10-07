import { Component } from '@angular/core';

@Component({
  selector: 'app-begin-quest',
  standalone: true,
  imports: [],
  templateUrl: './begin-quest.component.html',
  styleUrl: './begin-quest.component.scss'
})
export class BeginQuestComponent {

  private message = `Here is the text that I want to appear.  It should come in one character at a time and make it look like the construction worker is speaking the words to you.  
  
  We will see if it works.  But I don't know.  I will have to make it work.`;

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
