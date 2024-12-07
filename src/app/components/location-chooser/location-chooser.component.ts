import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { JoystickState } from '../../models/joystick-state';
import { PressAComponent } from '../press-a/press-a.component';
import { playSound } from '../../utilities/sound-utils';

@Component({
  selector: 'app-location-chooser',
  standalone: true,
  imports: [PressAComponent],
  templateUrl: './location-chooser.component.html',
  styleUrl: './location-chooser.component.scss'
})
export class LocationChooserComponent implements OnDestroy {
  readonly dialogRef = inject(MatDialogRef<LocationChooserComponent>);

  location: 'AZ' | 'UT' | 'NV' = 'UT';
  joystickState = new JoystickState(0);

  constructor() {
    this.setupJoystick();
  }
  ngOnDestroy(): void {
    this.joystickState.dispose();
    delete this.joystickState;
  }

  setupJoystick() {
    this.joystickState.onButtonPress = this.joystickButtonPress.bind(this);
    this.joystickState.onLeftJoyStick = this.joystickLeftPress.bind(this);
    this.joystickState.onRightJoyStick = this.joystickRightPress.bind(this);
  }

  joystickButtonPress(btn: number) {
    switch (btn) {
      case 0:
        this.select();
        break;
      case 1:
        this.dialogRef.close();
        break;
    }
  }

  joystickLeftPress() {
    if (this.location === 'NV') {
      this.location = 'UT';
      playSound('menu-move', .5);
    } else if (this.location === 'UT') {
      this.location = 'AZ';
      playSound('menu-move', .5);
    } else {
      playSound('alert-sound', .3);
    }
  }

  joystickRightPress() {
    if (this.location === 'AZ') {
      this.location = 'UT';
      playSound('menu-move', .5);
    } else if (this.location === 'UT') {
      this.location = 'NV';
      playSound('menu-move', .5);
    } else {
      playSound('alert-sound', .3);
    }
  }

  get selectedIndex(): number {
    if (this.location === 'AZ') {
      return 0;
    }
    if (this.location === 'UT') {
      return 1;
    }
    if (this.location === 'NV') {
      return 2;
    }
    return 1;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      this.joystickLeftPress();
    }
    if (event.key === 'ArrowRight') {
      this.joystickRightPress();
    }
    if (event.key === 'b' || event.key === 'B') {
      this.dialogRef.close();
    }
    if (event.key === ' ') {
      this.select();
    }
  }

  select() {
    this.dialogRef.close(this.location);
  }
}
