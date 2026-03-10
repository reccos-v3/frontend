import { Component, input, output, signal, computed, effect, model, inject } from '@angular/core';
import { SetupStep } from '../../../../interfaces/setup-types.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IChampionshipSetupRequest,
  ISeedingConfig,
  ISeedingAudit,
  SeedingPolicyType,
  SeedingDecisionMode,
  SeedingTechnicalSource,
} from '../../../../interfaces/setup-types.interface';
import { AppAlert } from '../../../../components/alert/alert';
import { IChampionshipResponse } from '../../../../interfaces/championship.interface';
import { SetupFooterButtons } from '../setup-footer-buttons/setup-footer-buttons';
import { ChampionshipStore } from '../../../../services/championship.store';
import { Router } from '@angular/router';
import { ChampionshipSetupService } from '../../../../services/championship-setup.service';
import { ISeedingPoliciesRequest } from '../../../../interfaces/championship-setup.interface';

@Component({
  selector: 'app-setup-seeding',
  standalone: true,
  imports: [CommonModule, FormsModule, AppAlert, SetupFooterButtons],
  templateUrl: './setup-seeding.html',
  styleUrl: './setup-seeding.css',
})
export class SetupSeeding {
  data = input.required<IChampionshipResponse>();
  status = input.required<'CONFIGURING' | 'ACTIVE'>();
  updateData = output<Partial<IChampionshipSetupRequest>>();
  seedingChange = output<ISeedingConfig>();
  advanced = output<SetupStep>();

  router = inject(Router);
  championshipStore = inject(ChampionshipStore);
  championshipSetupService = inject(ChampionshipSetupService);

  policyType = model<SeedingPolicyType>('RANKING');
  decisionMode = model<SeedingDecisionMode>('AUTOMATIC');
  technicalSource = model<SeedingTechnicalSource | undefined>('GROUP_STAGE_RESULT');

  knockoutEntry = model<boolean>(true);
  groupDistribution = model<boolean>(false);
  preliminaryRounds = model<boolean>(false);

  isValid = signal(true);
  loading = signal(false);

  championship = this.championshipStore.championship;

  audit = signal<ISeedingAudit>({
    definedBy: null,
    createdAt: null,
    status: 'DRAFT',
    freezesTrigger: 'ACTIVE',
  });

  readonly decisionModeOptions: { value: SeedingDecisionMode; label: string }[] = [
    { value: 'AUTOMATIC', label: 'Automático pelo sistema' },
    { value: 'MANUAL', label: 'Definido manualmente pelo administrador' },
  ];

  readonly technicalSourceOptions: { value: SeedingTechnicalSource; label: string }[] = [
    { value: 'GROUP_STAGE_RESULT', label: 'Resultado de fase anterior (ex: grupos)' },
    { value: 'EXTERNAL_RANKING', label: 'Ranking externo / regulatório' },
    { value: 'HISTORICAL_PERFORMANCE', label: 'Desempenho histórico' },
    { value: 'PURE_RANDOM', label: 'Sorteio puro (quando aplicável)' },
  ];

  readonly applicationContextOptions: {
    key: 'knockoutEntry' | 'groupDistribution' | 'preliminaryRounds';
    label: string;
    description: string;
    requiresFormat?: ('KNOCKOUT' | 'GROUPS_AND_KNOCKOUT')[];
  }[] = [
    {
      key: 'knockoutEntry',
      label: 'Entrada no Mata-mata',
      description: 'Define como os times são posicionados nas chaves eliminatórias.',
      requiresFormat: ['KNOCKOUT', 'GROUPS_AND_KNOCKOUT'],
    },
    {
      key: 'groupDistribution',
      label: 'Distribuição em Grupos',
      description: 'Aplica a política ao distribuir times nos grupos iniciais.',
      requiresFormat: ['GROUPS_AND_KNOCKOUT'],
    },
    {
      key: 'preliminaryRounds',
      label: 'Rodadas Preliminares / Byes',
      description: 'Decide quem joga a preliminar e quem avança direto.',
      requiresFormat: ['KNOCKOUT', 'GROUPS_AND_KNOCKOUT'],
    },
  ];

  formatType = computed(() => this.data()?.format?.formatType);

  hasSeedPolicy = computed(() => {
    const format = this.formatType();
    return format === 'KNOCKOUT' || format === 'GROUPS_AND_KNOCKOUT';
  });

  shouldShowTechnicalSourceField = computed(() => {
    return this.formatType() === 'GROUPS_AND_KNOCKOUT';
  });

