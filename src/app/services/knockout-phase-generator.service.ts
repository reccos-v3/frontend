// src/app/modules/championship/setup/services/knockout-phase-generator.service.ts

import { Injectable } from '@angular/core';
import {
  getKnockoutPhaseKey,
  getKnockoutPhaseName,
  IPhaseConfig,
  KNOCKOUT_PHASE_SLOTS,
} from '../interfaces/setup-types.interface';

export interface KnockoutGeneratorConfig {
  totalTeams: number;
  byesCount: number;
  knockoutStartPhase: string; // ex: 'ROUND_OF_128'
  existingPhases?: { phaseOrder: number; legs: number; advanceRule: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class KnockoutPhaseGeneratorService {
  generatePhases(
    policy: 'STANDARD' | 'MAX_ENGAGEMENT',
    config: KnockoutGeneratorConfig,
  ): IPhaseConfig[] {
    if (policy === 'STANDARD') {
      return this.generateStandardPhases(config);
    }
    if (policy === 'MAX_ENGAGEMENT') {
      return this.generateMaxEngagementPhases(config);
    }
    // fallback / erro silencioso
    console.warn(`Política desconhecida: ${policy}. Usando STANDARD como fallback.`);
    return this.generateStandardPhases(config);
  }

  /**
   * Gera fases no modelo clássico: tudo em potências de 2, byes concentrados na primeira rodada
   */
  private generateStandardPhases(config: KnockoutGeneratorConfig): IPhaseConfig[] {
    const { totalTeams, byesCount, knockoutStartPhase, existingPhases = [] } = config;

    const totalSlots = totalTeams + byesCount;
    const startSlots = KNOCKOUT_PHASE_SLOTS[knockoutStartPhase] || 0;

    // Validação básica
    if (startSlots !== totalSlots || !Number.isInteger(Math.log2(totalSlots))) {
      console.warn(`Configuração STANDARD inválida: ${totalTeams} + ${byesCount} ≠ potência de 2`);
      // Você pode retornar [] ou lançar erro, dependendo da estratégia do app
      return [];
    }

    const result: IPhaseConfig[] = [];
    let currentSlots = startSlots;
    let order = 1;

    while (currentSlots >= 2) {
      const key = getKnockoutPhaseKey(currentSlots) || 'PRELIMINARY';
      const isStandard = ['FINAL', 'SEMI_FINALS', 'QUARTER_FINALS', 'ROUND_OF_16'].includes(key);
      const isPreliminary = !isStandard;
      const name = isStandard ? getKnockoutPhaseName(currentSlots) : 'Fase Preliminar';

      const existing = existingPhases.find((p) => p.phaseOrder === order);
      const legs = existing?.legs ?? 1;
      const advanceRule = existing?.advanceRule ?? 'REGULAR_OR_PENALTIES';
      const matchType = legs === 2 ? 'home_away' : 'single';

      result.push({
        order: order++,
        name,
        matchType,
        legs,
        advanceRule,
        teamsCount: currentSlots,
        isPreliminary,
      });

      currentSlots /= 2;
    }

    return result;
  }

  /**
   * Gera fases no modelo MAX_ENGAGEMENT:
   * - R1: todos (ou quase todos) jogam
   * - R2: fase de ajuste para próxima potência de 2
   * - Depois segue normal
   */
  private generateMaxEngagementPhases(config: KnockoutGeneratorConfig): IPhaseConfig[] {
    // const { totalTeams, knockoutStartPhase, existingPhases = [] } = config;
    // byesCount geralmente é 0 ou 1 nesse modo, mas usamos o valor real
    const { totalTeams, existingPhases = [] } = config;

    const result: IPhaseConfig[] = [];
    let order = 1;

    // Fase 1: Participação máxima (quase todos jogam)
    let currentTeams = totalTeams;
    const byeInR1 = totalTeams % 2 === 1 ? 1 : 0;
    const gamesInR1 = Math.floor((currentTeams - byeInR1) / 2);
    const winnersFromR1 = gamesInR1 + byeInR1;

    const phase1Name =
      totalTeams >= 64 ? 'Rodada Inicial' : getKnockoutPhaseName(totalTeams) || 'Primeira Fase';
    const existing1 = existingPhases.find((p) => p.phaseOrder === order);

    result.push({
      order: order++,
      name: phase1Name,
      matchType: 'single', // geralmente single nessa fase inicial
      legs: existing1?.legs ?? 1,
      advanceRule: existing1?.advanceRule ?? 'REGULAR_OR_PENALTIES',
      teamsCount: currentTeams,
      isPreliminary: true,
    });

    // Fase 2: Ajuste para a próxima potência de 2 para baixo
    currentTeams = winnersFromR1;

    const targetPower = Math.pow(2, Math.floor(Math.log2(currentTeams)));
    const neededByesForAdjust = targetPower * 2 - currentTeams; // folgas técnicas na R2
    // const gamesInAdjust = (currentTeams - neededByesForAdjust) / 2; // não está sendo usado

    if (neededByesForAdjust > 8) {
      console.warn(
        `MAX_ENGAGEMENT inválido: ${neededByesForAdjust} folgas técnicas necessárias > limite de 8`,
      );
      // Aqui você pode retornar fases parciais ou lançar um erro controlado no componente
    }

    const adjustName = `Fase de Ajuste / ${getKnockoutPhaseName(targetPower) || 'Segunda Rodada'}`;
    const existing2 = existingPhases.find((p) => p.phaseOrder === order);

    result.push({
      order: order++,
      name: adjustName,
      matchType: 'single',
      legs: existing2?.legs ?? 1,
      advanceRule: existing2?.advanceRule ?? 'REGULAR_OR_PENALTIES',
      teamsCount: currentTeams,
      isPreliminary: true, // ou criar flag isAdjustment
    });

    // A partir da próxima potência de 2, segue padrão
    let currentSlots = targetPower;
    while (currentSlots >= 2) {
      const key = getKnockoutPhaseKey(currentSlots) || 'PRELIMINARY';
      const isStandard = ['FINAL', 'SEMI_FINALS', 'QUARTER_FINALS', 'ROUND_OF_16'].includes(key);
      const name = isStandard ? getKnockoutPhaseName(currentSlots) : 'Fase';

      const existing = existingPhases.find((p) => p.phaseOrder === order);
      const legs = existing?.legs ?? 1;
      const advanceRule = existing?.advanceRule ?? 'REGULAR_OR_PENALTIES';
      const matchType = legs === 2 ? 'home_away' : 'single';

      result.push({
        order: order++,
        name,
        matchType,
        legs,
        advanceRule,
        teamsCount: currentSlots,
        isPreliminary: !isStandard,
      });

      currentSlots /= 2;
    }

    return result;
  }
}
