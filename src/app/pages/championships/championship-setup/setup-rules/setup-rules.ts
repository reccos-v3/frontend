import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { TiebreakService } from '../../../../services/tiebreak.service';
import { ITiebreakResponse } from '../../../../interfaces/tiebreak.interface';
import { SetupStep, IChampionshipSetupRequest } from '../setup-types';
import { ModalityService } from '../../../../services/modality.service';
import { SeasonService } from '../../../../services/season.service';
import { IModalityResponse } from '../../../../interfaces/modality.interface';
import { ISeasonResponse } from '../../../../interfaces/season.interface';

@Component({
  selector: 'app-setup-rules',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './setup-rules.html',
  styleUrl: './setup-rules.css',
})
export class SetupRules implements OnInit {
  private tiebreakService = inject(TiebreakService);
  private modalityService = inject(ModalityService);
  private seasonService = inject(SeasonService);
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);

  advanced = output<SetupStep>();
  valid = output<boolean>();
  dataUpdate = output<Partial<IChampionshipSetupRequest>>();
  data = input<IChampionshipSetupRequest>();

  // Basics
  name = signal('');
  modalityId = signal('');
  gender = signal('MALE');
  type = signal('SEASONAL');
  seasonId = signal('');

  // Rules Form
  rulesForm: FormGroup;

  modalities = signal<IModalityResponse[]>([]);
  seasons = signal<ISeasonResponse[]>([]);

  availableTiebreaks = signal<ITiebreakResponse[]>([]);
  tiebreaks = signal<ITiebreakResponse[]>([]);
  showModal = signal(false);
  tempSelectedIds = signal<number[]>([]);

  dragIndex: number | null = null;
  dragOverIndex: number | null = null;

  isValid = computed(() => {
    return this.rulesForm.valid && this.tiebreaks().length > 0;
  });

  constructor() {
    this.rulesForm = this.fb.group({
      pointsWin: [3, [Validators.required, Validators.min(0)]],
      pointsDraw: [1, [Validators.required, Validators.min(0)]],
      pointsLoss: [0, [Validators.required, Validators.min(0)]],
      hasHomeAway: [true],
    });

    // Escuta mudanças em isValid para emitir o evento
    effect(() => {
      this.valid.emit(this.isValid());
    });

    // Restaurar critérios de desempate quando o catálogo estiver carregado
    effect(
      () => {
        const available = this.availableTiebreaks();
        const initialTiebreaks = this.data()?.tiebreaks?.criteria;

        if (available.length > 0 && initialTiebreaks && initialTiebreaks.length > 0) {
          const restored = initialTiebreaks
            .map((c) => available.find((a) => a.id.toString() === c.criteriaId))
            .filter((t): t is ITiebreakResponse => !!t);

          if (restored.length > 0) {
            // Garantir que POINTS seja o primeiro se existir
            const pointsIndex = restored.findIndex((t) => t.code === 'POINTS');
            if (pointsIndex > 0) {
              const points = restored.splice(pointsIndex, 1)[0];
              restored.unshift(points);
            }
            this.tiebreaks.set(restored);
          }
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit() {
    const isBrowser = isPlatformBrowser(this.platformId);
    if (isBrowser) {
      this.getAllTiebreaks();
      this.getModalities();
      this.getSeasons();

      // Restaurar dados básicos e regras
      const initial = this.data();
      if (initial?.basics) {
        this.name.set(initial.basics.name || '');
        this.modalityId.set(initial.basics.modalityId || '');
        this.gender.set(initial.basics.gender || 'MALE');
        this.type.set(initial.basics.type || 'SEASONAL');
        this.seasonId.set(initial.basics.seasonId || '');
      }

      if (initial?.rules) {
        this.rulesForm.patchValue({
          pointsWin: initial.rules.pointsWin,
          pointsDraw: initial.rules.pointsDraw,
          pointsLoss: initial.rules.pointsLoss,
          hasHomeAway: initial.rules.hasHomeAway,
        });
      }
    }
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

  saveAndContinue() {
    if (this.isValid()) {
      const formValues = this.rulesForm.value;
      this.dataUpdate.emit({
        basics: {
          name: this.name(),
          modalityId: this.modalityId(),
          gender: this.gender(),
          type: this.type(),
          seasonId: this.seasonId(),
        },
        rules: {
          pointsWin: formValues.pointsWin,
          pointsDraw: formValues.pointsDraw,
          pointsLoss: formValues.pointsLoss,
          hasHomeAway: formValues.hasHomeAway,
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
