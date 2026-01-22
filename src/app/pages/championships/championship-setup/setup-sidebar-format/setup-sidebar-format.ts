import { Component, computed, input } from '@angular/core';

interface IPhase {
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
  selectedFormat = input<'groups_knockout' | 'knockout' | 'round_robin'>('knockout');
  totalTeams = input(16);
  groupsCount = input(4);
  qualifiedPerGroup = input(2);

  phases = computed(() => {
    const format = this.selectedFormat();
    const phases: IPhase[] = [];

    if (format === 'round_robin') return [];

    let knockoutTeams = 0;

    if (format === 'groups_knockout') {
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

    const baseIndex = format === 'groups_knockout' ? 2 : 1;
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
}
