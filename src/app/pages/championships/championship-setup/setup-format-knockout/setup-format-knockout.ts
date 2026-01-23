import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { AppAlert } from '../../../../components/alert/alert';
import { IPhaseConfig } from '../setup-types';
import { IPhase } from '../setup-sidebar-format/setup-sidebar-format';

@Component({
  selector: 'app-setup-format-knockout',
  standalone: true,
  imports: [CommonModule, AppAlert],
  templateUrl: './setup-format-knockout.html',
  styleUrl: './setup-format-knockout.css',
})
export class SetupFormatKnockout {
  totalTeams = input.required<number>();
  externalPhases = input<IPhase[]>([]);
  updatePhaseConfigs = output<IPhaseConfig[]>();

  // Overrides state: Map phase order to config overrides
  overrides = signal<Record<number, Partial<IPhaseConfig>>>({});

  phases = computed<IPhaseConfig[]>(() => {
    const teams = this.totalTeams();
    const result: IPhaseConfig[] = [];

    if (teams < 2) return [];

    let currentTeams = teams;
    let order = 1;

    // 1. Determine if there is a preliminary phase
    // A preliminary phase is needed if teams is not a power of 2
    // We want to reduce currentTeams to the largest power of 2 less than currentTeams
    const nextPowerOf2 = Math.pow(2, Math.floor(Math.log2(teams)));

    if (teams > nextPowerOf2) {
      const teamsInPrelim = (teams - nextPowerOf2) * 2;
      const override = this.overrides()[order] || {};

      result.push({
        order: order++,
        name: 'Fase Preliminar',
        matchType: override.matchType || 'single',
        legs: override.matchType === 'home_away' ? 2 : 1,
        teamsCount: teamsInPrelim,
        isPreliminary: true,
      });

      currentTeams = nextPowerOf2;
    }

    // 2. Main phases
    while (currentTeams >= 2) {
      const override = this.overrides()[order] || {};
      let name = '';

      if (currentTeams === 2) name = 'Grande Final';
      else if (currentTeams === 4) name = 'Semifinal';
      else if (currentTeams === 8) name = 'Quartas de Final';
      else if (currentTeams === 16) name = 'Oitavas de Final';
      else name = `${result.length + 1}ª Fase`;

      result.push({
        order: order++,
        name: name,
        matchType: override.matchType || 'single',
        legs: override.matchType === 'home_away' ? 2 : 1,
        teamsCount: currentTeams,
        isPreliminary: false,
      });

      currentTeams /= 2;
    }

    return result;
  });

  hasPreliminary = computed(() => this.phases().some((p) => p.isPreliminary));

  toggleMatchType(phaseOrder: number, type: 'single' | 'home_away') {
    this.overrides.update((prev) => ({
      ...prev,
      [phaseOrder]: {
        ...prev[phaseOrder],
        matchType: type,
      },
    }));
    this.updatePhaseConfigs.emit(this.phases());
  }

  isSelectionInvalid(phase: IPhaseConfig): boolean {
    return phase.matchType === 'home_away' && phase.teamsCount % 2 !== 0;
  }
}
