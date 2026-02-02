import { Component, computed, signal, OnInit, inject, PLATFORM_ID } from '@angular/core';
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
} from '../../../interfaces/setup-types.interface';
import { IPhase } from './setup-sidebar-format/setup-sidebar-format';
import { SetupPeriods } from './setup-periods/setup-periods';
import { ChampionshipService } from '../../../services/championship.service';
import { IChampionshipResponse } from '../../../interfaces/championship.interface';
import { ToastService } from '../../../services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  private router = inject(Router);
  private toastService = inject(ToastService);
  private activateRouter = inject(ActivatedRoute);
  private championshipService = inject(ChampionshipService);

  sidebarPhases = signal<IPhase[]>([]);
  activeComponent = signal<SetupStep>('rules');
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
      this.getSetupChampionship();
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

  getSetupChampionship() {
    const championshipId = this.activateRouter.snapshot.params['id'];
    this.championshipService.getAllSetupByChampionshipId(championshipId).subscribe({
      next: (response: IChampionshipResponse) => {
        this.setupData.set({
          basics: {
            name: response.name,
            modalityId: response.modalityId,
            gender: response.gender,
            type: response.type,
            seasonId: response.season?.id || '',
          },
          rules: response.rules
            ? {
                pointsWin: response.rules.pointsWin,
                pointsDraw: response.rules.pointsDraw,
                pointsLoss: response.rules.pointsLoss,
                hasHomeAway: response.rules.hasHomeAway,
              }
            : undefined,
          format: response.format
            ? {
                formatType: response.format.formatType,
              }
            : undefined,
          structure: response.structure || undefined,
          tiebreaks: response.tiebreaks || undefined,
          championshipPeriod: response.championshipPeriod || undefined,
          registrationPeriod: response.registrationPeriod || undefined,
          activationPolicy: response.activationPolicy || undefined,
          postActivationRules: response.postActivationRules || undefined,
          schedulePreferences: response.schedulePreferences || undefined,
          activate: response.canActivate,
        });

        console.log('setupData initialized:', this.setupData());
      },
      error: (error) => {
        console.error('Erro ao buscar campeonato:', error);
        // this.toastService.showError('Erro ao buscar campeonato');
      },
    });
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
      basics: data.basics
        ? ({ ...(prev.basics || {}), ...data.basics } as IChampionshipSetupRequest['basics'])
        : prev.basics,
      rules: data.rules
        ? ({ ...(prev.rules || {}), ...data.rules } as IChampionshipSetupRequest['rules'])
        : prev.rules,
      format: data.format
        ? ({ ...(prev.format || {}), ...data.format } as IChampionshipSetupRequest['format'])
        : prev.format,
      structure: data.structure
        ? ({
            ...(prev.structure || {}),
            ...data.structure,
          } as IChampionshipSetupRequest['structure'])
        : prev.structure,
      championshipPeriod: data.championshipPeriod
        ? ({
            ...(prev.championshipPeriod || {}),
            ...data.championshipPeriod,
          } as IChampionshipSetupRequest['championshipPeriod'])
        : prev.championshipPeriod,
      registrationPeriod: data.registrationPeriod
        ? ({
            ...(prev.registrationPeriod || {}),
            ...data.registrationPeriod,
          } as IChampionshipSetupRequest['registrationPeriod'])
        : prev.registrationPeriod,
      tiebreaks: data.tiebreaks
        ? ({
            ...(prev.tiebreaks || {}),
            ...data.tiebreaks,
          } as IChampionshipSetupRequest['tiebreaks'])
        : prev.tiebreaks,
      teams: data.teams !== undefined ? data.teams : prev.teams,
      activationPolicy: data.activationPolicy
        ? ({
            ...(prev.activationPolicy || {}),
            ...data.activationPolicy,
          } as IChampionshipSetupRequest['activationPolicy'])
        : prev.activationPolicy,
      postActivationRules: data.postActivationRules
        ? ({
            ...(prev.postActivationRules || {}),
            ...data.postActivationRules,
          } as IChampionshipSetupRequest['postActivationRules'])
        : prev.postActivationRules,
      schedulePreferences: data.schedulePreferences
        ? ({
            ...(prev.schedulePreferences || {}),
            ...data.schedulePreferences,
          } as IChampionshipSetupRequest['schedulePreferences'])
        : prev.schedulePreferences,
    }));
  }

  finalReview() {
    const championshipId = this.activateRouter.snapshot.params['id'];
    this.championshipService
      .updateChampionshipWithSetup(championshipId, this.setupData())
      .subscribe({
        next: (res: IChampionshipResponse) => {
          this.toastService.success('Campeonato atualizado com sucesso!');
          this.router.navigate(['/admin/championships']);
        },
        error: (err) => {
          this.toastService.error('Erro ao atualizar campeonato. Verifique os dados.');
          console.error(err);
        },
      });
  }

  handlePhases(phases: IPhase[]) {
    this.sidebarPhases.set(phases);
    console.log('Phases received in ChampionshipSetup:', phases);
  }
}
