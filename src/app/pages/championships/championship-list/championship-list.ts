import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TableList } from '../../../components/table-list/table-list';
import { SequenceList } from './components/sequence-list/sequence-list';
import { StepList } from './components/step-list/step-list';
import { ITableColumn, ITableAction, ITablePagination } from '../../../interfaces/table.interface';
import { ChampionshipService } from '../../../services/championship.service';
import {
  IChampionshipResponse,
  IChampionshipStatisticsCard,
} from '../../../interfaces/championship.interface';
import { IPage } from '../../../interfaces/page.interface';
import { ToastService } from '../../../services/toast.service';
export type ViewMode = 'table' | 'sequence' | 'step';

@Component({
  selector: 'app-championship-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableList, SequenceList, StepList],
  templateUrl: './championship-list.html',
  styleUrl: './championship-list.css',
})
export class ChampionshipList implements OnInit {
  private router = inject(Router);
  private championshipService = inject(ChampionshipService);
  private toastService = inject(ToastService);

  // Controle de visualização
  currentView = signal<ViewMode>('table');
  statistics = signal<IChampionshipStatisticsCard>({
    totalChampionships: 0,
    totalInProgress: 0,
    totalDrafts: 0,
    totalTeams: 0,
  });

  filtersFlag = {
    status: '',
    modalityId: '',
  };

  statCards = computed(() => [
    {
      label: 'Total de Campeonatos',
      value: this.statistics().totalChampionships,
      icon: 'trophy',
      bgClass: 'bg-blue-50 dark:bg-blue-900/20',
      iconClass: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Em Andamento',
      value: this.statistics().totalInProgress,
      icon: 'play_circle',
      bgClass: 'bg-primary/10',
      iconClass: 'text-primary-dark',
    },
    {
      label: 'Rascunhos',
      value: this.statistics().totalDrafts,
      icon: 'edit_document',
      bgClass: 'bg-orange-50 dark:bg-orange-900/20',
      iconClass: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: 'Total de Equipes',
      value: this.statistics().totalTeams,
      icon: 'groups',
      bgClass: 'bg-purple-50 dark:bg-purple-900/20',
      iconClass: 'text-purple-600 dark:text-purple-400',
    },
  ]);

  // Dados mock
  data = signal<IChampionshipResponse[]>([]);

  // Configuração das colunas
  columns = signal<ITableColumn<IChampionshipResponse>[]>([
    {
      key: 'name',
      label: 'Campeonato',
      render: (row) => this.renderChampionshipName(row),
    },
    {
      key: 'modality',
      label: 'Modalidade',
      render: (row) => this.renderModality(row),
    },
    {
      key: 'format',
      label: 'Formato',
      render: (row) => this.renderFormat(row),
    },
    {
      key: 'isActive',
      label: 'Ativação',
      type: 'toggle',
      align: 'center',
      render: (row) => row.status === 'ACTIVE',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => this.renderStatus(row),
    },
  ]);

  // Paginação
  pagination = signal<ITablePagination | undefined>(undefined);

  // Modal de Confirmação
  confirmationModal = signal({
    isOpen: false,
    title: '',
    message: '',
    row: null as IChampionshipResponse | null,
    targetStatus: false,
  });

  page: {
    page: number;
    size: number;
  } = {
    page: 0,
    size: 0,
  };

  // Configuração das ações
  actions = signal<ITableAction<IChampionshipResponse>[]>([
    {
      icon: 'edit',
      label: 'Editar',
      variant: 'default',
      action: (row) => this.editChampionship(row),
    },
    {
      icon: 'delete',
      label: 'Excluir',
      variant: 'default',
      action: (row) => this.deleteChampionship(row),
    },
  ]);

  ngOnInit(): void {
    this.getChampionships();
  }

