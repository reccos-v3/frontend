import { Component, computed, input, model, output, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IPeriodCardConfig } from '../../../../../../interfaces/period-cards.interface';

@Component({
  selector: 'app-period-card',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './period-card.html',
  styleUrl: './period-card.css',
})
export class PeriodCard {
  tournament = input.required<IPeriodCardConfig>();

  startDate = model<string>('');
  endDate = model<string>('');

  valuesChange = output<{ start: string; end: string }>();

  constructor() {
    effect(() => {
      const vStart = this.startDate();
      const vEnd = this.endDate();

      this.valuesChange.emit({ start: vStart, end: vEnd });
    });
  }

  protected readonly controlNameStart = computed(
    () => this.tournament().title.toLowerCase().replace(/\s+/g, '-') + '-start',
  );

  protected readonly controlNameEnd = computed(
    () => this.tournament().title.toLowerCase().replace(/\s+/g, '-') + '-end',
  );
}
