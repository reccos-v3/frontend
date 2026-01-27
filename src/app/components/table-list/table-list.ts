import { Component, input, output, inject, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ITableColumn, ITableAction, ITablePagination } from '../../interfaces/table.interface';

@Component({
  selector: 'app-table-list',
  imports: [CommonModule],
  templateUrl: './table-list.html',
  styleUrl: './table-list.css',
})
export class TableList<T = any> {
  private sanitizer = inject(DomSanitizer);

  // Inputs obrigatórios
  columns = input.required<ITableColumn<T>[]>();
  data = input.required<T[]>();

  // Inputs opcionais
  actions = input<ITableAction<T>[]>([]);
  pagination = input<ITablePagination | undefined>(undefined);
  isLoading = input<boolean>(false);
  emptyMessage = input<string>('Nenhum registro encontrado.');

  // Outputs
  onActionClick = output<{ action: ITableAction<T>; row: T }>();

  /**
   * Verifica se deve exibir a coluna de ações
   */
  hasActions(): boolean {
    return this.actions().length > 0;
  }

  /**
   * Verifica se deve exibir a paginação
   */
  hasPagination(): boolean {
    return this.pagination() !== undefined;
  }

  /**
   * Obtém o texto de paginação
   */
  getPaginationText(): string {
    const pag = this.pagination();
    if (!pag) return '';

    const start = pag.currentPage * pag.pageSize + 1;
    const end = Math.min((pag.currentPage + 1) * pag.pageSize, pag.totalElements);

    return `Mostrando ${start} até ${end} de ${pag.totalElements} resultados`;
  }

  /**
   * Verifica se pode ir para página anterior
   */
  canGoPrevious(): boolean {
    const pag = this.pagination();
    return pag ? pag.currentPage > 0 : false;
  }

  /**
   * Verifica se pode ir para próxima página
   */
  canGoNext(): boolean {
    const pag = this.pagination();
    return pag ? pag.currentPage < pag.totalPages - 1 : false;
  }

  /**
   * Obtém as páginas para exibir
   */
  getPages(): number[] {
    const pag = this.pagination();
    if (!pag) return [];

    const pages: number[] = [];
    const totalPages = pag.totalPages;
    const currentPage = pag.currentPage;

    // Mostra até 5 páginas
    let start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages, start + 5);

    // Ajusta o início se estiver no final
    if (end - start < 5) {
      start = Math.max(0, end - 5);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Vai para página anterior
   */
  goToPrevious(): void {
    const pag = this.pagination();
    if (pag && pag.onPageChange && this.canGoPrevious()) {
      pag.onPageChange(pag.currentPage - 1);
    }
  }

  /**
   * Vai para próxima página
   */
  goToNext(): void {
    const pag = this.pagination();
    if (pag && pag.onPageChange && this.canGoNext()) {
      pag.onPageChange(pag.currentPage + 1);
    }
  }

  /**
   * Vai para uma página específica
   */
  goToPage(page: number): void {
    const pag = this.pagination();
    if (pag && pag.onPageChange) {
      pag.onPageChange(page);
    }
  }

  /**
   * Executa uma ação
   */
  executeAction(action: ITableAction<T>, row: T): void {
    if (action.show && !action.show(row)) {
      return;
    }
    this.onActionClick.emit({ action, row });
    action.action(row);
  }

  /**
   * Verifica se deve mostrar a ação
   */
  shouldShowAction(action: ITableAction<T>, row: T): boolean {
    return !action.show || action.show(row);
  }

  /**
   * Obtém classes CSS para a ação baseado na variante
   */
  getActionClasses(variant = 'default'): string {
    const baseClasses = 'p-1.5 rounded-md text-text-muted transition-colors';

    switch (variant) {
      case 'primary':
        return `${baseClasses} hover:text-primary hover:bg-primary/10`;
      case 'danger':
        return `${baseClasses} hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`;
      case 'warning':
        return `${baseClasses} hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20`;
      default:
        return `${baseClasses} hover:text-[#111814] hover:bg-gray-100 dark:hover:bg-gray-700`;
    }
  }

  /**
   * Renderiza o conteúdo de uma célula como HTML seguro
   */
  renderCell(column: ITableColumn<T>, row: T): SafeHtml | string {
    if (column.render) {
      const result = column.render(row);
      // Se retornar uma string HTML, sanitiza e retorna
      if (typeof result === 'string') {
        return this.sanitizer.sanitize(SecurityContext.HTML, result) || result;
      }
      // Se retornar outro tipo, converte para string
      return String(result ?? '');
    }
    // Fallback: tenta acessar a propriedade diretamente
    return (row as any)[column.key] ?? '';
  }

  /**
   * Verifica se o conteúdo é HTML (para usar innerHTML)
   */
  isHtmlContent(column: ITableColumn<T>): boolean {
    return !!column.render;
  }
}
