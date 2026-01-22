import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-setup-team-counter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './setup-team-counter.html',
})
export class SetupTeamCounter {
  title = input.required<string>();
  description = input.required<string>();
  icon = input.required<string>();
  value = input.required<number>();
  label = input<string>('Participantes');

  updateValue = output<number>();
}
