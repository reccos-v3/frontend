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
  // ALERT BUILDER (COM CONTEXTO)
  // =========================================================

  buildAlerts(teams: number, totalCapacity: number, context: KnockoutContext): KnockoutAlert[] {
    const alerts: KnockoutAlert[] = [];

    const lowerPower = this.getLargestPowerOfTwo(teams);
    const target = this.getTargetPhase(teams);

    const isPerfect = teams === lowerPower;
    const isOverflow = teams > totalCapacity;

    const nextPhase = this.getNextPhaseLabel(teams);

    // ============================
    // 1️⃣ OVERFLOW
    // ============================

    if (isOverflow) {
      alerts.push({
        type: 'error',
        title: 'Inconsistência Estrutural',
        message:
          context === 'groups'
            ? `
              A configuração atual prevê <strong>${teams} equipes classificadas</strong>,
              enquanto a estrutura definida comporta até <strong>${totalCapacity} equipes</strong> na fase eliminatória.

              <p>Revise a quantidade de classificados por grupo ou o número de grupos configurados.</p>

              A geração do mata-mata ficará indisponível até a correção.
            `
            : `
              A estrutura atual define <strong>${teams} equipes participantes</strong>,
              porém o limite configurado para esta chave é de <strong>${totalCapacity} equipes</strong>.

              Ajuste o total de participantes para restabelecer a consistência estrutural.
            `,
      });

      return alerts;
    }

    // ============================
    // 2️⃣ ZERO TEAMS
    // ============================

    if (teams === 0) {
      alerts.push({
        type: 'info',
        title: 'Configuração Incompleta',
        message: `
          Nenhuma equipe foi definida para a fase eliminatória.

          Defina ao menos um participante para que a estrutura do mata-mata possa ser organizada.
        `,
      });

      return alerts;
    }

    // ============================
    // 3️⃣ PERFECT STRUCTURE
    // ============================

    if (isPerfect) {
      alerts.push({
        type: 'success',
        title: 'Estrutura Confirmada',
        message: `
          A configuração atual define <strong>${teams} equipes</strong>.

          Essa quantidade permite iniciar diretamente a fase 
          <strong>${target.label}</strong>, que exige <strong>${target.teams} equipes</strong>.

          Nenhuma fase preliminar será necessária.
        `,
      });

      return alerts;
    }

    // ============================
    // 4️⃣ PRELIMINARY REQUIRED
    // ============================

    alerts.push({
      type: 'info',
      title: 'Fase Preliminar Necessária',
      message:
        context === 'groups'
          ? `
            A configuração atual define <strong>${teams} equipes classificadas</strong>.

            A fase principal será organizada em <strong>${target.label}</strong>,
            que comporta <strong>${target.teams} equipes</strong>.

            As equipes excedentes disputarão uma <strong>fase preliminar</strong>
            para definição das vagas restantes.

            A fase principal iniciará em <strong>${nextPhase}</strong>.
          `
          : `
            A configuração atual define <strong>${teams} equipes participantes</strong>.

            O sistema organizará automaticamente uma <strong>fase preliminar</strong>
            para ajustar o chaveamento.

            A fase principal iniciará em <strong>${nextPhase}</strong>,
            com <strong>${target.teams} equipes</strong>.
          `,
    });

    return alerts;
  }
}
