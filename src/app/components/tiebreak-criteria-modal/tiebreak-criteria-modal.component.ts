import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITiebreakResponse } from '../../interfaces/tiebreak.interface';

@Component({
  selector: 'app-tiebreak-criteria-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tiebreak-criteria-modal.component.html',
})
export class TiebreakCriteriaModalComponent {
  availableTiebreaks = input.required<ITiebreakResponse[]>();
  initialSelectedIds = input<number[]>([]);

  modalClose = output<void>();
  modalConfirm = output<number[]>();

  tempSelectedIds = signal<number[]>([]);

  constructor() {
    effect(
      () => {
        const initial = this.initialSelectedIds();
        this.tempSelectedIds.set([...initial]);
      },
      { allowSignalWrites: true },
    );
  }

  closeModal() {
    this.modalClose.emit();
  }

  toggleTiebreak(tiebreak: ITiebreakResponse) {
    if (tiebreak.code === 'POINTS') return;

    this.tempSelectedIds.update((ids) => {
      if (ids.includes(tiebreak.id)) {
        return ids.filter((id) => id !== tiebreak.id);
      } else {
        return [...ids, tiebreak.id];
      }
    });
  }

  isSelected(id: number): boolean {
    return this.tempSelectedIds().includes(id);
  }

  confirmSelection() {
    this.modalConfirm.emit(this.tempSelectedIds());
  }
}
