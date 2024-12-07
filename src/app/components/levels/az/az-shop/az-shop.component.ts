import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, ViewChild } from '@angular/core';
import { PriceTagComponent } from '../../../price-tag/price-tag.component';
import { MatDialogRef } from '@angular/material/dialog';
import { PressAComponent } from '../../../press-a/press-a.component';
import { LottiePlayerComponent } from '../../../lottie-player/lottie-player.component';
import { ToolBarComponent } from '../../../tool-bar/tool-bar.component';
import { pauseSound, playSound } from '../../../../utilities/sound-utils';
import { JoystickState } from '../../../../models/joystick-state';
import { GameInstanceManager } from '../../../../models/game-instance';

@Component({
  selector: 'app-nv-shop',
  standalone: true,
  imports: [CommonModule, PriceTagComponent, PressAComponent, LottiePlayerComponent],
  templateUrl: './az-shop.component.html',
  styleUrl: './az-shop.component.scss'
})
export class AzShopComponent implements OnDestroy {

  readonly dialogRef = inject(MatDialogRef<AzShopComponent>);
  selectedItem: any;
  @ViewChild('player') player: LottiePlayerComponent;
  wordBubbleVisible = true;
  id = ToolBarComponent.newid();

  items: Item[] = [
    {
      src: '/assets/images/refrigerator1.svg',
      price: 1200,
      title: 'Whirlpool'
    },
    {
      src: '/assets/images/refrigerator2.svg',
      price: 2000,
      title: 'LG'
    },

    {
      src: '/assets/images/refrigerator3.svg',
      price: 3000,
      title: 'Thermador'
    },


  ];
  private message = `Hey Jimmy!

Welcome to Elevate Appliances! 🎉 We've just rolled in some fabulous new refrigerators, and they're looking for a new home. 🏠

Wander through our collection, pick your favorite, and head to checkout. Any fridge will do, but here’s a tip: the fancier the fridge, the bigger the smiles. 😊✨

Happy fridge hunting! 🚀`;
  purchased = false;

  joystickState = new JoystickState(0);

  constructor() {
    this.doWords();
    this.selectedItem = this.items[0];

    this.joystickState.onButtonPress = this.joystickButtonPress.bind(this);
    this.joystickState.onLeftJoyStick = this.prevItem.bind(this);
    this.joystickState.onRightJoyStick = this.nextItem.bind(this);
  }

  lastVoice = new Date(2020, 1, 1);



  ngOnDestroy(): void {
    delete this.joystickState.onButtonPress;
    delete this.joystickState.onLeftJoyStick;
    delete this.joystickState.onRightJoyStick;

    delete this.joystickState;
    clearTimeout(this.wordsTimeout);
    pauseSound('synth-voice');
  }

  joystickButtonPress(button: number) {
    if (button === 0) {
      this.purchase();
    }
  }

  nextItem() {
    let index = this.items.indexOf(this.selectedItem);
    index++;
    if (index >= this.items.length) {
      index = this.items.length - 1;
      playSound('alert-sound', .3);
    } else {
      playSound('menu-move', .5);
    }
    this.selectedItem = this.items[index];
  }

  prevItem() {
    let index = this.items.indexOf(this.selectedItem);
    index--;
    if (index < 0) {
      index = 0;
      playSound('alert-sound', .3);
    } else {
      playSound('menu-move', .5);
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
    if (this.purchased) {
      return;
    }
    document.getElementById(this.id).innerText = '';
    this.wordIndex = 0;
    this.player.seek(0);
    this.player.play();
    if (this.selectedItem.price > GameInstanceManager.getInstance().gameHUD.money) {
      const currencyPipe = new CurrencyPipe('en-US');
      playSound('alert-sound');
      this.wordBubbleVisible = false;
      setTimeout(() => {
        this.wordBubbleVisible = true;
        setTimeout(() => {
          this.message = `Oh sorry, you don't have enough money to buy that refrigerator.  
          That one costs ${currencyPipe.transform(this.selectedItem.price)} but you only have ${currencyPipe.transform(GameInstanceManager.getInstance().gameHUD.money)}
                `
          this.doWords();
        })
      }, 500);

      return;
    }
    playSound('collect-tool-sound');
    this.purchased = true;
    let index = this.items.indexOf(this.selectedItem) + 1;
    GameInstanceManager.getInstance().purchaseFridge(index);
    this.wordBubbleVisible = false;
    setTimeout(() => {
      this.wordBubbleVisible = true;
      setTimeout(() => {
        this.message = `Thanks for your purchase.  Come again soon.`;
        this.doWords();
        GameInstanceManager.getInstance().gameHUD.coinCount = GameInstanceManager.getInstance().gameHUD.coinCount - (this.selectedItem.price / 20);
        setTimeout(() => this.dialogRef.close(), 2500);
      });
    }, 500);

  }

  get selectorPosition() {
    return `translateX(${(97 + (this.selectedIndex * 300))}px)`;
  }

  wordIndex = 0;
  wordsTimeout: any;

  doWords() {
    if (!document.getElementById(this.id)) {
      this.wordsTimeout = setTimeout(() => this.doWords(), 100);
      return;
    }

    const div = document.getElementById(this.id);

    if (this.wordIndex < this.message.length) {
      this.wordIndex++;
      const msg = this.message.substring(0, this.wordIndex);
      div.innerText = msg;
      this.wordsTimeout = setTimeout(() => this.doWords(), 30);
      if (new Date().getTime() - this.lastVoice.getTime() > 11000) {

        playSound('synth-voice');
        this.lastVoice = new Date();
      }
    } else {
      this.player.pause();
      pauseSound('synth-voice');
    }
  }
}

class Item {
  src: string;
  price: number;
  title: string;
}
