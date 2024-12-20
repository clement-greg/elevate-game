import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';
import { ToolBarComponent } from '../tool-bar/tool-bar.component';
import { CommonModule } from '@angular/common';
import { pauseSound, playSound } from '../../models/utilities/sound-utils';

@Component({
  selector: 'app-eli-popup',
  standalone: true,
  imports: [LottiePlayerComponent, CommonModule],
  templateUrl: './eli-popup.component.html',
  styleUrl: './eli-popup.component.scss'
})
export class EliPopupComponent implements OnChanges {

  @Input() message: string;
  id: string = ToolBarComponent.newid();
  wordBubbleVisible = false; lastVoice = new Date(2020, 1, 1);
  @ViewChild('player') player: LottiePlayerComponent;
  @Output() messageComplete: EventEmitter<boolean> = new EventEmitter();


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message']?.currentValue) {
      this.wordBubbleVisible = true;
      setTimeout(() => this.doWords(), 500);
    }
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
      setTimeout(() => this.messageComplete.emit(true), 1500);
    }
  }
}
