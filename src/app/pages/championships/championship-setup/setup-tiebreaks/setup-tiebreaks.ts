import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITiebreakResponse } from '../../../../interfaces/tiebreak.interface';

@Component({
  selector: 'app-setup-tiebreaks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './setup-tiebreaks.html',
})
export class SetupTiebreaksComponent {
  tiebreaks = input.required<ITiebreakResponse[]>();

  openModal = output<void>();
  removeTiebreak = output<number>();
  reorderTiebreaks = output<{ from: number; to: number }>();

  dragIndex: number | null = null;
  dragOverIndex: number | null = null;

  onDragStart(index: number) {
    this.dragIndex = index;
  }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    this.dragOverIndex = index;
  }

  onDragLeave() {
    this.dragOverIndex = null;
  }

  onDrop(inputIndex: number) {
    if (inputIndex === 0) return;
    if (this.dragIndex !== null && this.dragIndex !== inputIndex && this.dragIndex !== 0) {
      this.reorderTiebreaks.emit({ from: this.dragIndex, to: inputIndex });
    }
    this.dragIndex = null;
    this.dragOverIndex = null;
  }
}
