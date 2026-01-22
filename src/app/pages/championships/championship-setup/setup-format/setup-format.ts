import { Component, effect, input, OnInit, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { SetupStep, IChampionshipSetupRequest } from '../setup-types';
import { SetupSidebarFormat } from '../setup-sidebar-format/setup-sidebar-format';
import { SetupFormatSelection } from '../setup-format-selection/setup-format-selection';
import { AppAlert } from '../../../../components/alert/alert';

interface IFormat {
  id: 'groups_knockout' | 'knockout' | 'round_robin';
  icon: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-setup-format',
  standalone: true,
  imports: [SetupSidebarFormat, SetupFormatSelection, AppAlert],
  templateUrl: './setup-format.html',
  styleUrl: './setup-format.css',
})
export class SetupFormat implements OnInit {
  advanced = output<SetupStep>();
  valid = output<boolean>();
  dataUpdate = output<Partial<IChampionshipSetupRequest>>();
  data = input<IChampionshipSetupRequest>();

  selectedFormat = signal<IFormat['id']>('groups_knockout');
  totalTeams = signal(16);
  groupsCount = signal(4);
  qualifiedPerGroup = signal(2);
  knockoutStartPhase = signal('QUARTER_FINALS');
  firstPhaseType = signal('GROUPS');

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
    const initial = this.data();
    if (initial?.format) {
      this.selectedFormat.set(initial.format.formatType.toLowerCase() as IFormat['id']);
    }
    if (initial?.structure) {
      this.totalTeams.set(initial.structure.totalTeams);
      this.groupsCount.set(initial.structure.groupsCount);
      this.qualifiedPerGroup.set(initial.structure.qualifiedPerGroup);
      this.knockoutStartPhase.set(initial.structure.knockoutStartPhase);
      this.firstPhaseType.set(initial.structure.firstPhaseType);
    }
  }

  formats: IFormat[] = [
    {
      id: 'groups_knockout',
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
      id: 'round_robin',
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

  saveAndContinue() {
    if (this.isValid()) {
      this.dataUpdate.emit({
        format: {
          formatType: this.selectedFormat().toUpperCase(),
        },
        structure: {
          totalTeams: this.totalTeams(),
          groupsCount: this.groupsCount(),
          qualifiedPerGroup: this.qualifiedPerGroup(),
          knockoutStartPhase: this.knockoutStartPhase(),
          firstPhaseType: this.firstPhaseType(),
        },
      });

      if (this.selectedFormat() === 'round_robin') {
        this.advanced.emit('teams');
      } else {
        this.advanced.emit('structure');
      }
    }
  }

  returnToPrevious() {
    this.advanced.emit('rules');
  }
}
