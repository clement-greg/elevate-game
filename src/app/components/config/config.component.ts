import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Config } from '../../models/config';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, FormsModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatTabsModule, MatCheckboxModule, MatSelectModule],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss'
})
export class ConfigComponent {

  config = JSON.parse(JSON.stringify(Config.getInstance()));
  readonly dialogRef = inject(MatDialogRef<ConfigComponent>);
  levels = [
    'level1',
    'level2',
    'level3',
    'level4'
  ]

  save() {

    Config.setInstance(this.config);
    this.dialogRef.close(true);
  }

}
