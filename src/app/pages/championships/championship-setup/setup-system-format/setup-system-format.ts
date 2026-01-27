import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { SetupGroupsKnockout } from '../setup-groups-knockout/setup-groups-knockout';
import { SetupKnockout } from '../setup-knockout/setup-knockout';
import { SetupRoundRobin } from '../setup-round-robin/setup-round-robin';

@Component({
  selector: 'app-setup-system-format',
  standalone: true,
  imports: [CommonModule, SetupGroupsKnockout, SetupKnockout, SetupRoundRobin],
  templateUrl: './setup-system-format.html',
  styleUrl: './setup-system-format.css',
})
export class SetupSystemFormat {
  format = input<string>('groups_and_knockout');

  groupsCount = input.required<number>();
  qualifiedPerGroup = input.required<number>();
  totalTeams = input.required<number>();

  updateGroupsCount = output<number>();
  updateQualified = output<number>();
  updateTotalTeams = output<number>();

  phaseName = computed(() => {
    const teams = this.totalTeams();
    if (teams === 2) return 'Final';
    if (teams === 4) return 'Semifinais';
    if (teams === 8) return 'Quartas de Final';
    if (teams === 16) return 'Oitavas de Final';

    return `Rodada de ${teams}`;
  });

  changeGroupsCount(val: number) {
    this.updateGroupsCount.emit(val);
  }

  changeQualified(val: number) {
    this.updateQualified.emit(val);
  }

  changeTotalTeams(val: number) {
    this.updateTotalTeams.emit(val);
  }

  onTotalTeamsInput(event: any) {
    const val = parseInt(event.target.value, 10);
    if (!isNaN(val)) {
      this.updateTotalTeams.emit(val - this.totalTeams());
    }
  }
}
