import { Component, effect, output, signal } from '@angular/core';
import { SetupStep, IChampionshipSetupRequest } from '../setup-types';
import { SetupKnockoutGroup } from '../setup-knockout-group/setup-knockout-group';
import { SetupSidebarFormat } from '../setup-sidebar-format/setup-sidebar-format';
import { SetupSystemFormat } from '../setup-system-format/setup-system-format';

@Component({
  selector: 'app-setup-format',
  imports: [SetupKnockoutGroup, SetupSidebarFormat, SetupSystemFormat],
  templateUrl: './setup-format.html',
  styleUrl: './setup-format.css',
})
export class SetupFormat {
  advanced = output<SetupStep>();
  valid = output<boolean>();
  dataUpdate = output<Partial<IChampionshipSetupRequest>>();

  selectedFormat = signal<string>('groups_knockout');
  totalTeams = signal(16);
  groupsCount = signal(4);
  qualifiedPerGroup = signal(2);
  knockoutStartPhase = signal('QUARTER_FINALS');
  firstPhaseType = signal('GROUPS');

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

  formats = [
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
      this.advanced.emit('teams');
    }
  }

  returnToPrevious() {
    this.advanced.emit('rules');
  }
}
