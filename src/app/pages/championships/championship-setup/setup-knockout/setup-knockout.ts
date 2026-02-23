import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { SetupTeamCounter } from '../setup-team-counter/setup-team-counter';
import { KnockoutStructureService } from '../../../../services/knockout-structure.service';
import { AppAlert } from '../../../../components/alert/alert';

@Component({
  selector: 'app-setup-knockout',
  standalone: true,
  imports: [CommonModule, SetupTeamCounter, AppAlert],
  templateUrl: './setup-knockout.html',
})
export class SetupKnockout {
  private knockoutService = inject(KnockoutStructureService);

  totalTeams = input.required<number>();
  updateTotalTeams = output<number>();

  validationAlerts = computed(() =>
    this.knockoutService.buildAlerts(this.totalTeams(), this.totalTeams(), 'knockout'),
  );

  onUpdateTotalTeams(delta: number) {
    this.updateTotalTeams.emit(delta);
  }
}
