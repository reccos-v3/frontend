import { Injectable } from '@angular/core';

export interface KnockoutPhase {
  value: string;
  label: string;
  teams: number;
}

export interface KnockoutAlert {
  type: 'error' | 'success' | 'info';
  title: string;
  message: string;
}

export type KnockoutContext = 'groups' | 'knockout';

@Injectable({
  providedIn: 'root',
})
export class KnockoutStructureService {
  private readonly phases: KnockoutPhase[] = [
    { value: 'FINAL', label: 'Final', teams: 2 },
    { value: 'SEMI_FINALS', label: 'Semifinais', teams: 4 },
    { value: 'QUARTER_FINALS', label: 'Quartas de Final', teams: 8 },
    { value: 'ROUND_OF_16', label: 'Oitavas de Final', teams: 16 },
    { value: 'ROUND_OF_32', label: 'Fase de 32', teams: 32 },
    { value: 'ROUND_OF_64', label: 'Fase de 64', teams: 64 },
  ];

  // =========================================================
  // CORE STRUCTURE
  // =========================================================

  private getLargestPowerOfTwo(teams: number): number {
    if (teams < 2) return 0;
    return 2 ** Math.floor(Math.log2(teams));
  }

  private getTargetPhase(teams: number): KnockoutPhase {
    if (teams <= 0) {
      return this.phases[3]; // padrão: Oitavas
    }

    const lowerPower = this.getLargestPowerOfTwo(teams);

    return this.phases.find((p) => p.teams === lowerPower) ?? this.phases[this.phases.length - 1];
  }

  private getNextPhaseLabel(teams: number): string {
    const power = this.getLargestPowerOfTwo(teams);

    const map: Record<number, string> = {
      2: 'Final',
      4: 'Semifinais',
      8: 'Quartas de Final',
      16: 'Oitavas de Final',
      32: 'Fase de 32',
      64: 'Fase de 64',
    };

    return map[power] ?? `Fase com ${power} equipes`;
  }

  // =========================================================
  // BYE SUGGESTIONS
  // =========================================================

  suggestByes(teams: number, policy: 'STANDARD' | 'MAX_ENGAGEMENT'): number {
    if (teams <= 0) return 0;

    if (policy === 'MAX_ENGAGEMENT') {
      return teams % 2 === 0 ? 0 : 1;
    }

    // STANDARD: usa a next power of 2
    let power = 2;
    while (power < teams) {
      power *= 2;
    }
    return power - teams;
  }

  // =========================================================
  // ALERT BUILDER (COM CONTEXTO)
  // =========================================================
  buildAlerts(
    teams: number,
    totalCapacity: number,
    context: KnockoutContext,
    byePolicy: 'STANDARD' | 'MAX_ENGAGEMENT' = 'STANDARD',
  ): KnockoutAlert[] {
    const alerts: KnockoutAlert[] = [];

    const lowerPower = this.getLargestPowerOfTwo(teams);
    const target = this.getTargetPhase(teams);

    const isPerfect = teams === lowerPower;
    const isOverflow = teams > totalCapacity;

    // ============ 1️⃣ OVERFLOW ============
    if (isOverflow) {
      alerts.push({
        type: 'error',
        title: 'Inconsistência Estrutural',
        message: 'A quantidade de equipes excede o limite configurado.',
      });
      return alerts;
    }

    // ============ 2️⃣ ZERO TEAMS ============
    if (teams === 0) {
      alerts.push({
        type: 'info',
        title: 'Configuração Incompleta',
        message: 'Defina ao menos um participante.',
      });
      return alerts;
    }

    // ============ 3️⃣ MAX_ENGAGEMENT ============
    if (byePolicy === 'MAX_ENGAGEMENT') {
      const teamsEnteringR2 = Math.floor(teams / 2) + (teams % 2);
      const p = this.getLargestPowerOfTwo(teamsEnteringR2);
      const r2Byes = 2 * p - teamsEnteringR2;

      if (r2Byes > 8) {
        alerts.push({
          type: 'error',
          title: 'Engajamento Máximo Inválido',
          message: `O limite de 8 folgas técnicas na R2 foi excedido (${r2Byes} necessárias).`,
        });
        return alerts;
      }

      alerts.push({
        type: 'success',
        title: 'Estrutura de Engajamento Máximo',
        message: `Todos estreiam jogando${teams % 2 !== 0 ? ' (exceto 1)' : ''}.`,
      });
      return alerts;
    }

    // ============ 4️⃣ STANDARD ============
    if (isPerfect) {
      alerts.push({
        type: 'success',
        title: 'Estrutura Confirmada',
        message: `Simetria perfeita iniciando em <strong>${target.label}</strong>.`,
      });
    } else {
      const byes = this.suggestByes(teams, 'STANDARD');
      alerts.push({
        type: 'info',
        title: 'Simetria com Folgas',
        message: `Serão aplicadas <strong>${byes} folgas</strong> na 1ª rodada (Times melhor ranqueados avançam direto).`,
      });
    }

    return alerts;
  }
}
