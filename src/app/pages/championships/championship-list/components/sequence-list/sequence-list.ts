import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IChampionshipResponse } from '../../../../../interfaces/championship.interface';
import { ITablePagination } from '../../../../../interfaces/table.interface';

@Component({
  selector: 'app-sequence-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sequence-list.html',
  styleUrl: './sequence-list.css',
})
export class SequenceList {
  data = input.required<IChampionshipResponse[]>();
  pagination = input<ITablePagination | undefined>(undefined);

  // Filtros computados por status
  itemsPending = computed(() =>
    this.data().filter((item) => ['DRAFT', 'CONFIGURING'].includes(item.status)),
  );

  itemsActive = computed(() => this.data().filter((item) => item.status === 'ACTIVE'));

  itemsFinished = computed(() => this.data().filter((item) => item.status === 'FINISHED'));

  // Outputs para ações
  onEdit = output<IChampionshipResponse>();
  onDelete = output<IChampionshipResponse>();
  onManage = output<IChampionshipResponse>();

  getStatusConfig(status: string) {
    const configs: any = {
      ACTIVE: {
        label: 'Em Andamento',
        color: 'success-light-green',
        icon: 'emoji_events',
        pulse: true,
      },
      CONFIGURING: {
        label: 'Configurando',
        color: 'alert-yellow',
        icon: 'settings',
        pulse: false,
      },
      DRAFT: {
        label: 'Rascunho',
        color: 'orange-500',
        icon: 'edit_document',
        pulse: false,
      },
      FINISHED: {
        label: 'Finalizado',
        color: 'neutral-gray',
        icon: 'check_circle',
        pulse: false,
      },
    };
    return configs[status] || configs['DRAFT'];
  }

  getModalityColor(modality: string) {
    // Exemplo de cores por modalidade se quiser variar
    return 'info-medium-blue';
  }

  handleEdit(item: IChampionshipResponse) {
    this.onEdit.emit(item);
  }

  handleDelete(item: IChampionshipResponse) {
    this.onDelete.emit(item);
  }

  handleManage(item: IChampionshipResponse) {
    this.onManage.emit(item);
  }

  // Paginação
  goToPage(page: number) {
    this.pagination()?.onPageChange?.(page);
  }

  getPages(): number[] {
    const pag = this.pagination();
    if (!pag) return [];
    return Array.from({ length: pag.totalPages }, (_, i) => i);
  }
}
