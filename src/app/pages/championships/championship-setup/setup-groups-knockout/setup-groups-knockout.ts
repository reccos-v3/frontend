import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { SetupTeamCounter } from '../setup-team-counter/setup-team-counter';
import { AppAlert } from '../../../../components/alert/alert';
import { KnockoutStructureService } from '../../../../services/knockout-structure.service';

import { SetupByePolicy } from '../setup-bye-policy/setup-bye-policy';

@Component({
  selector: 'app-setup-groups-knockout',
  standalone: true,
  imports: [CommonModule, SetupTeamCounter, AppAlert, SetupByePolicy],
  templateUrl: './setup-groups-knockout.html',
})
export class SetupGroupsKnockout {
  private knockoutService = inject(KnockoutStructureService);

  // ===============================
  // INPUTS
  // ===============================

  groupsCount = input.required<number>();
  qualifiedPerGroup = input.required<number>();
  totalTeams = input.required<number>();
  wildcardCount = input<number>(0);
  byePolicy = input<'STANDARD' | 'MAX_ENGAGEMENT'>('STANDARD');

  // ===============================
  // OUTPUTS
  // ===============================

  updateGroupsCount = output<number>();
  updateQualified = output<number>();
  updateTotalTeams = output<number>();
  updateWildcardCount = output<number>();
  updateByePolicy = output<'STANDARD' | 'MAX_ENGAGEMENT'>();

  // ===============================
  // DERIVED STATE
  // ===============================

  totalQualified = computed(
    () => this.groupsCount() * this.qualifiedPerGroup() + this.wildcardCount(),
  );

  onUpdateTotalTeams(delta: number) {
    this.updateTotalTeams.emit(delta);
  }

  validationAlerts = computed(() =>
    this.knockoutService.buildAlerts(
      this.totalQualified(),
      this.totalTeams(),
      'groups',
      this.byePolicy(),
    ),
  );

  // ===============================
  // UI CONFIG
  // ===============================

  configFields = computed(() => [
    {
      id: 'groups',
      label: 'Quantidade de Grupos',
      icon: 'grid_view',
      iconColor: 'blue',
      getValue: () => this.groupsCount(),
      onUpdate: (d: number) => this.updateGroupsCount.emit(d),
    },
    {
      id: 'qualified',
      label: 'Classificados por Grupo',
      icon: 'done_all',
      iconColor: 'green',
      getValue: () => this.qualifiedPerGroup(),
      onUpdate: (d: number) => this.updateQualified.emit(d),
    },
    {
      id: 'wildcards',
      label: 'Vagas Extras',
      icon: 'star',
      iconColor: 'purple',
      getValue: () => this.wildcardCount(),
      onUpdate: (d: number) => this.updateWildcardCount.emit(d),
    },
  ]);
}
