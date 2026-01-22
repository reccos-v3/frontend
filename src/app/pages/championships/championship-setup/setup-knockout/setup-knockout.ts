import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { SetupTeamCounter } from '../setup-team-counter/setup-team-counter';

@Component({
  selector: 'app-setup-knockout',
  standalone: true,
  imports: [CommonModule, SetupTeamCounter],
  templateUrl: './setup-knockout.html',
})
export class SetupKnockout {
  totalTeams = input.required<number>();
  updateTotalTeams = output<number>();

  onUpdateTotalTeams(delta: number) {
    this.updateTotalTeams.emit(delta);
  }
}
