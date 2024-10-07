import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PriceTagComponent } from '../price-tag/price-tag.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, PriceTagComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent {

  items: Item[] = [
    {src: '/assets/images/refrigerator1.svg',
      price: 600,
      title: 'Whirlpool'
    },
    {src: '/assets/images/refrigerator2.svg',
      price: 850,
      title: 'LG'
    },
    
    {src: '/assets/images/refrigerator3.svg',
      price: 1200,
      title: 'Thermador'
    },
    

  ];
  private message = `Here is the text that I want to appear.  It should come in one character at a time and make it look like the construction worker is speaking the words to you.  
  
  We will see if it works.  But I don't know.  I will have to make it work.`;

  constructor() {
    this.doWords();
  }

  wordIndex = 0;
  doWords() {
    if (!document.getElementById('speech')) {
      setTimeout(() => this.doWords(), 100);
      return;
    }

    const div = document.getElementById('speech');

    if(this.wordIndex < this.message.length) {
      this.wordIndex++;
      const msg = this.message.substring(0, this.wordIndex);
      div.innerText  = msg;
      setTimeout(()=> this.doWords(), 30);
    }

  }

}

class Item {
  src: string;//'/assets/images/refrigerator1.svg',
  price: number;
  title: string;
}