  // Métodos de renderização
  renderChampionshipName(row: IChampionshipResponse): string {
    const gradientColors: Record<string, string> = {
      ACTIVE: 'from-blue-500 to-indigo-600',
      CONFIG: 'from-green-500 to-emerald-600',
      DRAFT: 'bg-orange-100 dark:bg-orange-700 border border-orange-200 dark:border-orange-600',
      FINISHED: 'from-orange-500 to-red-600',
    };

    const colors = gradientColors[row.status] || gradientColors['DRAFT'];
    const isDraft = row.status === 'DRAFT';
    const iconClasses = isDraft
      ? `size-10 rounded-lg ${colors} flex items-center justify-center shadow-inner text-gray-400 dark:text-gray-500 font-bold text-xs`
      : `size-10 rounded-lg bg-gradient-to-br ${colors} flex items-center justify-center shadow-sm text-white font-bold text-xs`;

    return `
      <div class="flex items-center gap-3">
        <div class="${iconClasses}">
          ${row.name.substring(0, 2).toUpperCase()}
        </div>
        <div class="flex flex-col">
          <span class="font-semibold text-[#111814] dark:text-white text-base group-hover:text-primary transition-colors">
            ${row.name}
          </span>
          <span class="text-xs text-slate-500">${row.teamsCount} Equipes • ${
            row.gender.charAt(0).toUpperCase() + row.gender.slice(1).toLocaleLowerCase()
          }</span>
        </div>
      </div>
    `;
  }

  renderModality(row: IChampionshipResponse): string {
    const modalityIcons: Record<string, string> = {
      Futsal: 'sports_soccer',
      Futebol: 'sports_soccer',
      Vôlei: 'sports_volleyball',
      Basquete: 'sports_basketball',
      Tênis: 'sports_tennis',
    };

    const icon = modalityIcons[row.modality.name] || 'sports';
    return `
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-gray-400 text-[20px]">${icon}</span>
        <span class="text-sm text-[#111814] dark:text-gray-200">${row.modality.name}</span>
      </div>
    `;
  }

  getFormatName(formatType: string): string {
    switch (formatType) {
      case 'KNOCKOUT':
        return 'Mata-Mata';
      case 'GROUPS_AND_KNOCKOUT':
        return 'Grupos + Mata-Mata';
      case 'POINTS':
        return 'Pontos corridos';
      default:
        return 'Não definido';
    }
  }

  renderFormat(row: IChampionshipResponse): string {
    const formatType = row.format?.formatType;
    const formatName = this.getFormatName(formatType || 'Não definido');

    const colors: Record<string, string> = {
      KNOCKOUT:
        'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
      GROUPS_AND_KNOCKOUT:
        'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
      POINTS:
        'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
    };

    const colorClass =
      formatType && colors[formatType]
        ? colors[formatType]
        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';

    return `
      <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${colorClass}">
        ${formatName}
      </span>
    `;
  }

