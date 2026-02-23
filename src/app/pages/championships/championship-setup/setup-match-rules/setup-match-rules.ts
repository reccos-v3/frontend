import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppAlert } from '../../../../components/alert/alert';
import {
  IPhaseConfig,
  KNOCKOUT_PHASE_SLOTS,
  getKnockoutPhaseName,
  getKnockoutPhaseKey,
} from '../../../../interfaces/setup-types.interface';
import { ChampionshipStore } from '../../../../services/championship.store';
import { ChampionshipSetupService } from '../../../../services/championship-setup.service';
import { IMatchRulesRequest } from '../../../../interfaces/championship-setup.interface';

@Component({
  selector: 'app-setup-match-rules',
  standalone: true,
  imports: [CommonModule, AppAlert],
  templateUrl: './setup-match-rules.html',
  styleUrl: './setup-match-rules.css',
})
export class SetupMatchRules {
  private championshipStore = inject(ChampionshipStore);
  private championshipSetupService = inject(ChampionshipSetupService);
  private router = inject(Router);

  championship = this.championshipStore.championship;
  loading = signal(false);

  constructor() {
    effect(
      () => {
        // Reset defaults to requested base: Single Leg and Penalties
        this.defaultLegs.set(1);
        this.defaultAdvanceRule.set('REGULAR_OR_PENALTIES');
      },
      { allowSignalWrites: true },
    );
  }

  defaultLegs = signal<number>(1);
  defaultAdvanceRule = signal<string>('REGULAR_OR_PENALTIES');

  // Overrides state: Map phase order to config overrides
  overrides = signal<Record<number, Partial<IPhaseConfig>>>({});

  phases = computed<IPhaseConfig[]>(() => {
    const data = this.championship();
    if (!data?.structure?.knockoutStartPhase) return [];

    const result: IPhaseConfig[] = [];
    const struct = data.structure;
    const startPhaseStr = struct.knockoutStartPhase;

    let currentSlots = KNOCKOUT_PHASE_SLOTS[startPhaseStr!] || 0;
    let order = 1;

    // Se houver primeira fase de grupos, o mata-mata começa na ordem 2
    if (struct.firstPhaseType === 'GROUPS') {
      order = 2;
    }

    const phaseOverrides = this.overrides();
    const existingPhases = struct.knockoutConfig?.phases || [];

    while (currentSlots >= 2) {
      const key = getKnockoutPhaseKey(currentSlots) || 'PRELIMINARY';
      const isStandard = ['FINAL', 'SEMI_FINALS', 'QUARTER_FINALS', 'ROUND_OF_16'].includes(key);
      const isPreliminary = !isStandard;

      const name = isStandard ? getKnockoutPhaseName(currentSlots) : 'Fase Preliminar';

      const override = phaseOverrides[order];
      const existing = existingPhases.find((p) => p.phaseOrder === order);

      // Hardcoded defaults for specific phases as requested for the "Initial Configuration"
      const defaultLegs = 1;
      const defaultRule = 'REGULAR_OR_PENALTIES';

      const legs = override?.legs || existing?.legs || defaultLegs;
      const advanceRule = override?.advanceRule || existing?.advanceRule || defaultRule;
      const matchType = override?.matchType || (legs === 2 ? 'home_away' : 'single');

      result.push({
        order: order++,
        name,
        matchType: matchType as 'single' | 'home_away',
        legs,
        advanceRule,
        teamsCount: currentSlots,
        isPreliminary,
      });

      currentSlots /= 2;
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
        legs: type === 'home_away' ? 2 : 1,
      },
    }));
  }

  toggleAdvanceRule(phaseOrder: number, rule: string) {
    this.overrides.update((prev) => ({
      ...prev,
      [phaseOrder]: {
        ...prev[phaseOrder],
        advanceRule: rule,
      },
    }));
  }

  updateDefaultLegs(legs: number) {
    this.defaultLegs.set(legs);
  }

  updateDefaultAdvanceRule(rule: string) {
    this.defaultAdvanceRule.set(rule);
  }

  // Propagation UI State
  isReplicaOpen = signal(false);
  selectedPhasesForReplica = signal<number[]>([]);

  allPhasesSelected = computed(() => {
    const total = this.phases().length;
    return total > 0 && this.selectedPhasesForReplica().length === total;
  });

  toggleReplicaDropdown() {
    this.isReplicaOpen.update((v) => !v);
    if (this.isReplicaOpen()) {
      // Auto select all when opening for the first time or if none selected
      if (this.selectedPhasesForReplica().length === 0) {
        this.selectedPhasesForReplica.set(this.phases().map((p) => p.order));
      }
    }
  }

  toggleAllReplicaPhases() {
    if (this.allPhasesSelected()) {
      this.selectedPhasesForReplica.set([]);
    } else {
      this.selectedPhasesForReplica.set(this.phases().map((p) => p.order));
    }
  }

  toggleReplicaPhaseSelection(order: number) {
    this.selectedPhasesForReplica.update((prev) => {
      if (prev.includes(order)) {
        return prev.filter((o) => o !== order);
      } else {
        return [...prev, order];
      }
    });
  }

  /**
   * Propagates the current global defaults to selected specific phases
   */
  propagateDefaults() {
    const selectedOrders = this.selectedPhasesForReplica();
    if (selectedOrders.length === 0) return;

    const legs = this.defaultLegs();
    const rule = this.defaultAdvanceRule();

    this.overrides.update((prev) => {
      const next = { ...prev };
      selectedOrders.forEach((order) => {
        next[order] = {
          legs: legs,
          matchType: legs === 2 ? 'home_away' : 'single',
          advanceRule: rule,
        };
      });
      return next;
    });

    this.isReplicaOpen.set(false);
  }

  isSelectionInvalid(phase: IPhaseConfig): boolean {
    return phase.matchType === 'home_away' && phase.teamsCount % 2 !== 0;
  }

  private buildConfig(): IMatchRulesRequest {
    return {
      defaultLegs: this.defaultLegs(),
      defaultAdvanceRule: this.defaultAdvanceRule(),
      phases: this.phases().map((p) => {
        let phaseType = getKnockoutPhaseKey(p.teamsCount) || 'PRELIMINARY';

        // If it's a phase not explicitly handled by specific names in backend enum, fallback to PRELIMINARY
        const allowedPhases = [
          'FINAL',
          'SEMI_FINALS',
          'QUARTER_FINALS',
          'ROUND_OF_16',
          'PRELIMINARY',
        ];
        if (!allowedPhases.includes(phaseType)) {
          phaseType = 'PRELIMINARY';
        }

        return {
          phaseType,
          legs: p.legs,
          advanceRule: p.advanceRule || this.defaultAdvanceRule(),
        };
      }),
    };
  }

  saveAndContinue() {
    const championship = this.championship();
    if (!championship) return;

    this.loading.set(true);
    const payload = this.buildConfig();

    this.championshipSetupService.updateMatchRules(championship.id, payload).subscribe({
      next: () => {
        this.loading.set(false);
        // We could refresh the store here if needed, but the important is moving forward
        this.router.navigate(['/admin/championships/setup', championship.id]);
      },
      error: (err) => {
        console.error('Erro ao salvar regras de partida', err);
        this.loading.set(false);
      },
    });
  }

  returnToPrevious() {
    const championship = this.championship();
    if (!championship) return;
    this.router.navigate(['/admin/championships/setup', championship.id]);
  }
}
