import { Component } from '@angular/core';
import { pauseSound } from '../../models/utilities/sound-utils';

@Component({
  selector: 'app-title-screen',
  standalone: true,
  imports: [],
  templateUrl: './title-screen.component.html',
  styleUrl: './title-screen.component.scss'
})
export class TitleScreenComponent {

  constructor() {
    pauseSound('synth-voice');
  }
}
