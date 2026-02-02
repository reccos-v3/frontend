/**
 * Interface para definir uma coluna da tabela
 */
export interface ITableColumn<T> {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => string | unknown; // Função para renderizar conteúdo customizado
  type?: 'default' | 'toggle';
}

/**
 * Interface para definir uma ação da tabela
 */
export interface ITableAction<T> {
  icon: string;
  label: string;
  action: (row: T) => void;
  variant?: 'default' | 'primary' | 'danger' | 'warning';
  show?: (row: T) => boolean; // Função para determinar se a ação deve ser exibida
}

/**
 * Interface para configuração de paginação
 */
export interface ITablePagination {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

/**
 * Interface para configuração completa da tabela
 */
export interface ITableConfig<T> {
  columns: ITableColumn<T>[];
  actions?: ITableAction<T>[];
  pagination?: ITablePagination;
  showActions?: boolean;
}
