import { Component, input } from '@angular/core';

@Component({
  selector: 'app-setup-system-format',
  imports: [],
  templateUrl: './setup-system-format.html',
  styleUrl: './setup-system-format.css',
})
export class SetupSystemFormat {
  format = input<string>('groups_knockout');
}
