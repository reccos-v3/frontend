import { Component, effect, inject, OnInit, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import {
  SetupStep,
  ISchedulePreferences,
  IKnockoutConfig,
  IChampionshipSetupRequest,
} from '../../../../interfaces/setup-types.interface';
import { SetupSidebarFormat, IPhase } from '../setup-sidebar-format/setup-sidebar-format';
import { SetupChampionshipFormat } from '../setup-championship-format/setup-championship-format';
import { AppAlert } from '../../../../components/alert/alert';
import { FormatCalendarPreferences } from '../format-calendar-preferences/format-calendar-preferences';
import { ChampionshipStore } from '../../../../services/championship.store';
import { Router } from '@angular/router';
import { ChampionshipSetupService } from '../../../../services/championship-setup.service';
import { IFormatAndStructureRequest } from '../../../../interfaces/championship-setup.interface';

interface IFormat {
  id: 'groups_and_knockout' | 'knockout' | 'points' | 'groups';
  icon: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-setup-format',
  standalone: true,
  imports: [SetupSidebarFormat, SetupChampionshipFormat, AppAlert, FormatCalendarPreferences],
  templateUrl: './setup-format.html',
  styleUrl: './setup-format.css',
})
export class SetupFormat implements OnInit {
  valid = output<boolean>();
  advanced = output<SetupStep>();
  phasesChange = output<IPhase[]>();
  dataUpdate = output<Partial<IChampionshipSetupRequest>>();
  private championshipSetupService = inject(ChampionshipSetupService);
  router = inject(Router);

  championshipStore = inject(ChampionshipStore);

  championship = this.championshipStore.championship;
  canEdit = this.championshipStore.canEdit;
  loading = signal(false);

  selectedFormat = signal<IFormat['id']>('groups_and_knockout');
  totalTeams = signal(16);
  groupsCount = signal(4);
  qualifiedPerGroup = signal(2);
  wildcardCount = signal(0);
  byesCount = signal(0);
  knockoutStartPhase = signal<string | null>(null);
  firstPhaseType = signal<string | null>('GROUPS');
  schedulePreferences = signal<ISchedulePreferences>({
    availability: [],
    avoidHolidays: false,
  });

  isDoubleRound = signal(true);

  // Store phases from sidebar to pass to knockout config
  storedPhases = signal<IPhase[]>([]);
  knockoutConfig = signal<IKnockoutConfig | null>(null);

  // Debounced signals for sidebar
  debouncedFormat = toSignal(toObservable(this.selectedFormat).pipe(debounceTime(500)), {
    initialValue: this.selectedFormat(),
  });
  debouncedTotalTeams = toSignal(toObservable(this.totalTeams).pipe(debounceTime(500)), {
    initialValue: this.totalTeams(),
  });
  debouncedGroupsCount = toSignal(toObservable(this.groupsCount).pipe(debounceTime(500)), {
    initialValue: this.groupsCount(),
  });
  debouncedQualified = toSignal(toObservable(this.qualifiedPerGroup).pipe(debounceTime(500)), {
    initialValue: this.qualifiedPerGroup(),
  });

  isValid = signal(false);

  constructor() {
    effect(
      () => {
        const valid = !!this.selectedFormat();
        this.isValid.set(valid);
        this.valid.emit(valid);
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit() {
    const initial = this.championship();
    if (initial?.format) {
      this.selectedFormat.set(initial.format.formatType.toLowerCase() as IFormat['id']);
    }
    if (initial?.structure) {
      this.totalTeams.set(initial.structure.totalTeams);
      this.groupsCount.set(initial.structure.groupsCount || 0);
      this.qualifiedPerGroup.set(initial.structure.qualifiedPerGroup || 0);
      this.wildcardCount.set(initial.structure.wildcardCount || 0);
      this.firstPhaseType.set(initial.structure.firstPhaseType);

      if (initial.structure.knockoutConfig) {
        this.knockoutConfig.set(initial.structure.knockoutConfig);
      }
    }
    if (initial?.rules) {
      this.isDoubleRound.set(initial.rules.hasHomeAway);
    }
    if (initial?.schedulePreferences) {
      this.schedulePreferences.set(initial.schedulePreferences);
    }
  }

  formats: IFormat[] = [
    {
      id: 'groups_and_knockout',
      icon: 'grid_view',
      label: 'Grupos + Mata-mata',
      description: 'Copa do Mundo',
    },
    {
      id: 'knockout',
      icon: 'trophy',
      label: 'Mata-mata Direto',
      description: 'Copa do Brasil',
    },
    {
      id: 'points',
      icon: 'leaderboard',
      label: 'Pontos Corridos',
      description: 'Brasileirão',
    },
    {
      id: 'groups',
      icon: 'groups',
      label: 'Grupos Simples',
      description: 'Fase de Grupos',
    },
  ];

  updateGroupsCount(val: number) {
    this.groupsCount.update((c) => Math.max(1, c + val));
  }

  updateQualified(val: number) {
    this.qualifiedPerGroup.update((c) => Math.max(1, c + val));
  }

  updateTotalTeams(val: number) {
    this.totalTeams.update((c) => Math.max(2, c + val));
  }

  updateWildcardCount(val: number) {
    this.wildcardCount.update((c) => Math.max(0, c + val));
  }

  updateSchedulePreferences(preferences: ISchedulePreferences) {
    this.schedulePreferences.set(preferences);
  }

  saveAndContinue() {
    const currentChampionship = this.championship();
    if (!currentChampionship) return;

    const format = this.selectedFormat();
    const structurePayload = this.buildStructurePayload(format);

    this.loading.set(true);
    this.championshipSetupService
      .updateStructure(currentChampionship.id, structurePayload)
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.championshipStore.update({
            structure: {
              ...response,
            },
          });
          this.router.navigate(['/admin/championships/setup', currentChampionship.id]);
        },
        error: (error) => {
          console.error('Erro ao salvar estrutura:', error);
          this.loading.set(false);
        },
      });
  }

