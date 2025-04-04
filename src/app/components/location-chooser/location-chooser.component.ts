import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { JoystickState } from '../../models/utilities/joystick-state';
import { PressAComponent } from '../press-a/press-a.component';
import { playSound } from '../../models/utilities/sound-utils';
import { newid } from '../../models/utilities/misc-utils';

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
  utahId = newid();
  nvId = newid();
  azId = newid();

  constructor() {
    this.setupJoystick();
    this.setVideoState();
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
    this.setVideoState();
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
    this.setVideoState();
  }

  setVideoState() {

    const utVideo = document.getElementById(this.utahId) as HTMLVideoElement;
    const nvVideo = document.getElementById(this.nvId) as HTMLVideoElement;
    const azVideo = document.getElementById(this.azId) as HTMLVideoElement;

    if (!utVideo) {
      setTimeout(() => this.setVideoState(), 50);
      return;
    }
    switch (this.location) {
      case 'UT':
        utVideo.loop = true;
        utVideo.play();
        nvVideo.pause();
        azVideo.pause();
        break;
      case 'AZ':
        utVideo.pause();
        nvVideo.pause();
        azVideo.loop = true;
        azVideo.play();
        break;
      case 'NV':
        nvVideo.loop = true;
        nvVideo.play();
        utVideo.pause();
        azVideo.pause();
        break;
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
    if (event.key === ' ' || event.key === 'a' || event.key === 'A') {
      this.select();
    }
  }

  select() {
    this.dialogRef.close(this.location);
  }
}
