import { Component, effect, inject, OnInit, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import {
  SetupStep,
  ISchedulePreferences,
  IKnockoutConfig,
  IChampionshipSetupRequest,
  FormatType,
} from '../../../../interfaces/setup-types.interface';
import { SetupSidebarFormat, IPhase } from '../setup-sidebar-format/setup-sidebar-format';
import { SetupChampionshipFormat } from '../setup-championship-format/setup-championship-format';
import { AppAlert } from '../../../../components/alert/alert';
import { SetupFormatKnockout } from '../setup-format-knockout/setup-format-knockout';
import { FormatCalendarPreferences } from '../format-calendar-preferences/format-calendar-preferences';
import { ChampionshipStore } from '../../../../services/championship.store';
import { Router } from '@angular/router';

interface IFormat {
  id: 'groups_and_knockout' | 'knockout' | 'points';
  icon: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-setup-format',
  standalone: true,
  imports: [
    SetupSidebarFormat,
    SetupChampionshipFormat,
    AppAlert,
    SetupFormatKnockout,
    FormatCalendarPreferences,
  ],
  templateUrl: './setup-format.html',
  styleUrl: './setup-format.css',
})
export class SetupFormat implements OnInit {
  valid = output<boolean>();
  advanced = output<SetupStep>();
  phasesChange = output<IPhase[]>();
  dataUpdate = output<Partial<IChampionshipSetupRequest>>();
  router = inject(Router);

  championshipStore = inject(ChampionshipStore);

  championship = this.championshipStore.championship;
  canEdit = this.championshipStore.canEdit;
  loading = signal(false);

  selectedFormat = signal<IFormat['id']>('groups_and_knockout');
  totalTeams = signal(16);
  groupsCount = signal(4);
  qualifiedPerGroup = signal(2);
  firstPhaseType = signal('GROUPS');
  schedulePreferences = signal<ISchedulePreferences>({
    allowedWeekDays: [],
    preferredTimeSlots: [],
    avoidHolidays: false,
  });

  isDoubleRound = signal(true);

  // Internal state for wizard step
  internalStep = signal<'selection' | 'configuration'>('selection');

  // Store phases from sidebar to pass to knockout config
  storedPhases = signal<IPhase[]>([]);
  knockoutConfig = signal<IKnockoutConfig | undefined>(undefined);

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
      this.groupsCount.set(initial.structure.groupsCount);
      this.qualifiedPerGroup.set(initial.structure.qualifiedPerGroup);
      this.firstPhaseType.set(initial.structure.firstPhaseType);
    }
    if (initial?.rules) {
      this.isDoubleRound.set(initial.rules.hasHomeAway);
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

  updateSchedulePreferences(preferences: ISchedulePreferences) {
    this.schedulePreferences.set(preferences);
  }

  saveAndContinue() {
    if (this.internalStep() === 'selection' && this.selectedFormat() !== 'points') {
      this.internalStep.set('configuration');
      return;
    }
    const currentChampionship = this.championship();
    if (!currentChampionship) return;

    this.championshipStore.replace({
      ...currentChampionship,
      format: {
        id: currentChampionship.format?.id || '',
        formatType: this.selectedFormat().toUpperCase() as FormatType,
      },
      structure: {
        totalTeams: this.totalTeams(),
        groupsCount: this.groupsCount(),
        qualifiedPerGroup: this.qualifiedPerGroup(),
        firstPhaseType: this.firstPhaseType(),
        knockoutConfig: this.knockoutConfig(),
      },
      schedulePreferences: this.schedulePreferences(),
    });
    console.log(this.championship());

    // Volta para o setup principal (SEM refetch)
    this.router.navigate(['/admin/championships/setup', currentChampionship.id]);
  }

  returnToPrevious() {
    if (this.internalStep() === 'configuration') {
      this.internalStep.set('selection');
    } else {
      const championship = this.championship();
      if (!championship) return;

      this.router.navigate(['/admin/championships/setup', championship.id]);
    }
  }

  handlePhasesChange(phases: IPhase[]) {
    this.storedPhases.set(phases);
    this.phasesChange.emit(phases);
  }

  handleKnockoutConfigChange(config: IKnockoutConfig) {
    this.knockoutConfig.set(config);
  }
}
