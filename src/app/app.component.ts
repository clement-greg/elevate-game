import { Component, HostListener } from '@angular/core';
import { Level1Component } from './level1/level1.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Level1Component, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent  {

  startGame = false;
  constructor() { }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === ' ' && !this.startGame) {
      this.startGame = true;
    }
  }

}
