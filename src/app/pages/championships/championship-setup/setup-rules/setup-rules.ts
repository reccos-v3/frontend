import { Component, effect, inject, output, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { TiebreakService } from '../../../../services/tiebreak.service';
import { ITiebreakResponse } from '../../../../interfaces/tiebreak.interface';
import { SetupStep, IChampionshipSetupRequest } from '../setup-types';
import { ModalityService } from '../../../../services/modality.service';
import { SeasonService } from '../../../../services/season.service';
import { IModalityResponse } from '../../../../interfaces/modality.interface';
import { ISeasonResponse } from '../../../../interfaces/season.interface';

@Component({
  selector: 'app-setup-rules',
  imports: [CommonModule],
  templateUrl: './setup-rules.html',
  styleUrl: './setup-rules.css',
})
export class SetupRules {
  private tiebreakService = inject(TiebreakService);
  private modalityService = inject(ModalityService);
  private seasonService = inject(SeasonService);
  private platformId = inject(PLATFORM_ID);

  advanced = output<SetupStep>();
  valid = output<boolean>();
  dataUpdate = output<Partial<IChampionshipSetupRequest>>();

  // Basics
  name = signal('');
  modalityId = signal('');
  gender = signal('MALE');
  type = signal('SEASONAL');
  seasonId = signal('');

  // Rules
  pointsWin = signal(3);
  pointsDraw = signal(1);
  pointsLoss = signal(0);
  hasHomeAway = signal(true);

  modalities = signal<IModalityResponse[]>([]);
  seasons = signal<ISeasonResponse[]>([]);

  availableTiebreaks = signal<ITiebreakResponse[]>([]);
  tiebreaks = signal<ITiebreakResponse[]>([]);
  showModal = signal(false);
  tempSelectedIds = signal<number[]>([]);

  ngOnInit() {
    this.getAllTiebreaks();
    this.getModalities();
    this.getSeasons();
  }

  getModalities() {
    this.modalityService.getAllModalities().subscribe((res) => this.modalities.set(res));
  }

  getSeasons() {
    this.seasonService.getSeasonsByFederationId().subscribe((res) => this.seasons.set(res));
  }

  getAllTiebreaks() {
    if (isPlatformBrowser(this.platformId)) {
      this.tiebreakService.getAllTiebreaks().subscribe({
        next: (response) => {
          this.availableTiebreaks.set(response);
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
    if (tiebreak.code === 'POINTS') return;
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
    if (item?.code === 'POINTS') return;
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

  onDrop(inputIndex: number) {
    if (inputIndex === 0) return;
    if (this.dragIndex !== null && this.dragIndex !== inputIndex && this.dragIndex !== 0) {
      this.tiebreaks.update((list) => {
        const newList = [...list];
        const item = newList[this.dragIndex!];
        newList.splice(this.dragIndex!, 1);
        newList.splice(inputIndex, 0, item);
        return newList;
      });
    }
    this.dragIndex = null;
    this.dragOverIndex = null;
  }

  isValid = signal(false);

  constructor() {
    effect(
      () => {
        const valid = this.name().length >= 3 && this.modalityId() !== '' && this.seasonId() !== '';
        this.isValid.set(valid);
        this.valid.emit(valid);
      },
      { allowSignalWrites: true },
    );
  }

  saveAndContinue() {
    if (this.isValid()) {
      this.dataUpdate.emit({
        basics: {
          name: this.name(),
          modalityId: this.modalityId(),
          gender: this.gender(),
          type: this.type(),
          seasonId: this.seasonId(),
        },
        rules: {
          pointsWin: this.pointsWin(),
          pointsDraw: this.pointsDraw(),
          pointsLoss: this.pointsLoss(),
          hasHomeAway: this.hasHomeAway(),
          tieBreakerOrder: this.tiebreaks().map((t) => t.id.toString()),
        },
        tiebreaks: {
          criteria: this.tiebreaks().map((t, index) => ({
            criteriaId: t.id.toString(),
            priorityOrder: index + 1,
          })),
        },
      });
      this.advanced.emit('format');
    }
  }
}
