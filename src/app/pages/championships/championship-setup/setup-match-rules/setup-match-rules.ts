import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppAlert } from '../../../../components/alert/alert';
import { IPhaseConfig, getKnockoutPhaseKey } from '../../../../interfaces/setup-types.interface';
import { ChampionshipStore } from '../../../../services/championship.store';
import { ChampionshipSetupService } from '../../../../services/championship-setup.service';
import { IMatchRulesRequest } from '../../../../interfaces/championship-setup.interface';
import { SetupFooterButtons } from '../setup-footer-buttons/setup-footer-buttons';
import { SetupSidebarFormat } from '../setup-sidebar-format/setup-sidebar-format';
import { KnockoutPhaseGeneratorService } from '../../../../services/knockout-phase-generator.service';

@Component({
  selector: 'app-setup-match-rules',
  standalone: true,
  imports: [CommonModule, AppAlert, SetupFooterButtons, SetupSidebarFormat],
  templateUrl: './setup-match-rules.html',
  styleUrl: './setup-match-rules.css',
})
export class SetupMatchRules {
  private championshipStore = inject(ChampionshipStore);
  private phaseGenerator = inject(KnockoutPhaseGeneratorService);
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
    const champ = this.championship();
    if (!champ?.structure?.knockoutStartPhase) return [];

    const policy = (champ.structure.byePolicy as 'STANDARD' | 'MAX_ENGAGEMENT') ?? 'STANDARD';

    return this.phaseGenerator.generatePhases(policy, {
      totalTeams: champ.structure.totalTeams,
      byesCount: champ.structure.byesCount,
      knockoutStartPhase: champ.structure.knockoutStartPhase,
      existingPhases: champ.structure.knockoutConfig?.phases || [],
    });
  });

  policyLabel = computed(() => {
    const policy = this.championship()?.structure?.byePolicy;
    if (policy === 'MAX_ENGAGEMENT') return 'Engajamento Máximo';
    if (policy === 'STANDARD') return 'Padrão / Tradicional';
    return 'Não definido';
  });

  // Exemplo: computed para mostrar byes/folgas de forma contextual
  byesDescription = computed(() => {
    const policy = this.championship()?.structure?.byePolicy;
    const byes = this.championship()?.structure?.byesCount || 0;

    if (policy === 'MAX_ENGAGEMENT') {
      return byes <= 1
        ? 'Mínimas ou zero folgas na estreia'
        : `${byes} folgas (ver fase de ajuste)`;
    }
    return `${byes} folgas na primeira rodada`;
  });

  hasPreliminary = computed(() => this.phases().some((p) => p.isPreliminary));

  totalTeams = computed(() => this.championship()?.structure?.totalTeams || 0);
  byesCount = computed(() => this.championship()?.structure?.byesCount || 0);

  isValid = computed(() => this.phases().every((p) => !this.isSelectionInvalid(p)));

  /**
   * Fases com overrides aplicados — passadas ao sidebar para refletir o estado atual
   */
  phasesForSidebar = computed<IPhaseConfig[]>(() => {
    const overrides = this.overrides();
    return this.phases().map((phase) => {
      const override = overrides[phase.order];
      if (!override) return phase;
      return {
        ...phase,
        legs: override.legs ?? phase.legs,
        matchType: override.matchType ?? phase.matchType,
        advanceRule: override.advanceRule ?? phase.advanceRule,
      };
    });
  });

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
        this.championshipStore.update({
          structure: championship.structure
            ? {
                ...championship.structure,
                knockoutConfig: {
                  defaultLegs: payload.defaultLegs,
                  defaultAdvanceRule: payload.defaultAdvanceRule,
                  phases: payload.phases.map((p, idx) => ({
                    phaseOrder: this.phases()[idx]?.order || idx + 1,
                    legs: p.legs,
                    advanceRule: p.advanceRule,
                    phaseType: p.phaseType,
                  })),
                },
              }
            : null,
          progress: championship.progress
            ? { ...championship.progress, matchRules: true }
            : undefined,
        });
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

  eventClickConfirmButton(event: 'saveAndContinue' | 'returnHub') {
    if (event === 'saveAndContinue') {
      this.saveAndContinue();
    } else {
      this.returnToPrevious();
    }
  }
}
