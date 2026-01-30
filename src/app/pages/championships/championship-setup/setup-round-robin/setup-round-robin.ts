import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { SetupTeamCounter } from '../setup-team-counter/setup-team-counter';

@Component({
  selector: 'app-setup-round-robin',
  standalone: true,
  imports: [CommonModule, SetupTeamCounter],
  templateUrl: './setup-round-robin.html',
})
export class SetupRoundRobin {
  totalTeams = input.required<number>();
  isDoubleRound = input<boolean>(true);
  updateTotalTeams = output<number>();
  updateDoubleRound = output<boolean>();

  private multiplier = computed(() => (this.isDoubleRound() ? 2 : 1));

  totalRounds = computed(() => (this.totalTeams() - 1) * this.multiplier());
  gamesPerTeam = computed(() => (this.totalTeams() - 1) * this.multiplier());

  onUpdateTotalTeams(delta: number) {
    this.updateTotalTeams.emit(delta);
  }

  toggleDoubleRound() {
    this.updateDoubleRound.emit(!this.isDoubleRound());
  }
}
