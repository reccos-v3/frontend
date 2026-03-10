import { Component, computed, input, output, effect } from '@angular/core';
import { IPhaseConfig } from '../../../../interfaces/setup-types.interface';

export interface IPhase {
  label: string;
  title: string;
  description?: string;
  subDescription?: string;
  icon: string;
  isMain?: boolean;
  opacity?: string;
  // Match rules extras (quando gerado a partir de IPhaseConfig)
  legs?: number;
  advanceRule?: string;
  matchType?: 'single' | 'home_away';
  teamsCount?: number;
  isPreliminaryPhase?: boolean;
}

@Component({
  selector: 'app-setup-sidebar-format',
  standalone: true,
  imports: [],
  templateUrl: './setup-sidebar-format.html',
  styleUrl: './setup-sidebar-format.css',
})
export class SetupSidebarFormat {
  selectedFormat = input<'groups_and_knockout' | 'knockout' | 'points' | 'groups'>('knockout');
  totalTeams = input(16);
  groupsCount = input(4);
  qualifiedPerGroup = input(2);
  isDoubleRound = input(true);
  byePolicy = input<'STANDARD' | 'MAX_ENGAGEMENT'>('STANDARD');
  tiebreakers = input<string[]>(['Saldo de Gols']);
  /**
   * Quando fornecido, as fases do sidebar são derivadas diretamente deste input
   * (gerado pelo KnockoutPhaseGeneratorService), ignorando a lógica interna de preview.
   */
  knockoutPhases = input<IPhaseConfig[] | null>(null);
  phasesChange = output<IPhase[]>();

  totalRounds = computed(() => {
    const format = this.selectedFormat();
    const teams = this.totalTeams();
    const multiplier = this.isDoubleRound() ? 2 : 1;

    if (format === 'points') {
      return (teams - 1) * multiplier;
    }

    if (format === 'groups') {
      const teamsPerGroup = Math.ceil(teams / this.groupsCount());
      return (teamsPerGroup - 1) * multiplier;
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

    if (format === 'groups') {
      const teamsPerGroup = Math.ceil(teams / this.groupsCount());
      const groupsCount = this.groupsCount();
      return ((teamsPerGroup * (teamsPerGroup - 1)) / 2) * groupsCount * multiplier;
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

  /**
   * Converte IPhaseConfig[] (do KnockoutPhaseGeneratorService) em IPhase[] para o sidebar.
   * Quando `knockoutPhases` está disponível, usa essa lógica ao invés da interna.
   */
  phasesFromKnockoutInput = computed<IPhase[] | null>(() => {
    const inputPhases = this.knockoutPhases();
    if (!inputPhases || inputPhases.length === 0) return null;

    const format = this.selectedFormat();
    const result: IPhase[] = [];

    // Se o formato tem fase de grupos, adiciona primeiro
    if (format === 'groups_and_knockout') {
      result.push({
        label: 'Fase 1',
        title: 'Fase de Grupos',
        description: `${this.groupsCount()} Grupos de ${Math.ceil(this.totalTeams() / this.groupsCount())} times`,
        subDescription: `Classificam ${this.qualifiedPerGroup()} por grupo`,
        icon: 'grid_view',
        isMain: true,
      });
    }

    inputPhases.forEach((phase, index) => {
      const isGrandFinal = phase.teamsCount === 2;
      const icon = isGrandFinal
        ? 'emoji_events'
        : phase.teamsCount === 4
          ? 'filter_4'
          : phase.teamsCount === 8
            ? 'filter_8'
            : phase.teamsCount === 16
              ? 'layers'
              : phase.isPreliminary
                ? index === 0
                  ? 'stars'
                  : 'account_tree'
                : 'account_tree';

      const legsLabel = phase.legs === 2 ? 'Ida e Volta' : 'Jogo Único';

      const advanceLabel =
        phase.advanceRule === 'AGGREGATE_SCORE'
          ? 'Placar Agregado'
          : phase.advanceRule === 'AGGREGATE_WITH_AWAY_GOALS'
            ? 'Gols Fora de Casa'
            : 'Pênaltis (Empate)';

      const baseIndex = format === 'groups_and_knockout' ? 2 : 1;
      const label = isGrandFinal ? 'Final' : `Fase ${baseIndex + index}`;

      result.push({
        label,
        title: phase.name,
        description: `${phase.teamsCount} Times · ${legsLabel}`,
        subDescription: advanceLabel,
        icon,
        isMain: !phase.isPreliminary,
        legs: phase.legs,
        advanceRule: phase.advanceRule,
        matchType: phase.matchType,
        teamsCount: phase.teamsCount,
        isPreliminaryPhase: phase.isPreliminary,
      });
    });

    return result;
  });

  phases = computed(() => {
    // Se há fases externas fornecidas pelo componente pai, usa-as
    const external = this.phasesFromKnockoutInput();
    if (external !== null) return external;
    // Lógica interna de preview (usada quando knockoutPhases não é fornecido)
    const format = this.selectedFormat();
    const phases: IPhase[] = [];

    if (format === 'points') return [];

    if (format === 'groups') {
      phases.push({
        label: 'Fase Única',
        title: 'Fase de Grupos',
        description: `${this.groupsCount()} Grupos de ${Math.ceil(this.totalTeams() / this.groupsCount())} times`,
        icon: 'grid_view',
        isMain: true,
      });
      return phases;
    }

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

    // Special logic for first rounds based on policy
    if (this.byePolicy() === 'MAX_ENGAGEMENT') {
      const isPerfect = (currentTeams & (currentTeams - 1)) === 0;
      if (!isPerfect) {
        knockoutPhasesList.push({
          label: '',
          title: 'Rodada de Estreia',
          description: `${currentTeams} Times`,
          subDescription: 'Engajamento Máximo (Todos jogam)',
          icon: 'stars',
        });
        currentTeams = Math.floor(currentTeams / 2) + (currentTeams % 2);
      }
    }

    while (currentTeams >= 2) {
      let slots = 1;
      while (slots < currentTeams) {
        slots *= 2;
      }

      let phaseTitle = '';
      let phaseIcon = '';

      if (slots === 2) {
        phaseTitle = 'Grande Final';
        phaseIcon = 'emoji_events';
      } else if (slots === 4) {
        phaseTitle = 'Semifinal';
        phaseIcon = 'filter_4';
      } else if (slots === 8) {
        phaseTitle = 'Quartas de Final';
        phaseIcon = 'filter_8';
      } else if (slots === 16) {
        phaseTitle = 'Oitavas de Final';
        phaseIcon = 'layers';
      } else {
        phaseTitle = `Fase de ${slots}`;
        phaseIcon = 'account_tree';
      }

      knockoutPhasesList.push({
        label: '',
        title: phaseTitle,
        description: `${currentTeams} Times`,
        subDescription: currentTeams === slots ? 'Chave Completa' : 'Contém Folgas Técnicas',
        icon: phaseIcon,
      });

      currentTeams = slots / 2;
    }

    const currentFormat = this.selectedFormat();
    const baseIndex = currentFormat === 'groups_and_knockout' ? 2 : 1;

    knockoutPhasesList.forEach((phase, index) => {
      phase.label = phase.title === 'Grande Final' ? 'Final' : `Fase ${baseIndex + index}`;
      if (currentFormat === 'knockout' && index === 0) {
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
