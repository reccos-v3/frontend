import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupSystemFormat } from '../setup-system-format/setup-system-format';

interface IFormat {
  id: 'groups_and_knockout' | 'knockout' | 'points';
  icon: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-setup-championship-format',
  standalone: true,
  imports: [CommonModule, SetupSystemFormat],
  templateUrl: './setup-championship-format.html',
})
export class SetupChampionshipFormat {
  selectedFormat = input.required<'groups_and_knockout' | 'knockout' | 'points'>();
  totalTeams = input.required<number>();
  groupsCount = input.required<number>();
  qualifiedPerGroup = input.required<number>();

  updateFormat = output<'groups_and_knockout' | 'knockout' | 'points'>();
  updateGroupsCount = output<number>();
  updateQualified = output<number>();
  updateTotalTeams = output<number>();

  isExpanded = true;

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

  toggleExpansion() {
    this.isExpanded = !this.isExpanded;
  }

  changeFormat(id: 'groups_and_knockout' | 'knockout' | 'points') {
    this.updateFormat.emit(id);
  }

  changeGroupsCount(val: number) {
    this.updateGroupsCount.emit(val);
  }

  changeQualified(val: number) {
    this.updateQualified.emit(val);
  }

  changeTotalTeams(val: number) {
    this.updateTotalTeams.emit(val);
  }
}
