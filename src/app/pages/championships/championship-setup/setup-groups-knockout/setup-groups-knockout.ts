import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { SetupTeamCounter } from '../setup-team-counter/setup-team-counter';

@Component({
  selector: 'app-setup-groups-knockout',
  standalone: true,
  imports: [CommonModule, SetupTeamCounter],
  templateUrl: './setup-groups-knockout.html',
})
export class SetupGroupsKnockout {
  groupsCount = input.required<number>();
  qualifiedPerGroup = input.required<number>();
  totalTeams = input.required<number>();

  updateGroupsCount = output<number>();
  updateQualified = output<number>();
  updateTotalTeams = output<number>();

  onUpdateTotalTeams(delta: number) {
    this.updateTotalTeams.emit(delta);
  }
}
