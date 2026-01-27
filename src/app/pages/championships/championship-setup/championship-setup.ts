import { Component, computed, output, signal, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SetupHeader } from './setup-header/setup-header';
import { SetupSidebar } from './setup-sidebar/setup-sidebar';
import { SetupRules } from './setup-rules/setup-rules';
import { SetupFormat } from './setup-format/setup-format';
import { SetupAddTeams } from './setup-add-teams/setup-add-teams';
import { SetupFinalReview } from './setup-final-review/setup-final-review';
import {
  SetupStep,
  StepStatus,
  IChampionshipSetupRequest,
  IPhaseConfig,
} from '../../../interfaces/setup-types.interface';
import { IPhase } from './setup-sidebar-format/setup-sidebar-format';
import { SetupPeriods } from './setup-periods/setup-periods';

@Component({
  selector: 'app-championship-setup',
  standalone: true,
  imports: [
    SetupHeader,
    SetupSidebar,
    SetupRules,
    SetupFormat,
    SetupAddTeams,
    SetupFinalReview,
    SetupPeriods,
  ],
  templateUrl: './championship-setup.html',
  styleUrl: './championship-setup.css',
})
export class ChampionshipSetup implements OnInit {
  private platformId = inject(PLATFORM_ID);
  activeComponent = signal<SetupStep>('periods');
  sidebarPhases = signal<IPhase[]>([]);
  setupData = signal<IChampionshipSetupRequest>({
    activate: false,
  });

  stepStatuses = signal<Record<SetupStep, StepStatus>>({
    rules: 'in-progress',
    periods: 'pending',
    format: 'pending',
    teams: 'pending',
    final_review: 'pending',
  });

  progress = computed(() => {
    const statuses = Object.values(this.stepStatuses());
    const completedCount = statuses.filter((s) => s === 'completed').length;
    return Math.round((completedCount / statuses.length) * 100);
  });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const storedBasics = localStorage.getItem('championshipSetupBasics');
      if (storedBasics) {
        try {
          const basics = JSON.parse(storedBasics);
          this.updateData({ basics });
          // Limpar após o uso para evitar dados persistentes indesejados
          sessionStorage.removeItem('championshipSetupBasics');
        } catch (e) {
          console.error('Erro ao processar dados do sessionStorage:', e);
        }
      }
    }
  }

  advanced(component: SetupStep) {
    // Update previous step to completed if moving forward
    const steps: SetupStep[] = ['rules', 'periods', 'format', 'teams', 'final_review'];
    const currentIndex = steps.indexOf(this.activeComponent());
    const nextIndex = steps.indexOf(component);

    if (nextIndex > currentIndex) {
      this.stepStatuses.update((prev) => ({
        ...prev,
        [this.activeComponent()]: 'completed',
        [component]: prev[component] === 'completed' ? 'completed' : 'in-progress',
      }));
    }

    this.activeComponent.set(component);
  }

  updateData(data: Partial<IChampionshipSetupRequest>) {
    this.setupData.update((prev) => ({
      ...prev,
      ...data,
      basics: data.basics ? ({ ...(prev.basics || {}), ...data.basics } as any) : prev.basics,
      rules: data.rules ? ({ ...(prev.rules || {}), ...data.rules } as any) : prev.rules,
      format: data.format ? ({ ...(prev.format || {}), ...data.format } as any) : prev.format,
      structure: data.structure
        ? ({ ...(prev.structure || {}), ...data.structure } as any)
        : prev.structure,
      tiebreaks: data.tiebreaks
        ? ({ ...(prev.tiebreaks || {}), ...data.tiebreaks } as any)
        : prev.tiebreaks,
      teams: data.teams ? ({ ...(prev.teams || {}), ...data.teams } as any) : prev.teams,
    }));
  }

  finalReview() {
    console.log('this.setupData()', this.setupData());
  }

  handlePhases(phases: IPhase[]) {
    this.sidebarPhases.set(phases);
    console.log('Phases received in ChampionshipSetup:', phases);
  }
}
