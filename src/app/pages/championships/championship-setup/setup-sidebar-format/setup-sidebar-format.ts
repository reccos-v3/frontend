import { Component, computed, input, output, effect } from '@angular/core';

export interface IPhase {
  label: string;
  title: string;
  description?: string;
  subDescription?: string;
  icon: string;
  isMain?: boolean;
  opacity?: string;
}

@Component({
  selector: 'app-setup-sidebar-format',
  standalone: true,
  imports: [],
  templateUrl: './setup-sidebar-format.html',
  styleUrl: './setup-sidebar-format.css',
})
export class SetupSidebarFormat {
  selectedFormat = input<'groups_and_knockout' | 'knockout' | 'points'>('knockout');
  totalTeams = input(16);
  groupsCount = input(4);
  qualifiedPerGroup = input(2);
  isDoubleRound = input(true);
  tiebreakers = input<string[]>(['Saldo de Gols']);
  phasesChange = output<IPhase[]>();

  totalRounds = computed(() => {
    const format = this.selectedFormat();
    const teams = this.totalTeams();
    const multiplier = this.isDoubleRound() ? 2 : 1;

    if (format === 'points') {
      return (teams - 1) * multiplier;
    }

    if (format === 'knockout') {
      // Approximate for single elim knockout
      return Math.ceil(Math.log2(teams)) * multiplier;
    }

    if (format === 'groups_and_knockout') {
      const groupRounds = (Math.ceil(teams / this.groupsCount()) - 1) * 1; // Groups usually single round in this setup
      const knockoutTeams = this.groupsCount() * this.qualifiedPerGroup();
      const knockoutRounds = Math.ceil(Math.log2(knockoutTeams)) * multiplier;
      return groupRounds + knockoutRounds;
    }

    return 0;
  });

  matchesPerTeam = computed(() => {
    const format = this.selectedFormat();
    const multiplier = this.isDoubleRound() ? 2 : 1;

    if (format === 'points') {
      return (this.totalTeams() - 1) * multiplier;
    }

    // For other formats it varies, but usually it's the same as rounds in points
    return this.totalRounds();
  });

  totalGames = computed(() => {
    const format = this.selectedFormat();
    const teams = this.totalTeams();
    const multiplier = this.isDoubleRound() ? 2 : 1;

    if (format === 'points') {
      return ((teams * (teams - 1)) / 2) * multiplier;
    }

    if (format === 'knockout') {
      return (teams - 1) * multiplier;
    }

    if (format === 'groups_and_knockout') {
      const teamsPerGroup = Math.ceil(teams / this.groupsCount());
      const groupsCount = this.groupsCount();
      const groupGames = ((teamsPerGroup * (teamsPerGroup - 1)) / 2) * groupsCount;
      const knockoutTeams = groupsCount * this.qualifiedPerGroup();
      const knockoutGames = (knockoutTeams - 1) * multiplier;
      return groupGames + knockoutGames;
    }

    return 0;
  });

  phases = computed(() => {
    const format = this.selectedFormat();
    const phases: IPhase[] = [];

    if (format === 'points') return [];

    let knockoutTeams = 0;

    if (format === 'groups_and_knockout') {
      phases.push({
        label: 'Fase 1',
        title: 'Fase de Grupos',
        description: `${this.groupsCount()} Grupos de ${Math.ceil(this.totalTeams() / this.groupsCount())} times`,
        subDescription: `Classificam ${this.qualifiedPerGroup()} por groupo`,
        icon: 'grid_view',
        isMain: true,
      });
      knockoutTeams = this.groupsCount() * this.qualifiedPerGroup();
    } else {
      knockoutTeams = this.totalTeams();
    }

    // Generate knockout phases [Initial, ..., Final]
    const knockoutPhasesList: IPhase[] = [];
    let currentTeams = knockoutTeams;
    let roundCounter = 1;

    while (currentTeams >= 2) {
      let phaseTitle = '';
      let phaseIcon = '';

      if (currentTeams === 2) {
        phaseTitle = 'Grande Final';
        phaseIcon = 'emoji_events';
      } else if (currentTeams === 4) {
        phaseTitle = 'Semifinal';
        phaseIcon = 'filter_4';
      } else if (currentTeams === 8) {
        phaseTitle = 'Quartas de Final';
        phaseIcon = 'filter_8';
      } else if (currentTeams === 16) {
        phaseTitle = 'Oitavas de Final';
        phaseIcon = 'layers';
      } else {
        phaseTitle = `Rodada ${roundCounter}`;
        phaseIcon = 'account_tree';
        roundCounter++;
      }

      knockoutPhasesList.push({
        label: '',
        title: phaseTitle,
        description: `${currentTeams} Times`,
        subDescription: currentTeams === 2 ? undefined : 'Mata-mata (Jogo único)',
        icon: phaseIcon,
      });

      currentTeams = Math.floor(currentTeams / 2);
    }

    const baseIndex = format === 'groups_and_knockout' ? 2 : 1;
    knockoutPhasesList.forEach((phase, index) => {
      if (phase.title === 'Grande Final') {
        phase.label = 'Final';
      } else {
        phase.label = `Fase ${baseIndex + index}`;
      }

      if (format === 'knockout' && index === 0) {
        phase.isMain = true;
      }

      phases.push(phase);
    });

    return phases;
  });

  constructor() {
    effect(() => {
      this.phasesChange.emit(this.phases());
    });
  }
}