  renderStatus(row: IChampionshipResponse): string {
    const statusConfig: Record<
      string,
      { bg: string; text: string; border: string; dot: string; icon?: string }
    > = {
      ACTIVE: {
        bg: 'bg-primary/10',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-primary/20',
        dot: 'bg-green-500',
      },
      CONFIGURING: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800/30',
        dot: 'bg-yellow-500',
      },
      DRAFT: {
        bg: 'bg-orange-100 dark:bg-orange-800',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-700',
        dot: 'bg-orange-400',
      },
      FINISHED: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800/30',
        dot: 'bg-blue-500',
        icon: 'check',
      },
    };

    const config = statusConfig[row.status] || statusConfig['DRAFT'];
    const labels: Record<string, string> = {
      ACTIVE: 'Ativo',
      CONFIG: 'Configuração',
      DRAFT: 'Rascunho',
      FINISHED: 'Finalizado',
    };

    const iconHtml = config.icon
      ? `<span class="material-symbols-outlined text-[14px]">${config.icon}</span>`
      : `<span class="size-1.5 rounded-full ${config.dot} ${
          row.status === 'ACTIVE' ? 'animate-pulse' : ''
        }"></span>`;

    return `
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
        config.bg
      } ${config.text} border ${config.border}">
        ${iconHtml}
        ${labels[row.status]}
      </span>
    `;
  }

  getChampionships() {
    this.championshipService
      .getChampionshipsByFederation(
        this.page.page,
        this.page.size,
        this.filtersFlag.status,
        this.filtersFlag.modalityId,
      )
      .subscribe({
        next: (response) => {
          this.data.set(response.content);
          this.pagination.set({
            currentPage: response.number,
            pageSize: response.size,
            totalElements: response.totalElements,
            totalPages: response.totalPages,
            onPageChange: () => this.getChampionships(),
          });
          this.calculateStatistics(response);
        },
        error: (error) => {
          console.error('Erro ao buscar campeonatos:', error);
        },
      });
  }

  calculateStatistics(response: IPage<IChampionshipResponse>) {
    const totalChampionships = response.totalElements;
    const totalInProgress = response.content.filter(
      (championship) => championship.status === 'IN_PROGRESS',
    ).length;
    const totalDrafts = response.content.filter(
      (championship) => championship.status === 'DRAFT',
    ).length;
    const totalTeams = response.content.reduce(
      (total, championship) => total + championship.teamsCount,
      0,
    );

    this.statistics.set({
      totalChampionships,
      totalInProgress,
      totalDrafts,
      totalTeams,
    });
  }

  // Métodos de ação
  viewChampionship(row: IChampionshipResponse): void {
    console.log('Ver campeonato:', row);
    // Para campeonatos ativos, poderíamos navegar para um dashboard de gerenciamento
    // Para rascunhos, navegamos para o hub de setup
    if (row.status === 'ACTIVE') {
      // this.router.navigate(['/championships/manage', row.id]);
    } else {
      this.router.navigate(['/admin/championships/setup', row.id]);
    }
  }

  editChampionship(row: IChampionshipResponse): void {
    this.router.navigate(['/admin/championships/setup', row.id]);
  }

  deleteChampionship(row: IChampionshipResponse): void {
    if (confirm(`Tem certeza que deseja excluir o campeonato "${row.name}"?`)) {
      this.championshipService.deleteChampionship(row.id).subscribe({
        next: () => {
          this.toastService.success('Campeonato excluído com sucesso!');
          this.page.page = this.pagination()?.currentPage || 0;
          this.getChampionships();
        },
        error: (error) => {
          this.toastService.error('Erro ao excluir campeonato.');
          console.error(error);
        },
      });
    }
  }

  handleToggle(event: {
    row: IChampionshipResponse;
    column: ITableColumn<IChampionshipResponse>;
    checked: boolean;
  }) {
    // Prevent immediate change visual effect if possible, or just open modal
    const { row, checked } = event;
    // User disse: ACTIVE = true, outros = false.
    // Vamos assumir que desativar vai para INACTIVE.

    this.confirmationModal.set({
      isOpen: true,
      title: checked ? 'Ativar Campeonato' : 'Desativar Campeonato',
      message: `Tem certeza que deseja ${checked ? 'ativar' : 'desativar'} o campeonato "${row.name}"?`,
      row: row,
      targetStatus: checked,
    });
  }

  confirmStatusChange() {
    const { row, targetStatus } = this.confirmationModal();
    if (!row) return;

    const newStatus = targetStatus ? 'ACTIVE' : 'INACTIVE';

    this.championshipService.updateStatus(row.id, newStatus).subscribe({
      next: () => {
        this.toastService.success(
          `Campeonato ${targetStatus ? 'ativado' : 'desativado'} com sucesso!`,
        );
        this.page.page = this.pagination()?.currentPage || 0;
        this.getChampionships();
        this.closeModal();
      },
      error: (error) => {
        this.toastService.error('Erro ao atualizar status do campeonato.');
        console.error(error);
        this.closeModal();
      },
    });
  }

  closeModal() {
    this.confirmationModal.update((curr) => ({ ...curr, isOpen: false }));
  }

  // Métodos para trocar visualização
  setView(view: ViewMode): void {
    this.currentView.set(view);
  }

  isActiveView(view: ViewMode): boolean {
    return this.currentView() === view;
  }
}
