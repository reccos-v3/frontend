import { Component, computed, output, signal } from '@angular/core';
import { SetupHeader } from './setup-header/setup-header';
import { SetupSidebar } from './setup-sidebar/setup-sidebar';
import { SetupRules } from './setup-rules/setup-rules';
import { SetupFormat } from './setup-format/setup-format';
import { SetupAddTeams } from './setup-add-teams/setup-add-teams';
import { SetupFinalReview } from './setup-final-review/setup-final-review';
import { SetupStep, StepStatus, IChampionshipSetupRequest, IPhaseConfig } from './setup-types';

import { SetupFormatKnockout } from './setup-format-knockout/setup-format-knockout';

@Component({
  selector: 'app-championship-setup',
  standalone: true,
  imports: [
    SetupHeader,
    SetupSidebar,
    SetupRules,
    SetupFormat,
    SetupFormatKnockout,
    SetupAddTeams,
    SetupFinalReview,
  ],
  templateUrl: './championship-setup.html',
  styleUrl: './championship-setup.css',
})
export class ChampionshipSetup {
  activeComponent = signal<SetupStep>('format');
  setupData = signal<IChampionshipSetupRequest>({
    activate: false,
  });

  stepStatuses = signal<Record<SetupStep, StepStatus>>({
    rules: 'in-progress',
    format: 'pending',
    structure: 'pending',
    teams: 'pending',
    final_review: 'pending',
  });

  progress = computed(() => {
    const statuses = Object.values(this.stepStatuses());
    const completedCount = statuses.filter((s) => s === 'completed').length;
    return Math.round((completedCount / statuses.length) * 100);
  });

  advanced(component: SetupStep) {
    // Check if we should skip structure for round_robin
    if (component === 'structure' && this.setupData().format?.formatType === 'ROUND_ROBIN') {
      this.advanced('teams');
      return;
    }

    // Update previous step to completed if moving forward
    const steps: SetupStep[] = ['rules', 'format', 'structure', 'teams', 'final_review'];
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

  updatePhaseConfigs(configs: IPhaseConfig[]) {
    this.updateData({
      structure: {
        ...(this.setupData().structure || {
          totalTeams: 16,
          groupsCount: 4,
          qualifiedPerGroup: 2,
          knockoutStartPhase: 'QUARTER_FINALS',
          firstPhaseType: 'GROUPS',
        }),
        phaseConfigs: configs,
      },
    });
  }
}
