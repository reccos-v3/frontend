import { Component, input, output, signal, computed, effect, model } from '@angular/core';
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
  ISeedPolicy,
} from '../../../../interfaces/setup-types.interface';
import { AppAlert } from '../../../../components/alert/alert';

@Component({
  selector: 'app-setup-seeding',
  standalone: true,
  imports: [CommonModule, FormsModule, AppAlert],
  templateUrl: './setup-seeding.html',
  styleUrl: './setup-seeding.css',
})
export class SetupSeeding {
  setupData = input.required<IChampionshipSetupRequest>();
  status = input.required<'CONFIGURING' | 'ACTIVE'>();
  updateData = output<Partial<IChampionshipSetupRequest>>();
  seedingChange = output<ISeedingConfig>();
  advanced = output<SetupStep>();

  policyType = model<SeedingPolicyType>('RANKING');
  decisionMode = model<SeedingDecisionMode>('AUTOMATIC');
  technicalSource = model<SeedingTechnicalSource | undefined>('GROUP_STAGE_RESULT');

  knockoutEntry = model<boolean>(true);
  groupDistribution = model<boolean>(false);
  preliminaryRounds = model<boolean>(false);

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

  formatType = computed(() => this.setupData()?.format?.formatType);

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
      const existing = this.setupData().seeding;
      if (!existing) return;

      if (existing.policyType) {
        this.policyType.set(existing.policyType);
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
        results: this.setupData().seeding?.results || [],
        justification: this.setupData().seeding?.justification || '',
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
    const policy: ISeedPolicy = {
      policyType: this.policyType(),
      decisionMode: this.decisionMode(),
      technicalSource: this.technicalSource() ?? null,
      knockoutEntry: this.knockoutEntry(),
      groupDistribution: this.groupDistribution(),
      preliminaryRounds: this.preliminaryRounds(),
      definedBy: this.audit().definedBy || 'Administrador',
    };

    this.updateData.emit({
      seedPolicy: policy,
    });
    this.advanced.emit('final_review');
  }
}