  filteredContextOptions = computed(() => {
    const format = this.formatType();
    if (!format) return [];
    return this.applicationContextOptions.filter(
      (opt) =>
        !opt.requiresFormat ||
        opt.requiresFormat.includes(format as 'KNOCKOUT' | 'GROUPS_AND_KNOCKOUT'),
    );
  });

  isReadOnly = computed(() => this.status() === 'ACTIVE');

  constructor() {
    effect(() => {
      const existing = this.data().seedingPolicy;
      if (!existing) return;

      if (existing.type) {
        this.policyType.set(existing.type);
      }

      if (existing.mode) {
        this.decisionMode.set(existing.mode);
      }

      if (existing.technicalSource) {
        this.technicalSource.set(existing.technicalSource);
      }

      if (existing.applicationContext) {
        this.knockoutEntry.set(existing.applicationContext.knockoutEntry);
        this.groupDistribution.set(existing.applicationContext.groupDistribution);
        this.preliminaryRounds.set(existing.applicationContext.preliminaryRounds);
      }

      if (existing.audit) {
        this.audit.set(existing.audit);
      }
    });

    effect(() => {
      if (this.status() === 'ACTIVE') {
        this.audit.update((a) => ({ ...a, status: 'FROZEN' as const }));
      }
    });

    effect(() => {
      if (!this.shouldShowTechnicalSourceField()) {
        this.technicalSource.set(null as unknown as SeedingTechnicalSource);
      }
    });

    effect(() => {
      if (this.isReadOnly()) return;

      if (!this.hasSeedPolicy()) {
        return;
      }

      const techSource = this.technicalSource();

      const config: ISeedingConfig = {
        type: this.policyType() === 'DRAW' ? 'DRAW' : 'RANKING',
        mode: this.decisionMode(),
        // results: this.data().seedingPolicy?.results || [],
        // justification: this.data().seedingPolicy?.justification || '',
        policyType: this.policyType(),
        ...(techSource !== undefined ? { technicalSource: techSource } : {}),
        applicationContext: {
          knockoutEntry: this.knockoutEntry(),
          groupDistribution: this.groupDistribution(),
          preliminaryRounds: this.preliminaryRounds(),
        },
        audit: {
          ...this.audit(),
          definedBy: 'ADMINISTRADOR',
          createdAt: new Date().toISOString(),
        },
      };

      if (this.policyType() === 'DRAW' && this.decisionMode() === 'AUTOMATIC') {
        config.globalSeed = Math.random().toString(36).substring(2, 10).toUpperCase();
      }

      this.seedingChange.emit(config);
    });
  }

  getContextValue(key: 'knockoutEntry' | 'groupDistribution' | 'preliminaryRounds'): boolean {
    return this[key]();
  }

  toggleContext(key: 'knockoutEntry' | 'groupDistribution' | 'preliminaryRounds') {
    if (this.isReadOnly()) return;
    this[key].set(!this[key]());
  }

  saveAndContinue() {
    const currentChampionship = this.championship();
    if (!currentChampionship) return;

    const payload: ISeedingPoliciesRequest = {
      type: this.policyType(),
      mode: this.decisionMode(),
      technicalSource: this.technicalSource() ?? 'GROUP_STAGE_RESULT',
      applicationContext: {
        knockoutEntry: this.knockoutEntry(),
        groupDistribution: this.groupDistribution(),
        preliminaryRounds: this.preliminaryRounds(),
      },
    };

    this.loading.set(true);
    this.championshipSetupService.updateSeedingPolicies(currentChampionship.id, payload).subscribe({
      next: (response) => {
        this.loading.set(false);
        const currentProgress = this.championship()?.progress;
        this.championshipStore.update({
          seedingPolicy: response,
          progress: currentProgress ? { ...currentProgress, seeding: true } : undefined,
        });

        this.router.navigate(['/admin/championships/setup', currentChampionship.id]);
      },
      error: (error) => {
        console.error('Erro ao salvar estrutura:', error);
        this.loading.set(false);
      },
    });
  }

  eventClickConfirmButton(event: 'saveAndContinue' | 'returnHub') {
    if (event === 'saveAndContinue') {
      this.saveAndContinue();
    } else {
      this.returnToPrevious();
    }
  }

  returnToPrevious() {
    const championship = this.championship();
    if (!championship) return;
    this.router.navigate(['/admin/championships/setup', championship.id]);
  }
}
