import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { PriceTagComponent } from '../price-tag/price-tag.component';
import { Game } from '../../models/game';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, PriceTagComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent {

  readonly dialogRef = inject(MatDialogRef<ShopComponent>);
  selectedItem: any;

  items: Item[] = [
    {
      src: '/assets/images/refrigerator1.svg',
      price: 30,
      title: 'Whirlpool'
    },
    {
      src: '/assets/images/refrigerator2.svg',
      price: 850,
      title: 'LG'
    },

    {
      src: '/assets/images/refrigerator3.svg',
      price: 1200,
      title: 'Thermador'
    },


  ];
  private message = `Hi Jimmy
  Welcome to Elevate Appliances.  We just got some great new refrigerators in stock.
  
  Find the refrigerator you want and then check out.  
  
  Any refrigerator will do, but remember: The nicer the appliance the happier the customer.`;
  purchased = false;

  constructor() {
    this.doWords();
    this.selectedItem = this.items[0];

  }

  nextItem() {
    let index = this.items.indexOf(this.selectedItem);
    index++;
    if (index >= this.items.length) {
      index = 0;
    }
    this.selectedItem = this.items[index];
  }

  prevItem() {
    let index = this.items.indexOf(this.selectedItem);
    index--;
    if (index < 0) {
      index = this.items.length - 1;
    }
    this.selectedItem = this.items[index];
  }

  get selectedIndex() {
    return this.items.indexOf(this.selectedItem);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' && !this.purchased) {
      this.prevItem();
    }
    if (event.key === 'ArrowRight' && !this.purchased) {
      this.nextItem();
    }
    if (event.key === ' ') {
      this.purchase();
    }
  }

  purchase() {
    if(this.purchased) {
      return;
    }
    document.getElementById('speech').innerText = '';
    this.wordIndex = 0;
    if (this.selectedItem.price > Game.getInstance().gameHUD.money) {
      this.message = `Oh sorry, you don't have enough money to buy that refrigerator.  
That one costs ${this.selectedItem.price} but you only have ${Game.getInstance().gameHUD.money}
      `
      this.doWords();
      return;
    }
    this.purchased = true;
    let index = this.items.indexOf(this.selectedItem) + 1;
    Game.getInstance().purchaseFridge(index);
    this.message = `Thanks for your purchase.  Come again soon.`;
    this.doWords();
    Game.getInstance().gameHUD.coinCount = Game.getInstance().gameHUD.coinCount -  (this.selectedItem.price / 10);
    setTimeout(() => this.dialogRef.close(), 4000);
  }

  get selectorPosition() {
    return `translateX(${(97 + (this.selectedIndex * 300))}px)`;
  }

  wordIndex = 0;
  doWords() {
    if (!document.getElementById('speech')) {
      setTimeout(() => this.doWords(), 100);
      return;
    }

    const div = document.getElementById('speech');

    if (this.wordIndex < this.message.length) {
      this.wordIndex++;
      const msg = this.message.substring(0, this.wordIndex);
      div.innerText = msg;
      setTimeout(() => this.doWords(), 30);
    }

  }

}

class Item {
  src: string;//'/assets/images/refrigerator1.svg',
  price: number;
  title: string;
}
