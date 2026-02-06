import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IChampionshipResponse } from '../../../../../interfaces/championship.interface';

export type SetupModuleStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'LOCKED' | 'WARNING';

export interface ISetupModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: SetupModuleStatus;
  statusLabel: string;
  isLocked?: boolean;
  lockMessage?: string;
  actionLabel?: string;
  payload?: IChampionshipResponse;
}

@Component({
  selector: 'app-setup-module-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './setup-module-card.html',
})
export class SetupModuleCard {
  module = input.required<ISetupModule>();
  action = output<string>();

  statusClasses = computed(() => {
    const status = this.module().status;
    switch (status) {
      case 'COMPLETED':
        return 'bg-primary/10 text-primary';
      case 'WARNING':
        return 'bg-warning-yellow/10 text-amber-600';
      case 'PENDING':
        return 'bg-red-100 text-red-500 dark:bg-red-900/40';
      case 'LOCKED':
        return 'bg-slate-200 dark:bg-slate-700 text-slate-500';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  });

  borderClasses = computed(() => {
    const status = this.module().status;
    if (this.module().isLocked) return 'border-slate-200 dark:border-slate-700/50 border-dashed';

    switch (status) {
      case 'WARNING':
        return 'border-warning-yellow/50';
      case 'PENDING':
        return 'border-red-200 dark:border-red-900/30';
      default:
        return 'border-slate-200 dark:border-slate-800';
    }
  });

  buttonClasses = computed(() => {
    const status = this.module().status;
    if (this.module().isLocked)
      return 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed';

    switch (status) {
      case 'WARNING':
        return 'bg-warning-yellow hover:bg-amber-500 text-white';
      case 'COMPLETED':
      default:
        return 'bg-primary hover:bg-primary/90 text-white';
    }
  });

  onAction() {
    this.action.emit(this.module().id);
  }
}
