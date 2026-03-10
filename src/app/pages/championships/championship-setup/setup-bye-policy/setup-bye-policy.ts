import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KnockoutStructureService } from '../../../../services/knockout-structure.service';

interface IPolicyOption {
  id: 'STANDARD' | 'MAX_ENGAGEMENT';
  label: string;
  description: string;
  icon: string;
  colorClass: string;
  tag: string;
}

@Component({
  selector: 'app-setup-bye-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './setup-bye-policy.html',
})
export class SetupByePolicy {
  protected readonly Math = Math;
  private knockoutService = inject(KnockoutStructureService);

  selectedPolicy = input.required<'STANDARD' | 'MAX_ENGAGEMENT'>();
  totalTeams = input<number>(16);
  updatePolicy = output<'STANDARD' | 'MAX_ENGAGEMENT'>();

  // Estado interno para diferenciar visualmente qual card está ativo
  protected visualSelected = signal<'STANDARD' | 'MAX_ENGAGEMENT'>('STANDARD');

  constructor() {
    // Sincroniza o visual com a mudança externa (ex: ao carregar do store)
    effect(
      () => {
        const external = this.selectedPolicy();
        const currentVisual = this.visualSelected();

        if (external !== currentVisual) {
          this.visualSelected.set(external);
        }
      },
      { allowSignalWrites: true },
    );
  }

  policies = computed<IPolicyOption[]>(() => {
    const teams = this.totalTeams();
    const isPowerOfTwo = teams > 1 && (teams & (teams - 1)) === 0;

    const list: IPolicyOption[] = [
      {
        id: 'STANDARD',
        label: isPowerOfTwo ? 'Simetria Perfeita' : 'Simetria Técnica',
        description: isPowerOfTwo
          ? 'Chaveamento ideal. Todos os times iniciam na mesma rodada sem necessidade de folgas.'
          : 'Garante chave perfeitamente simétrica desde a 1ª rodada usando folgas técnicas.',
        icon: isPowerOfTwo ? 'task_alt' : 'balance',
        colorClass: 'info-medium',
        tag: 'STANDARD',
      },
      {
        id: 'MAX_ENGAGEMENT',
        label: 'Participação Máxima',
        description: 'Prioriza colocar o maior número de times em campo na rodada de abertura.',
        icon: 'groups',
        colorClass: 'success-light',
        tag: 'MAX_ENGAGEMENT',
      },
    ];

    return list;
  });

  stats = computed(() => {
    const teams = this.totalTeams();

    // Stats para STANDARD
    const stdByes = this.knockoutService.suggestByes(teams, 'STANDARD');
    const stdTotal = teams + stdByes;

    // Stats para MAX_ENGAGEMENT
    const maxByes = this.knockoutService.suggestByes(teams, 'MAX_ENGAGEMENT');
    const maxGames = Math.floor(teams / 2);

    return {
      standard: { byes: stdByes, total: stdTotal },
      max: { byes: maxByes, games: maxGames },
    };
  });

  selectPolicy(id: 'STANDARD' | 'MAX_ENGAGEMENT') {
    this.visualSelected.set(id);
    this.updatePolicy.emit(id);
  }
}
