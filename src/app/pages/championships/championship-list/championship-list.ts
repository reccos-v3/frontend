import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableList } from '../../../components/table-list/table-list';
import { SequenceList } from './components/sequence-list/sequence-list';
import { StepList } from './components/step-list/step-list';
import { ITableColumn, ITableAction } from '../../../interfaces/table.interface';

export interface IChampionship {
  id: string;
  name: string;
  modality: string;
  format: string;
  status: 'ACTIVE' | 'CONFIG' | 'DRAFT' | 'FINISHED';
  teamsCount: number;
  icon?: string;
}

export type ViewMode = 'table' | 'sequence' | 'step';

@Component({
  selector: 'app-championship-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableList, SequenceList, StepList],
  templateUrl: './championship-list.html',
  styleUrl: './championship-list.css',
})
export class ChampionshipList {
  // Controle de visualização
  currentView = signal<ViewMode>('table');

  // Dados mock
  data = signal<IChampionship[]>([
    {
      id: '8821',
      name: 'Copa Verão 2024',
      modality: 'Futsal',
      format: 'Mata-mata',
      status: 'ACTIVE',
      teamsCount: 32,
      icon: 'CV',
    },
    {
      id: '9102',
      name: 'Liga Estadual Sub-20',
      modality: 'Futebol',
      format: 'Pontos Corridos',
      status: 'CONFIG',
      teamsCount: 16,
      icon: 'LE',
    },
    {
      id: '---',
      name: 'Torneio Início',
      modality: 'Vôlei',
      format: 'Misto',
      status: 'DRAFT',
      teamsCount: 0,
      icon: 'TI',
    },
    {
      id: '8550',
      name: 'Supercopa Regional',
      modality: 'Basquete',
      format: 'Mata-mata',
      status: 'FINISHED',
      teamsCount: 12,
      icon: 'SR',
    },
    {
      id: '9234',
      name: 'Copa do Interior',
      modality: 'Futebol',
      format: 'Pontos Corridos',
      status: 'ACTIVE',
      teamsCount: 24,
      icon: 'CI',
    },
    {
      id: '7891',
      name: 'Torneio de Verão',
      modality: 'Futsal',
      format: 'Mata-mata',
      status: 'CONFIG',
      teamsCount: 8,
      icon: 'TV',
    },
  ]);

  // Configuração das colunas
  columns = signal<ITableColumn<IChampionship>[]>([
    {
      key: 'name',
      label: 'Nome do Campeonato',
      width: '35%',
      render: (row) => this.renderChampionshipName(row),
    },
    {
      key: 'modality',
      label: 'Modalidade',
      width: '15%',
      render: (row) => this.renderModality(row),
    },
    {
      key: 'format',
      label: 'Formato',
      width: '15%',
      render: (row) => this.renderFormat(row),
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (row) => this.renderStatus(row),
    },
  ]);

  // Configuração das ações
  actions = signal<ITableAction<IChampionship>[]>([
    {
      icon: 'visibility',
      label: 'Ver Detalhes',
      variant: 'primary',
      action: (row) => this.viewChampionship(row),
    },
    {
      icon: 'edit',
      label: 'Editar',
      variant: 'default',
      action: (row) => this.editChampionship(row),
    },
    {
      icon: 'more_vert',
      label: 'Mais Opções',
      variant: 'default',
      action: (row) => this.showMoreOptions(row),
    },
  ]);

  // Métodos de renderização
  renderChampionshipName(row: IChampionship): string {
    const gradientColors: { [key: string]: string } = {
      ACTIVE: 'from-blue-500 to-indigo-600',
      CONFIG: 'from-green-500 to-emerald-600',
      DRAFT: 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600',
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
          ${row.icon || row.name.substring(0, 2).toUpperCase()}
        </div>
        <div class="flex flex-col">
          <span class="font-semibold text-[#111814] dark:text-white text-base group-hover:text-primary transition-colors">
            ${row.name}
          </span>
          <span class="text-xs text-text-muted">ID: #${row.id} • ${row.teamsCount} Equipes</span>
        </div>
      </div>
    `;
  }

  renderModality(row: IChampionship): string {
    const modalityIcons: { [key: string]: string } = {
      Futsal: 'sports_soccer',
      Futebol: 'sports_soccer',
      Vôlei: 'sports_volleyball',
      Basquete: 'sports_basketball',
      Tênis: 'sports_tennis',
    };

    const icon = modalityIcons[row.modality] || 'sports';
    return `
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-gray-400 text-[20px]">${icon}</span>
        <span class="text-sm text-[#111814] dark:text-gray-200">${row.modality}</span>
      </div>
    `;
  }

  renderFormat(row: IChampionship): string {
    return `
      <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
        ${row.format}
      </span>
    `;
  }

  renderStatus(row: IChampionship): string {
    const statusConfig: {
      [key: string]: { bg: string; text: string; border: string; dot: string; icon?: string };
    } = {
      ACTIVE: {
        bg: 'bg-primary/10',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-primary/20',
        dot: 'bg-green-500',
      },
      CONFIG: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800/30',
        dot: 'bg-yellow-500',
      },
      DRAFT: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-700',
        dot: 'bg-gray-400',
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
    const labels: { [key: string]: string } = {
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

  // Métodos de ação
  viewChampionship(row: IChampionship): void {
    console.log('Ver campeonato:', row);
    // TODO: Navegar para detalhes do campeonato
  }

  editChampionship(row: IChampionship): void {
    console.log('Editar campeonato:', row);
    // TODO: Navegar para edição do campeonato
  }

  showMoreOptions(row: IChampionship): void {
    console.log('Mais opções:', row);
    // TODO: Abrir menu de opções
  }

  // Métodos para trocar visualização
  setView(view: ViewMode): void {
    this.currentView.set(view);
  }

  isActiveView(view: ViewMode): boolean {
    return this.currentView() === view;
  }
}