  private buildStructurePayload(format: IFormat['id']): IFormatAndStructureRequest {
    const basePayload: IFormatAndStructureRequest = {
      formatType: format.toUpperCase() as IFormatAndStructureRequest['formatType'],
      totalTeams: this.totalTeams(),
      groupsCount: null,
      qualifiedPerGroup: null,
      knockoutStartPhase: null,
      byesCount: this.byesCount(),
      firstPhaseType: null,
      wildcardCount: this.wildcardCount(),
      knockoutConfig: null,
      schedulePreferences: this.schedulePreferences(),
    };

    switch (format) {
      case 'points':
        // Pontos corridos: apenas totalTeams e schedulePreferences
        return basePayload;

      case 'groups':
        // Grupos simples: groupsCount obrigatório
        return {
          ...basePayload,
          groupsCount: this.groupsCount(),
          firstPhaseType: 'GROUPS',
        };

      case 'knockout': {
        // Mata-mata puro: knockoutStartPhase e knockoutConfig obrigatórios
        const knockoutByes = this.calculateByes(this.totalTeams());
        const totalSlots = this.totalTeams() + knockoutByes;

        return {
          ...basePayload,
          byesCount: knockoutByes,
          knockoutStartPhase: this.calculateKnockoutStartPhase(totalSlots),
          knockoutConfig: this.buildKnockoutConfig(),
        };
      }

      case 'groups_and_knockout': {
        // Grupos + Mata-mata: tudo obrigatório
        const teamsEnteringKnockout =
          this.groupsCount() * this.qualifiedPerGroup() + this.wildcardCount();
        const groupsKnockoutByes = this.calculateByes(teamsEnteringKnockout);
        const totalKnockoutSlots = teamsEnteringKnockout + groupsKnockoutByes;

        return {
          ...basePayload,
          groupsCount: this.groupsCount(),
          qualifiedPerGroup: this.qualifiedPerGroup(),
          byesCount: groupsKnockoutByes,
          knockoutStartPhase: this.calculateKnockoutStartPhase(totalKnockoutSlots),
          firstPhaseType: 'GROUPS',
          knockoutConfig: this.buildKnockoutConfig(),
        };
      }

      default:
        return basePayload;
    }
  }

  private calculateKnockoutStartPhase(teams: number): string {
    if (teams <= 2) return 'FINAL';
    if (teams <= 4) return 'SEMI_FINALS';
    if (teams <= 8) return 'QUARTER_FINALS';
    if (teams <= 16) return 'ROUND_OF_16';
    if (teams <= 32) return 'ROUND_OF_32';
    if (teams <= 64) return 'ROUND_OF_64';
    if (teams <= 128) return 'ROUND_OF_128';
    if (teams <= 256) return 'ROUND_OF_256';
    return 'ROUND_OF_512';
  }

  private calculateByes(teams: number): number {
    if (teams <= 0) return 0;

    let power = 1;
    while (power < teams) {
      power *= 2;
    }

    return power - teams;
  }

  private buildKnockoutConfig() {
    const config = this.knockoutConfig();
    if (!config) {
      // Configuração padrão se não houver customização
      return {
        defaultLegs: 2,
        defaultAdvanceRule: 'AGGREGATE_OR_PENALTIES',
        phases: null,
      };
    }

    return {
      defaultLegs: config.defaultLegs,
      defaultAdvanceRule: config.defaultAdvanceRule,
      phases:
        config.phases?.map((phase, index) => ({
          phaseOrder: index + 1,
          legs: phase.legs,
          advanceRule: phase.advanceRule,
          phaseType: phase.phaseType || 'KNOCKOUT',
        })) || null,
    };
  }

  returnToPrevious() {
    const championship = this.championship();
    if (!championship) return;
    this.router.navigate(['/admin/championships/setup', championship.id]);
  }

  handlePhasesChange(phases: IPhase[]) {
    this.storedPhases.set(phases);
    this.phasesChange.emit(phases);
  }

  handleKnockoutConfigChange(config: IKnockoutConfig) {
    this.knockoutConfig.set(config);
  }
}
