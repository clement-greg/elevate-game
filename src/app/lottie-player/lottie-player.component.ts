import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { ToolBarComponent } from '../utilities/tool-bar/tool-bar.component';

@Component({
  selector: 'app-lottie-player',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './lottie-player.component.html',
  styleUrl: './lottie-player.component.scss'
})
export class LottiePlayerComponent implements AfterViewInit {
    @Input() height: string = 'unset';
    @Input() src: string;
    @Input() speed: number = 1;
    @Input() loop: boolean | number = true;
    @Input() autoPlay: boolean = true;
    @Input() intermission: number = 0;
    id = ToolBarComponent.newid();

    show = false;
    constructor() {
    }
    ngAfterViewInit(): void {
        setTimeout(()=> this.show = true);
        //this.show = true;
    }

    pause() {
      (document.getElementById(this.id) as any).pause();
    }
}
