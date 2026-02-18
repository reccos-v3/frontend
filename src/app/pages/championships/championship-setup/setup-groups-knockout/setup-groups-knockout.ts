import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { SetupTeamCounter } from '../setup-team-counter/setup-team-counter';

@Component({
  selector: 'app-setup-groups-knockout',
  standalone: true,
  imports: [CommonModule, SetupTeamCounter],
  templateUrl: './setup-groups-knockout.html',
})
export class SetupGroupsKnockout {
  groupsCount = input.required<number>();
  qualifiedPerGroup = input.required<number>();
  totalTeams = input.required<number>();
  wildcardCount = input<number>(0);

  updateGroupsCount = output<number>();
  updateQualified = output<number>();
  updateTotalTeams = output<number>();
  updateWildcardCount = output<number>();

  // Tabela de fases conhecidas (potências de 2)
  knockoutPhases = [
    { value: 'FINAL', label: 'Final', teams: 2 },
    { value: 'SEMI_FINALS', label: 'Semifinais', teams: 4 },
    { value: 'QUARTER_FINALS', label: 'Quartas de Final', teams: 8 },
    { value: 'ROUND_OF_16', label: 'Oitavas de Final', teams: 16 },
    { value: 'ROUND_OF_32', label: 'Fase de 32', teams: 32 },
    { value: 'ROUND_OF_64', label: 'Fase de 64', teams: 64 },
  ];

  // Total de classificados (grupos × classificados + wildcards)
  totalQualified = computed(
    () => this.groupsCount() * this.qualifiedPerGroup() + this.wildcardCount(),
  );

  // Próxima potência de 2 acima (estrutura padrão)
  targetPhase = computed(() => {
    const q = this.totalQualified();
    if (q <= 0) return this.knockoutPhases[3]; // padrão visual

    return (
      this.knockoutPhases.find((p) => p.teams >= q) ??
      this.knockoutPhases[this.knockoutPhases.length - 1]
    );
  });

  // Potência imediatamente inferior (para cenário de preliminar)
  lowerPhase = computed(() => {
    const q = this.totalQualified();
    if (q <= 0) return null;

    const phasesAsc = [...this.knockoutPhases].sort((a, b) => a.teams - b.teams);

    let lower = phasesAsc[0];
    for (const phase of phasesAsc) {
      if (phase.teams <= q) {
        lower = phase;
      } else {
        break;
      }
    }

    return lower;
  });

  validationAlerts = computed(() => {
    const qualified = this.totalQualified();
    const totalCapacidade = this.totalTeams();
    const target = this.targetPhase();
    const lower = this.lowerPhase();

    const alerts: {
      type: 'error' | 'warning' | 'success' | 'info';
      title: string;
      message: string;
    }[] = [];

    // 1. Validação de teto físico
    if (qualified > totalCapacidade) {
      alerts.push({
        type: 'error',
        title: 'Capacidade Excedida',
        message: `Você está classificando ${qualified} times, mas o torneio suporta apenas ${totalCapacidade}. Ajuste os grupos, classificados ou wildcards.`,
      });
      return alerts;
    }

    if (qualified === 0) return alerts;

    const upperDiff = target.teams - qualified;

    // 2. Caso perfeito
    if (upperDiff === 0) {
      alerts.push({
        type: 'success',
        title: 'Sincronia Perfeita',
        message: `Os ${qualified} classificados formam um mata-mata perfeito iniciando nas ${target.label}.`,
      });
      return alerts;
    }

    // 3. Estrutura adaptável (sem botão)
    const lowerTeams = lower?.teams ?? 0;
    const eliminacoesNecessarias = qualified - lowerTeams;
    const jogosPreliminares = eliminacoesNecessarias;
    const timesEnvolvidosPre = jogosPreliminares * 2;
    const timesDiretos = qualified - timesEnvolvidosPre;

    alerts.push({
      type: 'info',
      title: 'Estrutura Adaptável',
      message:
        `Você possui ${qualified} classificados. A estrutura padrão exige ${target.teams} times (${target.label}). ` +
        `Você pode adicionar ${upperDiff} wildcards para iniciar diretamente nas ${target.label}, ` +
        `ou disputar ${jogosPreliminares} jogo${jogosPreliminares > 1 ? 's' : ''} preliminar${jogosPreliminares > 1 ? 'es' : ''} ` +
        `(${timesEnvolvidosPre} times envolvidos, ${timesDiretos} avançam direto) ` +
        `para iniciar nas ${lower?.label}.`,
    });

    return alerts;
  });

  onUpdateTotalTeams(delta: number) {
    this.updateTotalTeams.emit(delta);
  }

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
      label: 'Vagas Extras (Wildcards)',
      icon: 'star',
      iconColor: 'purple',
      getValue: () => this.wildcardCount(),
      onUpdate: (d: number) => this.updateWildcardCount.emit(d),
    },
  ]);
}
