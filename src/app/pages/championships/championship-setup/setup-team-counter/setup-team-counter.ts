import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-setup-team-counter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setup-team-counter.html',
  styleUrl: './setup-team-counter.css',
})
export class SetupTeamCounter {
  title = input.required<string>();
  description = input.required<string>();
  icon = input.required<string>();
  value = input.required<number>();
  label = input<string>('Participantes');

  updateValue = output<number>();
  manualInput = signal(false);

  setAbsoluteValue(event: Event) {
    const input = event.target as HTMLInputElement;
    const newValue = parseInt(input.value, 10);
    if (!isNaN(newValue)) {
      const diff = newValue - this.value();
      this.updateValue.emit(diff);
    }
  }
}
