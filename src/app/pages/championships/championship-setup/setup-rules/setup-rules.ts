import {
  Component,
  computed,
  effect,
  inject,
  output,
  PLATFORM_ID,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { TiebreakService } from '../../../../services/tiebreak.service';
import { ITiebreakResponse } from '../../../../interfaces/tiebreak.interface';
import { SetupStep, IChampionshipSetupRequest } from '../../../../interfaces/setup-types.interface';
import { ModalityService } from '../../../../services/modality.service';
import { SeasonService } from '../../../../services/season.service';
import { IModalityResponse } from '../../../../interfaces/modality.interface';
import { ISeasonResponse } from '../../../../interfaces/season.interface';

import { TiebreakCriteriaModalComponent } from '../../../../components/tiebreak-criteria-modal/tiebreak-criteria-modal.component';
import { SetupPointsComponent } from '../setup-points/setup-points';
import { SetupTiebreaksComponent } from '../setup-tiebreaks/setup-tiebreaks';
import { IPostActivationRules } from '../../../../interfaces/setup-types.interface';
import { ChampionshipSetupService } from '../../../../services/championship-setup.service';
import { ChampionshipStore } from '../../../../services/championship.store';
import { IRulesAndScoringRequest } from '../../../../interfaces/championship-setup.interface';
import { Router } from '@angular/router';
import { AppAlert } from '../../../../components/alert/alert';
import { SetupFooterButtons } from '../setup-footer-buttons/setup-footer-buttons';

@Component({
  selector: 'app-setup-rules',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TiebreakCriteriaModalComponent,
    SetupPointsComponent,
    SetupTiebreaksComponent,
    AppAlert,
    SetupFooterButtons,
  ],
  templateUrl: './setup-rules.html',
  styleUrl: './setup-rules.css',
})
export class SetupRules implements OnInit {
  private readonly router = inject(Router);
  private seasonService = inject(SeasonService);
  private tiebreakService = inject(TiebreakService);
  private modalityService = inject(ModalityService);
  private championshipStore = inject(ChampionshipStore);
  private championshipSetupService = inject(ChampionshipSetupService);
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);

  advanced = output<SetupStep>();
  valid = output<boolean>();
  dataUpdate = output<Partial<IChampionshipSetupRequest>>();
  data = this.championshipStore.championship;

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
  postActivationRules = signal<IPostActivationRules | null>(null);

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
        const initialTiebreaks = this.data()?.rules?.tieBreakerOrder;

        if (available.length > 0 && initialTiebreaks && initialTiebreaks.length > 0) {
          const restored = initialTiebreaks
            .map((c) => available.find((a) => a.id.toString() === c))
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
      if (initial) {
        this.name.set(initial.name || '');
        this.modalityId.set(initial.modality.id || '');
        this.gender.set(initial.gender || 'MALE');
        this.type.set(initial.type || 'SEASONAL');
        this.seasonId.set(initial?.season?.id || '');
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

  onTiebreaksConfirmed(selectedIds: number[]) {
    const selected = this.availableTiebreaks().filter(
      (t) => selectedIds.includes(t.id) || t.code === 'POINTS',
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

  onTiebreaksReordered(event: { from: number; to: number }) {
    this.tiebreaks.update((list) => {
      const newList = [...list];
      const item = newList[event.from];
      newList.splice(event.from, 1);
      newList.splice(event.to, 0, item);
      return newList;
    });
  }

  saveAndContinue() {
    if (this.isValid()) {
      const championship = this.data();
      const championshipId = championship?.id || '';
      const request: IRulesAndScoringRequest = {
        ...this.rulesForm.value,
        tieBreakerOrder: this.tiebreaks().map((t, index) => ({
          criteriaId: t.id.toString(),
          priorityOrder: index + 1,
        })),
      };
      this.championshipSetupService.updateRulesAndScoring(championshipId, request).subscribe({
        next: (response) => {
          this.championshipStore.update({
            rules: response,
          });

          this.router.navigate(['/admin/championships/setup', championshipId]);
        },
        error: (error) => {
          console.error(error);
        },
      });
    }
  }

  returnHub() {
    const championshipId = this.data()?.id || '';
    this.router.navigate(['/admin/championships/setup', championshipId]);
  }

  eventClickConfirmButton(event: 'saveAndContinue' | 'returnHub') {
    if (event === 'saveAndContinue') {
      this.saveAndContinue();
    } else {
      this.returnHub();
    }
  }
}
