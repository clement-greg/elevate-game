import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-press-a',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './press-a.component.html',
  styleUrl: './press-a.component.scss'
})
export class PressAComponent {
  @Input() wording = '[Press A To Continue]';
  @Input() color = 'blue';

}
