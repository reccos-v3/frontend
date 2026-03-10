/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { PairingStrategiesService } from '../../../../services/pairing-strategies.service';
import { ChampionshipStore } from '../../../../services/championship.store';
import {
  IPairingStrategiesResponse,
  IconKey,
} from '../../../../interfaces/pairing-strategies.interfaces';
import { NgClass, isPlatformBrowser } from '@angular/common';
import { TiebreakService } from '../../../../services/tiebreak.service';
import { ITiebreakResponse } from '../../../../interfaces/tiebreak.interface';
import { bracketModels } from '../../../../utils/setp-modules/bracket-models/bracket-models';
import { SetupFooterButtons } from '../setup-footer-buttons/setup-footer-buttons';
import { Router } from '@angular/router';
import { ChampionshipSetupService } from '../../../../services/championship-setup.service';

@Component({
  selector: 'app-setup-bracket',
  standalone: true,
  imports: [NgClass, SetupFooterButtons],
  templateUrl: './setup-bracket.html',
  styleUrl: './setup-bracket.css',
})
export class SetupBracket implements OnInit {
  private championshipStore = inject(ChampionshipStore);
  private pairingStrategiesService = inject(PairingStrategiesService);
  private championshipSetupService = inject(ChampionshipSetupService);
  private router = inject(Router);
  private tiebreakService = inject(TiebreakService);
  private platformId = inject(PLATFORM_ID);

  // Estados dos Sinais
  pairingStrategies = signal<IPairingStrategiesResponse[]>([]);
  selectedStrategyId = signal<string | null>(null);
  selectedBracketModel = signal<'FIXED_BALANCED' | 'SEQUENTIAL' | 'MANUAL'>('FIXED_BALANCED');
  isDynamicReseeding = signal<boolean>(false);
  loading = signal(false);

  iconsList: string[] = ['trophy', 'format_list_numbered', 'pan_tool_alt'];

  // Modelos de Chave (Estrutura da Árvore)
  bracketModelsList = signal(bracketModels);

  championship = this.championshipStore.championship;

  availableTiebreaks = signal<ITiebreakResponse[]>([]);

  championshipTieBreakers = computed(() => {
    const available = this.availableTiebreaks();
    const tieBreakerOrder = this.championship()?.rules?.tieBreakerOrder;

    if (available.length > 0 && tieBreakerOrder && tieBreakerOrder.length > 0) {
      return tieBreakerOrder
        .map((c: any) => available.find((a) => a.id.toString() === c))
        .filter((t: any): t is ITiebreakResponse => !!t);
    }
    return [];
  });

  // Validação
  isValid = computed(() => {
    return !!this.selectedStrategyId() && !!this.selectedBracketModel();
  });

  // Detecta se a estratégia atual é CROSS
  isCrossStrategy = computed(() => {
    const strategy = this.selectedStrategy();
    return strategy?.iconKey === 'CROSS';
  });

  // Filtra estratégias compatíveis com o formato do campeonato
  filteredStrategies = computed(() => {
    const format = this.championship()?.format?.formatType;
    const allStrategies = this.pairingStrategies();

    if (!format) return [];

    const iconMapping: Record<IconKey, string> = {
      TROPHY: 'trophy',
      CROSS: 'compare_arrows',
      DICE: 'casino',
    };

    return allStrategies
      .filter((s) => {
        if (format === 'KNOCKOUT' || format === 'GROUPS_AND_KNOCKOUT') {
          return (
            s.supportedFormats.includes('KNOCKOUT') ||
            s.supportedFormats.includes('GROUPS_AND_KNOCKOUT')
          );
        }
        return s.supportedFormats.includes(format as any);
      })
      .map((s) => ({
        ...s,
        materialIcon: iconMapping[s.iconKey] || 'help',
      }));
  });

  // Estratégia selecionada
  selectedStrategy = computed(() =>
    this.pairingStrategies().find((s) => s.id === this.selectedStrategyId()),
  );

  ngOnInit() {
    this.getAllTiebreaks();

    this.pairingStrategiesService.getPairingStrategies().subscribe({
      next: (response) => {
        this.pairingStrategies.set(response);

        if (response.length > 0) {
          const firstStrategy = response[0];
          this.selectedStrategyId.set(firstStrategy.id);

          // Ajuste automático se for CROSS
          if (firstStrategy.iconKey === 'CROSS') {
            this.selectedBracketModel.set('FIXED_BALANCED');
          }
        }
      },
      error: (err) => console.error('Erro ao carregar estratégias:', err),
    });
  }

  getAllTiebreaks() {
    if (isPlatformBrowser(this.platformId)) {
      this.tiebreakService.getAllTiebreaks().subscribe({
        next: (response) => {
          this.availableTiebreaks.set(response);
        },
        error: (error) => {
          console.error(error);
        },
      });
    }
  }

  selectStrategy(id: string) {
    this.selectedStrategyId.set(id);

    const strategy = this.pairingStrategies().find((s) => s.id === id);

    // Se estratégia for CROSS força árvore fixa
    if (strategy?.iconKey === 'CROSS') {
      this.selectedBracketModel.set('FIXED_BALANCED');
    }
  }

  selectBracketModel(id: string) {
    if (this.isCrossStrategy() && id !== 'FIXED_BALANCED') return;

    this.selectedBracketModel.set(id as 'FIXED_BALANCED' | 'SEQUENTIAL' | 'MANUAL');

    if (id !== 'SEQUENTIAL') this.isDynamicReseeding.set(false);
  }

  returnHub() {
    const championship = this.championship();
    if (!championship) return;

    this.router.navigate(['/admin/championships/setup', championship.id]);
  }

  saveAndContinue() {
    const currentChampionship = this.championship();
    const strategyId = this.selectedStrategyId();
    const bracketModel = this.selectedBracketModel();

    if (!currentChampionship || !strategyId || !bracketModel) return;

    const payload = {
      strategyId,
      bracketModel,
      isDynamicReseeding: this.isDynamicReseeding(),
    };

    this.loading.set(true);

    this.championshipSetupService.updateBracketConfig(currentChampionship.id, payload).subscribe({
      next: () => {
        this.loading.set(false);

        const currentProgress = this.championship()?.progress;

        this.championshipStore.update({
          ...payload,
          progress: currentProgress ? { ...currentProgress, bracket: true } : undefined,
        });

        this.router.navigate(['/admin/championships/setup', currentChampionship.id]);
      },
      error: (error) => {
        console.error('Erro ao salvar configuração:', error);
        this.loading.set(false);
      },
    });
  }

  toggleDynamicReseeding() {
    if (this.selectedBracketModel() !== 'SEQUENTIAL') return;
    this.isDynamicReseeding.update((v) => !v);
  }

  eventClickConfirmButton(event: 'saveAndContinue' | 'returnHub') {
    if (event === 'saveAndContinue') {
      this.saveAndContinue();
    } else {
      this.returnHub();
    }
  }
}
