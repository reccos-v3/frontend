import { Component, inject, output, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { TiebreakService } from '../../../../services/tiebreak.service';
import { ITiebreakResponse } from '../../../../interfaces/tiebreak.interface';

@Component({
  selector: 'app-setup-rules',
  imports: [CommonModule],
  templateUrl: './setup-rules.html',
  styleUrl: './setup-rules.css',
})
export class SetupRules {
  private tiebreakService = inject(TiebreakService);
  private platformId = inject(PLATFORM_ID);
  advanced = output<'rules' | 'format' | 'teams'>();

  availableTiebreaks = signal<ITiebreakResponse[]>([]);
  tiebreaks = signal<ITiebreakResponse[]>([]);
  showModal = signal(false);
  tempSelectedIds = signal<number[]>([]);

  ngOnInit() {
    this.getAllTiebreaks();
  }

  getAllTiebreaks() {
    if (isPlatformBrowser(this.platformId)) {
      this.tiebreakService.getAllTiebreaks().subscribe({
        next: (response) => {
          this.availableTiebreaks.set(response);
          // List starts completely empty as requested.
        },
        error: (error) => {
          console.error(error);
        },
      });
    }
  }

  dragIndex: number | null = null;
  dragOverIndex: number | null = null;

  openModal() {
    const selectedIds = this.tiebreaks().map((t) => t.id);

    // Ensure Points ID is always in the selection when opening
    const pointsItem = this.availableTiebreaks().find((t) => t.code === 'POINTS');
    if (pointsItem && !selectedIds.includes(pointsItem.id)) {
      selectedIds.push(pointsItem.id);
    }

    this.tempSelectedIds.set(selectedIds);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  toggleTiebreak(tiebreak: ITiebreakResponse) {
    if (tiebreak.code === 'POINTS') return; // Points is mandatory and fixed

    const current = this.tempSelectedIds();
    if (current.includes(tiebreak.id)) {
      this.tempSelectedIds.set(current.filter((id) => id !== tiebreak.id));
    } else {
      this.tempSelectedIds.set([...current, tiebreak.id]);
    }
  }

  isSelected(id: number): boolean {
    return this.tempSelectedIds().includes(id);
  }

  confirmSelection() {
    const selected = this.availableTiebreaks().filter(
      (t) => this.tempSelectedIds().includes(t.id) || t.code === 'POINTS',
    );

    // Ensure Points is always first
    const pointsIndex = selected.findIndex((t) => t.code === 'POINTS');
    if (pointsIndex > 0) {
      const points = selected.splice(pointsIndex, 1)[0];
      selected.unshift(points);
    }

    this.tiebreaks.set(selected);
    this.closeModal();
  }

  removeTiebreak(index: number) {
    const item = this.tiebreaks()[index];
    if (item?.code === 'POINTS') return; // Cannot remove points

    this.tiebreaks.update((list) => {
      const newList = [...list];
      newList.splice(index, 1);
      return newList;
    });
  }

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

  onDrop(index: number) {
    // Prevent dropping anything at index 0 (where Points is)
    // and prevent dragging Points (handled by draggable=false in template)
    if (index === 0) return;

    if (this.dragIndex !== null && this.dragIndex !== index && this.dragIndex !== 0) {
      this.tiebreaks.update((list) => {
        const newList = [...list];
        const item = newList[this.dragIndex!];
        newList.splice(this.dragIndex!, 1);
        newList.splice(index, 0, item);
        return newList;
      });
    }
    this.dragIndex = null;
    this.dragOverIndex = null;
  }

  saveAndContinue() {
    this.advanced.emit('format');
  }
}
