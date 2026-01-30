import { Component, computed, effect, inject, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupStep, IChampionshipSetupRequest } from '../../../../interfaces/setup-types.interface';
import { ModalSetupFinish } from '../../../../components/modal-setup-finish/modal-setup-finish';
import { ModalityService } from '../../../../services/modality.service';
import { SeasonService } from '../../../../services/season.service';
import { TiebreakService } from '../../../../services/tiebreak.service';
import { IModalityResponse } from '../../../../interfaces/modality.interface';
import { ISeasonResponse } from '../../../../interfaces/season.interface';
import { ITiebreakResponse } from '../../../../interfaces/tiebreak.interface';

@Component({
  selector: 'app-setup-final-review',
  standalone: true,
  imports: [CommonModule, ModalSetupFinish],
  templateUrl: './setup-final-review.html',
  styleUrl: './setup-final-review.css',
})
export class SetupFinalReview implements OnInit {
  private modalityService = inject(ModalityService);
  private seasonService = inject(SeasonService);
  private tiebreakService = inject(TiebreakService);

  data = input.required<IChampionshipSetupRequest>();
  advanced = output<SetupStep>();
  dataUpdate = output<Partial<IChampionshipSetupRequest>>();
  finalReview = output();
  isModalOpen = signal(false);
  modalities = signal<IModalityResponse[]>([]);
  seasons = signal<ISeasonResponse[]>([]);
  availableTiebreaks = signal<ITiebreakResponse[]>([]);

  // Computed Display Values
  modalityName = computed(() => {
    const id = this.data()?.basics?.modalityId;
    return this.modalities().find((m) => m.id === id)?.name || 'N/A';
  });

  genderLabel = computed(() => {
    const gender = this.data()?.basics?.gender;
    return gender === 'MALE' ? 'Masculino' : gender === 'FEMALE' ? 'Feminino' : 'Misto';
  });

  formatLabel = computed(() => {
    const type = this.data()?.format?.formatType;
    const map: Record<string, string> = {
      LEAGUE: 'Pontos Corridos',
      KNOCKOUT: 'Mata-mata',
      GROUPS_AND_KNOCKOUT: 'Grupos + Mata-mata',
    };
    return map[type || ''] || 'N/A';
  });

  seasonName = computed(() => {
    const id = this.data()?.basics?.seasonId;
    return this.seasons().find((s) => s.id === id)?.name || 'N/A';
  });

  typeLabel = computed(() => {
    const type = this.data()?.basics?.type;
    return type === 'SEASONAL' ? 'Sazonal' : 'Recorrente';
  });

  teamsProgress = computed(() => {
    const registered = this.data()?.teams?.length || 0;
    const target = this.data()?.structure?.totalTeams || 0;
    const percentage = target > 0 ? (registered / target) * 100 : 0;
    return {
      registered,
      target,
      percentage,
      isComplete: registered >= target,
    };
  });

  displayTiebreaks = computed(() => {
    const criteria = this.data()?.tiebreaks?.criteria || [];
    const available = this.availableTiebreaks();
    return criteria
      .map((c) => {
        const found = available.find((a) => a.id.toString() === c.criteriaId);
        return found ? found.name : 'Critério Desconhecido';
      })
      .filter((name) => name !== 'Pontos'); // Geralmente pontos é o primeiro implícito ou já mostrado
  });

  // Activation Policy
  activationMode = signal<'MANUAL' | 'AUTOMATIC'>('MANUAL');
  autoActivateAt = signal<string | null>(null);

  constructor() {
    // Restaurar política de ativação
    effect(
      () => {
        const initial = this.data();
        if (initial?.activationPolicy) {
          this.activationMode.set(initial.activationPolicy.mode);
          this.autoActivateAt.set(initial.activationPolicy.autoActivateAt);
        }
      },
      { allowSignalWrites: true },
    );

    // Emitir atualizações reativas
    effect(() => {
      const mode = this.activationMode();
      const autoActivateAt = this.autoActivateAt();

      this.dataUpdate.emit({
        activationPolicy: {
          mode,
          autoActivateAt,
        },
      });
    });
  }

  ngOnInit() {
    this.modalityService.getAllModalities().subscribe((res) => this.modalities.set(res));
    this.seasonService.getSeasonsByFederationId().subscribe((res) => this.seasons.set(res));
    this.tiebreakService.getAllTiebreaks().subscribe((res) => this.availableTiebreaks.set(res));
  }

  setActivationMode(mode: 'MANUAL' | 'AUTOMATIC') {
    this.activationMode.set(mode);
    if (mode === 'MANUAL') {
      this.autoActivateAt.set(null);
    }
  }

  onAutoActivateChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.autoActivateAt.set(value || null);
  }

  openConfirmation() {
    this.isModalOpen.set(true);
  }

  handleConfirm() {
    console.log('Campeonato Ativado!', this.data());
    this.isModalOpen.set(false);
    this.finalReview.emit();
    // Sua lógica de ativação aqui
  }

  returnToPrevious() {
    this.advanced.emit('teams');
  }
}
