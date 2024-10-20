import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, HostListener, inject, ViewChild } from '@angular/core';
import { PriceTagComponent } from '../price-tag/price-tag.component';
import { Game } from '../../models/game';
import { MatDialogRef } from '@angular/material/dialog';
import { PressAComponent } from '../press-a/press-a.component';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, PriceTagComponent, PressAComponent, LottiePlayerComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent {

  readonly dialogRef = inject(MatDialogRef<ShopComponent>);
  selectedItem: any;
  @ViewChild('player') player: LottiePlayerComponent;
  wordBubbleVisible = true;

  items: Item[] = [
    {
      src: '/assets/images/refrigerator1.svg',
      price: 600,
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
  
  Any refrigerator will do, but remember: The nicer the refrigerator the happier you'll be.`;
  purchased = false;

  constructor() {
    this.doWords();
    this.selectedItem = this.items[0];

  }

  nextItem() {
    let index = this.items.indexOf(this.selectedItem);
    index++;
    if (index >= this.items.length) {
      //index = 0;
      index = this.items.length - 1;
    }
    this.selectedItem = this.items[index];
  }

  prevItem() {
    let index = this.items.indexOf(this.selectedItem);
    index--;
    if (index < 0) {
      //index = this.items.length - 1;
      index = 0;
    }
    this.selectedItem = this.items[index];
  }

  get selectedIndex() {
    return this.items.indexOf(this.selectedItem);
  }

  
  primaryButtonKeys = [' ', 'a', 'A'];

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' && !this.purchased) {
      this.prevItem();
    }
    if (event.key === 'ArrowRight' && !this.purchased) {
      this.nextItem();
    }
    if (this.primaryButtonKeys.indexOf(event.key) > -1) {
      this.purchase();
    }
  }

  purchase() {
    if(this.purchased) {
      return;
    }
    document.getElementById('speech').innerText = '';
    this.wordIndex = 0;
    this.player.seek(0);
    this.player.play();
    if (this.selectedItem.price > Game.getInstance().gameHUD.money) {
      const currencyPipe = new CurrencyPipe('en-US');
      const alert: HTMLAudioElement = document.getElementById('alert-sound') as HTMLAudioElement;
      alert.currentTime = 0;
      alert.play();
      this.wordBubbleVisible = false;
      setTimeout(()=> {
        this.wordBubbleVisible = true;
        setTimeout(()=> {
          this.message = `Oh sorry, you don't have enough money to buy that refrigerator.  
          That one costs ${currencyPipe.transform( this.selectedItem.price)} but you only have ${currencyPipe.transform( Game.getInstance().gameHUD.money)}
                `
                this.doWords();
        })
      }, 500);

      return;
    }
    const audio: HTMLAudioElement = document.getElementById('collect-tool-sound') as HTMLAudioElement;
    audio.currentTime = 0;
    audio.play();
    this.purchased = true;
    let index = this.items.indexOf(this.selectedItem) + 1;
    Game.getInstance().purchaseFridge(index);
    this.wordBubbleVisible = false;
    setTimeout(()=> {
      this.wordBubbleVisible = true;
      setTimeout(()=> {
        this.message = `Thanks for your purchase.  Come again soon.`;
        this.doWords();
        Game.getInstance().gameHUD.coinCount = Game.getInstance().gameHUD.coinCount -  (this.selectedItem.price / 10);
        setTimeout(() => this.dialogRef.close(), 2500);
      });
    }, 500);

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
    } else {
      this.player.pause();
    }

  }

}

class Item {
  src: string;//'/assets/images/refrigerator1.svg',
  price: number;
  title: string;
}
