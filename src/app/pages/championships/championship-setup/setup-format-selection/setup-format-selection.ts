import { Component, input, output } from '@angular/core';
import { SetupSystemFormat } from '../setup-system-format/setup-system-format';
import { FormatCalendarPreferences } from '../format-calendar-preferences/format-calendar-preferences';
import { ISchedulePreferences } from '../../../../interfaces/setup-types.interface';

interface IFormat {
  id: 'groups_and_knockout' | 'knockout' | 'points';
  icon: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-setup-knockout',
  standalone: true,
  imports: [SetupSystemFormat, FormatCalendarPreferences],
  templateUrl: './setup-format-selection.html',
})
export class SetupFormatSelection {
  selectedFormat = input.required<'groups_and_knockout' | 'knockout' | 'points'>();
  totalTeams = input.required<number>();
  groupsCount = input.required<number>();
  qualifiedPerGroup = input.required<number>();

  updateFormat = output<'groups_and_knockout' | 'knockout' | 'points'>();
  updateGroupsCount = output<number>();
  updateQualified = output<number>();
  updateTotalTeams = output<number>();
  updateSchedulePreferences = output<ISchedulePreferences>();

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

  changeSchedulePreferences(preferences: ISchedulePreferences) {
    this.updateSchedulePreferences.emit(preferences);
  }
}
