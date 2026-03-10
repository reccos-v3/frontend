import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { SetupTeamCounter } from '../setup-team-counter/setup-team-counter';
import { KnockoutStructureService } from '../../../../services/knockout-structure.service';

import { SetupByePolicy } from '../setup-bye-policy/setup-bye-policy';

@Component({
  selector: 'app-setup-knockout',
  standalone: true,
  imports: [CommonModule, SetupTeamCounter, SetupByePolicy],
  templateUrl: './setup-knockout.html',
})
export class SetupKnockout {
  private knockoutService = inject(KnockoutStructureService);

  totalTeams = input.required<number>();
  byePolicy = input<'STANDARD' | 'MAX_ENGAGEMENT'>('STANDARD');
  updateTotalTeams = output<number>();
  updateByePolicy = output<'STANDARD' | 'MAX_ENGAGEMENT'>();

  validationAlerts = computed(() =>
    this.knockoutService.buildAlerts(
      this.totalTeams(),
      this.totalTeams(),
      'knockout',
      this.byePolicy(),
    ),
  );

  onUpdateTotalTeams(delta: number) {
    this.updateTotalTeams.emit(delta);
  }
}
