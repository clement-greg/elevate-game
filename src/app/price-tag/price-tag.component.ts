import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-price-tag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './price-tag.component.html',
  styleUrl: './price-tag.component.scss'
})
export class PriceTagComponent {

  @Input() price: number;
}
